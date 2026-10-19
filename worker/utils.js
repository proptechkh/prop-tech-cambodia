// Utility functions for the Worker

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function rateLimit(kv, clientIP, path, maxRequests = 60) {
  const key = `ratelimit:${clientIP}:${path}`;
  const now = Date.now();
  const windowMs = 60 * 1000;

  const data = await kv.get(key);
  let requests = data ? JSON.parse(data) : { count: 0, resetAt: now + windowMs };

  if (now > requests.resetAt) {
    requests = { count: 0, resetAt: now + windowMs };
  }

  requests.count++;

  await kv.put(key, JSON.stringify(requests), { expirationTtl: Math.ceil(windowMs / 1000) });

  return { allowed: requests.count <= maxRequests, remaining: maxRequests - requests.count };
}

export function generateId() {
  return crypto.randomUUID();
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function sanitizeString(str, maxLength = 500) {
  if (!str) return '';
  return String(str).trim().slice(0, maxLength);
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone) {
  const re = /^\+?[0-9]{8,15}$/;
  return re.test(phone.replace(/\s/g, ''));
}

export function getAuthToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/auth_token=([^;]+)/);
  return match ? match[1] : null;
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}
