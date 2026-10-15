import { jsonResponse, errorResponse, generateId, sanitizeString, getAuthToken } from './utils.js';
import { verifyToken } from './auth.js';

export async function handleReports(request, env, path, method) {
  const auth = await authenticate(request, env);
  if (!auth) return errorResponse('Unauthorized', 401);

  // POST /api/reports - Create report
  if (path === '/api/reports' && method === 'POST') {
    const body = await request.json();
    const { propertyId, reason, details } = body;

    if (!propertyId || !reason) return errorResponse('Property ID and reason are required');

    const property = await env.DB.prepare("SELECT id FROM properties WHERE id = ? AND status = 'active'").bind(propertyId).first();
    if (!property) return errorResponse('Property not found', 404);

    const reportId = generateId();
    await env.DB.prepare(`
      INSERT INTO property_reports (id, property_id, reporter_id, reason, details, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'open', ?)
    `).bind(reportId, propertyId, auth.userId, sanitizeString(reason, 200), sanitizeString(details, 1000), Date.now()).run();

    return jsonResponse({ id: reportId, message: 'Report submitted' }, 201);
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
