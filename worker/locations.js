import { jsonResponse, errorResponse } from './utils.js';

export async function handleLocations(request, env, path, method) {
  if (method !== 'GET') return errorResponse('Method not allowed', 405);

  // GET /api/locations - List all locations
  if (path === '/api/locations') {
    const locations = await env.DB.prepare(`
      SELECT * FROM locations
      WHERE location_type = 'province'
      ORDER BY name_en ASC
    `).all();

    return jsonResponse({ locations: locations.results });
  }

  // GET /api/locations/:id/districts - Get districts for a province
  const match = path.match(/^\/api\/locations\/([a-f0-9-]+)\/districts$/);
  if (match) {
    const districts = await env.DB.prepare(`
      SELECT * FROM locations
      WHERE parent_id = ? AND location_type = 'district'
      ORDER BY name_en ASC
    `).bind(match[1]).all();

    return jsonResponse({ districts: districts.results });
  }

  return errorResponse('Route not found', 404);
}
