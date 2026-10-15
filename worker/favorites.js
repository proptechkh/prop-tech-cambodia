import { jsonResponse, errorResponse, generateId, getAuthToken } from './utils.js';
import { verifyToken } from './auth.js';

export async function handleFavorites(request, env, path, method) {
  const auth = await authenticate(request, env);
  if (!auth) return errorResponse('Unauthorized', 401);

  // GET /api/favorites - List user favorites
  if (path === '/api/favorites' && method === 'GET') {
    const favorites = await env.DB.prepare(`
      SELECT p.*, u.name as owner_name, pt.title as translated_title
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'en'
      WHERE f.user_id = ? AND p.status = 'active'
      ORDER BY f.created_at DESC
    `).bind(auth.userId).all();

    return jsonResponse({ favorites: favorites.results });
  }

  // POST /api/favorites - Add to favorites
  if (path === '/api/favorites' && method === 'POST') {
    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) return errorResponse('Property ID is required');

    const property = await env.DB.prepare("SELECT id FROM properties WHERE id = ? AND status = 'active'").bind(propertyId).first();
    if (!property) return errorResponse('Property not found', 404);

    await env.DB.prepare(`
      INSERT OR IGNORE INTO favorites (user_id, property_id, created_at)
      VALUES (?, ?, ?)
    `).bind(auth.userId, propertyId, Date.now()).run();

    return jsonResponse({ message: 'Added to favorites' });
  }

  // DELETE /api/favorites/:id - Remove from favorites
  const match = path.match(/^\/api\/favorites\/([a-f0-9-]+)$/);
  if (match && method === 'DELETE') {
    await env.DB.prepare('DELETE FROM favorites WHERE user_id = ? AND property_id = ?').bind(auth.userId, match[1]).run();
    return jsonResponse({ message: 'Removed from favorites' });
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
