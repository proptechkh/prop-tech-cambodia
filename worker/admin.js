import { jsonResponse, errorResponse, getAuthToken } from './utils.js';
import { verifyToken } from './auth.js';

export async function handleAdmin(request, env, path, method) {
  const auth = await authenticate(request, env);
  if (!auth) return errorResponse('Unauthorized', 401);
  if (auth.role !== 'admin') return errorResponse('Admin access required', 403);

  // GET /api/admin/stats - Dashboard stats
  if (path === '/api/admin/stats' && method === 'GET') {
    const [totalListings, activeListings, totalUsers, openReports] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) as count FROM properties WHERE status != 'removed'").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM properties WHERE status = 'active'").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM users").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM property_reports WHERE status = 'open'").first(),
    ]);

    return jsonResponse({
      stats: {
        totalListings: totalListings?.count || 0,
        activeListings: activeListings?.count || 0,
        totalUsers: totalUsers?.count || 0,
        openReports: openReports?.count || 0,
      },
    });
  }

  // GET /api/admin/listings - All listings
  if (path === '/api/admin/listings' && method === 'GET') {
    const listings = await env.DB.prepare(`
      SELECT p.*, u.name as owner_name, u.email as owner_email
      FROM properties p
      JOIN users u ON p.owner_id = u.id
      WHERE p.status != 'removed'
      ORDER BY p.created_at DESC
      LIMIT 100
    `).all();

    return jsonResponse({ listings: listings.results });
  }

  // GET /api/admin/reports - All reports
  if (path === '/api/admin/reports' && method === 'GET') {
    const reports = await env.DB.prepare(`
      SELECT r.*, p.title as property_title, u.name as reporter_name
      FROM property_reports r
      LEFT JOIN properties p ON r.property_id = p.id
      LEFT JOIN users u ON r.reporter_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 100
    `).all();

    return jsonResponse({ reports: reports.results });
  }

  // GET /api/admin/users - All users
  if (path === '/api/admin/users' && method === 'GET') {
    const users = await env.DB.prepare(`
      SELECT id, name, email, phone, role, status, verified, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 100
    `).all();

    return jsonResponse({ users: users.results });
  }

  // PUT /api/admin/listings/:id/status - Update listing status
  const listingMatch = path.match(/^\/api\/admin\/listings\/([a-f0-9-]+)\/status$/);
  if (listingMatch && method === 'PUT') {
    const body = await request.json();
    const { status } = body;
    if (!['active', 'paused', 'sold', 'rented', 'removed'].includes(status)) {
      return errorResponse('Invalid status');
    }
    await env.DB.prepare('UPDATE properties SET status = ?, updated_at = ? WHERE id = ?').bind(status, Date.now(), listingMatch[1]).run();
    return jsonResponse({ message: 'Status updated' });
  }

  // PUT /api/admin/users/:id/status - Suspend/activate user
  const userMatch = path.match(/^\/api\/admin\/users\/([a-f0-9-]+)\/status$/);
  if (userMatch && method === 'PUT') {
    const body = await request.json();
    const { status } = body;
    if (!['active', 'suspended'].includes(status)) {
      return errorResponse('Invalid status');
    }
    await env.DB.prepare('UPDATE users SET status = ? WHERE id = ?').bind(status, userMatch[1]).run();
    return jsonResponse({ message: 'User status updated' });
  }

  // PUT /api/admin/reports/:id/resolve - Resolve report
  const reportMatch = path.match(/^\/api\/admin\/reports\/([a-f0-9-]+)\/resolve$/);
  if (reportMatch && method === 'PUT') {
    await env.DB.prepare("UPDATE property_reports SET status = 'resolved', resolved_at = ? WHERE id = ?").bind(Date.now(), reportMatch[1]).run();
    return jsonResponse({ message: 'Report resolved' });
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
