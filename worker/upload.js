import { jsonResponse, errorResponse, getAuthToken } from './utils.js';
import { verifyToken } from './auth.js';

export async function handleUpload(request, env, path, method) {
  if (method !== 'POST') return errorResponse('Method not allowed', 405);

  const auth = await authenticate(request, env);
  if (!auth) return errorResponse('Unauthorized', 401);

  // POST /api/upload - Upload image to R2
  if (path === '/api/upload') {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) return errorResponse('No file provided');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.');
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('File too large. Maximum size is 5MB.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const key = `properties/${auth.userId}/${fileName}`;

    // Upload to R2
    await env.BUCKET.put(key, file.body, {
      httpMetadata: { contentType: file.type },
    });

    // Generate public URL (if bucket is public) or presigned URL
    const publicUrl = `https://prop-tech-images.pages.dev/${key}`;

    return jsonResponse({
      url: publicUrl,
      key: key,
      message: 'Upload successful',
    }, 201);
  }

  return errorResponse('Route not found', 404);
}

async function authenticate(request, env) {
  const token = getAuthToken(request);
  if (!token) return null;
  const payload = await verifyToken(token, env.JWT_SECRET);
  if (!payload) return null;
  return { userId: payload.userId, role: payload.role };
}
