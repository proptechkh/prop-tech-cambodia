import { handleAuth } from './auth.js';
import { handleProperties } from './properties.js';
import { handleFavorites } from './favorites.js';
import { handleReports } from './reports.js';
import { handleAdmin } from './admin.js';
import { handleUpload } from './upload.js';
import { handleLocations } from './locations.js';
import { rateLimit } from './utils.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function corsResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...headers },
  });
}

function errorResponse(message, status = 400) {
  return corsResponse({ error: message }, status);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitResult = await rateLimit(env.KV, clientIP, path);
    if (!rateLimitResult.allowed) {
      return errorResponse('Rate limit exceeded. Please try again later.', 429);
    }

    try {
      // Health check
      if (path === '/api/health') {
        return corsResponse({ status: 'ok', timestamp: Date.now() });
      }

      // Auth routes
      if (path.startsWith('/api/auth/')) {
        return handleAuth(request, env, path, method);
      }

      // Property routes
      if (path.startsWith('/api/properties') || path === '/api/properties') {
        return handleProperties(request, env, path, method, url);
      }

      // Favorites routes
      if (path.startsWith('/api/favorites')) {
        return handleFavorites(request, env, path, method);
      }

      // Reports routes
      if (path.startsWith('/api/reports')) {
        return handleReports(request, env, path, method);
      }

      // Admin routes
      if (path.startsWith('/api/admin')) {
        return handleAdmin(request, env, path, method);
      }

      // Upload routes
      if (path.startsWith('/api/upload')) {
        return handleUpload(request, env, path, method);
      }

      // Locations routes
      if (path.startsWith('/api/locations')) {
        return handleLocations(request, env, path, method);
      }

      return errorResponse('Not found', 404);
    } catch (err) {
      console.error('Worker error:', err);
      return errorResponse('Internal server error', 500);
    }
  },
};
