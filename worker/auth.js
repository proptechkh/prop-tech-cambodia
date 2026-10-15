import { jsonResponse, errorResponse, generateId, generateOTP, sanitizeString, validateEmail, validatePhone, getAuthToken } from './utils.js';

// Simple JWT implementation using Web Crypto API
export async function createToken(payload, secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 }));
  const signature = await hmacSHA256(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

export async function verifyToken(token, secret) {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSig = await hmacSHA256(`${header}.${body}`, secret);
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(atob(body));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

async function hmacSHA256(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function handleAuth(request, env, path, method) {
  // POST /api/auth/signup - Create account
  if (path === '/api/auth/signup' && method === 'POST') {
    return handleSignup(request, env);
  }

  // POST /api/auth/login - Login
  if (path === '/api/auth/login' && method === 'POST') {
    return handleLogin(request, env);
  }

  // POST /api/auth/verify-otp - Verify OTP
  if (path === '/api/auth/verify-otp' && method === 'POST') {
    return handleVerifyOTP(request, env);
  }

  // POST /api/auth/logout - Logout
  if (path === '/api/auth/logout' && method === 'POST') {
    return handleLogout(request, env);
  }

  // GET /api/auth/me - Get current user
  if (path === '/api/auth/me' && method === 'GET') {
    return handleMe(request, env);
  }

  // POST /api/auth/refresh - Refresh token
  if (path === '/api/auth/refresh' && method === 'POST') {
    return handleRefresh(request, env);
  }

  return errorResponse('Auth route not found', 404);
}

async function handleSignup(request, env) {
  const body = await request.json();
  const { name, email, phone, password, role } = body;

  if (!name || !email || !phone || !password) {
    return errorResponse('Name, email, phone and password are required');
  }

  if (!validateEmail(email)) {
    return errorResponse('Invalid email address');
  }

  if (!validatePhone(phone)) {
    return errorResponse('Invalid phone number');
  }

  if (password.length < 6) {
    return errorResponse('Password must be at least 6 characters');
  }

  // Check if user exists
  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ? OR phone = ?'
  ).bind(email, phone).first();

  if (existing) {
    return errorResponse('User with this email or phone already exists', 409);
  }

  const userId = generateId();
  const otp = generateOTP();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  await env.DB.prepare(
    `INSERT INTO users (id, name, email, phone, password_hash, role, otp, otp_expires, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(userId, sanitizeString(name, 100), email, phone, await hashPassword(password), role || 'owner', otp, otpExpiry, Date.now()).run();

  // Store OTP in KV for verification
  await env.KV.put(`otp:${userId}`, JSON.stringify({ otp, expires: otpExpiry }), { expirationTtl: 600 });

  // In production, send OTP via email/SMS here
  // For now, return it in response (development only)
  return jsonResponse({
    message: 'Account created. Please verify with OTP.',
    userId,
    // Remove in production:
    devOtp: otp,
  }, 201);
}

async function handleLogin(request, env) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return errorResponse('Email and password are required');
  }

  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return errorResponse('Invalid email or password', 401);
  }

  if (user.status === 'suspended') {
    return errorResponse('Account suspended', 403);
  }

  const token = await createToken({ userId: user.id, role: user.role }, env.JWT_SECRET);

  return jsonResponse({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
}

async function handleVerifyOTP(request, env) {
  const body = await request.json();
  const { userId, otp } = body;

  if (!userId || !otp) {
    return errorResponse('User ID and OTP are required');
  }

  const stored = await env.KV.get(`otp:${userId}`);
  if (!stored) {
    return errorResponse('OTP expired or invalid', 410);
  }

  const { otp: storedOtp, expires } = JSON.parse(stored);

  if (Date.now() > expires) {
    return errorResponse('OTP expired', 410);
  }

  if (otp !== storedOtp) {
    return errorResponse('Invalid OTP', 401);
  }

  // Mark user as verified
  await env.DB.prepare('UPDATE users SET verified = 1 WHERE id = ?').bind(userId).run();
  await env.KV.delete(`otp:${userId}`);

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
  const token = await createToken({ userId: user.id, role: user.role }, env.JWT_SECRET);

  return jsonResponse({
    message: 'Verified successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
}

async function handleLogout(request, env) {
  const token = getAuthToken(request);
  if (token) {
    // Blacklist token
    await env.KV.put(`blacklist:${token}`, '1', { expirationTtl: 86400 });
  }
  return jsonResponse({ message: 'Logged out' });
}

async function handleMe(request, env) {
  const token = getAuthToken(request);
  if (!token) return errorResponse('Unauthorized', 401);

  const payload = await verifyToken(token, env.JWT_SECRET);
  if (!payload) return errorResponse('Invalid token', 401);

  const user = await env.DB.prepare(
    'SELECT id, name, email, phone, role, verified, created_at FROM users WHERE id = ?'
  ).bind(payload.userId).first();

  if (!user) return errorResponse('User not found', 404);

  return jsonResponse({ user });
}

async function handleRefresh(request, env) {
  const token = getAuthToken(request);
  if (!token) return errorResponse('Unauthorized', 401);

  const payload = await verifyToken(token, env.JWT_SECRET);
  if (!payload) return errorResponse('Invalid token', 401);

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.userId).first();
  if (!user) return errorResponse('User not found', 404);

  const newToken = await createToken({ userId: user.id, role: user.role }, env.JWT_SECRET);

  return jsonResponse({ token: newToken });
}

// Helper to hash password (simplified - use bcrypt in production)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'prop-tech-salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function verifyPassword(password, hash) {
  return (await hashPassword(password)) === hash;
}
