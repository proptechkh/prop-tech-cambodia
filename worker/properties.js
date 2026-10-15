import { jsonResponse, errorResponse, generateId, sanitizeString, getAuthToken } from './utils.js';
import { createToken, verifyToken } from './auth.js';

export async function handleProperties(request, env, path, method, url) {
  // GET /api/properties - List properties
  if (path === '/api/properties' && method === 'GET') {
    return listProperties(request, env, url);
  }

  // GET /api/properties/:id - Get single property
  const match = path.match(/^\/api\/properties\/([a-f0-9-]+)$/);
  if (match && method === 'GET') {
    return getProperty(request, env, match[1]);
  }

  // POST /api/properties - Create property
  if (path === '/api/properties' && method === 'POST') {
    return createProperty(request, env);
  }

  // PUT /api/properties/:id - Update property
  if (match && method === 'PUT') {
    return updateProperty(request, env, match[1]);
  }

  // DELETE /api/properties/:id - Delete property
  if (match && method === 'DELETE') {
    return deleteProperty(request, env, match[1]);
  }

  return errorResponse('Route not found', 404);
}

async function listProperties(request, env, url) {
  const params = url.searchParams;
  const mode = params.get('mode') || 'sale';
  const type = params.get('type') || '';
  const location = params.get('location') || '';
  const minPrice = parseFloat(params.get('minPrice')) || 0;
  const maxPrice = parseFloat(params.get('maxPrice')) || 999999999;
  const page = parseInt(params.get('page')) || 1;
  const limit = Math.min(parseInt(params.get('limit')) || 20, 50);
  const offset = (page - 1) * limit;

  let query = `
    SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.telegram_username,
           pt.title as translated_title, pt.description as translated_description
    FROM properties p
    JOIN users u ON p.owner_id = u.id
    LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = ?
    WHERE p.status = 'active' AND p.listing_type = ?
  `;
  const paramsArr = [params.get('lang') || 'en', mode];

  if (type) {
    query += ' AND p.property_type = ?';
    paramsArr.push(type);
  }

  if (location) {
    query += ' AND (p.address_text LIKE ? OR p.city LIKE ?)';
    paramsArr.push(`%${location}%`, `%${location}%`);
  }

  query += ' AND p.price BETWEEN ? AND ?';
  paramsArr.push(minPrice, maxPrice);

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  paramsArr.push(limit, offset);

  const properties = await env.DB.prepare(query).bind(...paramsArr).all();

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total FROM properties p
    WHERE p.status = 'active' AND p.listing_type = ?
  `;
  const countParams = [mode];
  if (type) {
    countQuery.replace('WHERE', 'WHERE p.property_type = ? AND');
    countParams.push(type);
  }
  const countResult = await env.DB.prepare(countQuery).bind(...countParams).first();

  // Get images for each property
  const propertyIds = properties.results.map(p => p.id);
  let images = [];
  if (propertyIds.length > 0) {
    const placeholders = propertyIds.map(() => '?').join(',');
    images = await env.DB.prepare(
      `SELECT * FROM property_images WHERE property_id IN (${placeholders}) ORDER BY sort_order`
    ).bind(...propertyIds).all();
  }

  // Map images to properties
  const imageMap = {};
  images.results.forEach(img => {
    if (!imageMap[img.property_id]) imageMap[img.property_id] = [];
    imageMap[img.property_id].push(img);
  });

  const enriched = properties.results.map(p => ({
    ...p,
    images: imageMap[p.id] || [],
    title: p.translated_title || p.title,
    description: p.translated_description || p.description,
  }));

  return jsonResponse({
    properties: enriched,
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit),
    },
  });
}

async function getProperty(request, env, id) {
  const property = await env.DB.prepare(`
    SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.telegram_username,
           pt.title as translated_title, pt.description as translated_description
    FROM properties p
    JOIN users u ON p.owner_id = u.id
    LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'en'
    WHERE p.id = ? AND p.status != 'removed'
  `).bind(id).first();

  if (!property) return errorResponse('Property not found', 404);

  const images = await env.DB.prepare(
    'SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order'
  ).bind(id).all();

  const translations = await env.DB.prepare(
    'SELECT * FROM property_translations WHERE property_id = ?'
  ).bind(id).all();

  return jsonResponse({
    property: {
      ...property,
      images: images.results,
      translations: translations.results,
    },
  });
}

async function createProperty(request, env) {
  const auth = await authenticate(request, env);
  if (!auth) return errorResponse('Unauthorized', 401);

  const body = await request.json();
  const {
    title, description, property_type, listing_type, price,
    city, address_text, bedrooms, bathrooms, floor_area, land_area,
    latitude, longitude, contact_phone, telegram, images, translations
  } = body;

  if (!title || !property_type || !listing_type || !price || !city || !contact_phone) {
    return errorResponse('Missing required fields');
  }

  const propertyId = generateId();

  await env.DB.prepare(`
    INSERT INTO properties (id, owner_id, title, description, property_type, listing_type,
      price, currency, city, address_text, bedrooms, bathrooms, floor_area, land_area,
      latitude, longitude, contact_phone, telegram, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'USD', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `).bind(
    propertyId, auth.userId, sanitizeString(title, 200), sanitizeString(description, 2000),
    property_type, listing_type, price, sanitizeString(city, 100),
    sanitizeString(address_text, 500), bedrooms || 0, bathrooms || 0,
    floor_area || 0, land_area || 0, latitude || null, longitude || null,
    sanitizeString(contact_phone, 20), sanitizeString(telegram, 100),
    Date.now(), Date.now()
  ).run();

  // Add translations
  if (translations && typeof translations === 'object') {
    for (const [lang, trans] of Object.entries(translations)) {
      if (trans.title) {
        await env.DB.prepare(`
          INSERT INTO property_translations (property_id, language_code, title, description)
          VALUES (?, ?, ?, ?)
        `).bind(propertyId, lang, sanitizeString(trans.title, 200), sanitizeString(trans.description, 2000)).run();
      }
    }
  }

  // Add images
  if (Array.isArray(images)) {
    for (let i = 0; i < Math.min(images.length, 10); i++) {
      await env.DB.prepare(`
        INSERT INTO property_images (id, property_id, storage_path, sort_order, is_cover, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(generateId(), propertyId, images[i], i, i === 0, Date.now()).run();
    }
  }

  // Log audit
  await env.DB.prepare(`
    INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
    VALUES (?, ?, 'create', 'property', ?, '{}', ?)
  `).bind(generateId(), auth.userId, propertyId, Date.now()).run();

  return jsonResponse({ id: propertyId, message: 'Property created' }, 201);
}

async function updateProperty(request, env, id) {
  const auth = await authenticate(request, env);
  if (!auth) return errorResponse('Unauthorized', 401);

  const property = await env.DB.prepare('SELECT * FROM properties WHERE id = ?').bind(id).first();
  if (!property) return errorResponse('Property not found', 404);

  if (property.owner_id !== auth.userId && auth.role !== 'admin') {
    return errorResponse('Forbidden', 403);
  }

  const body = await request.json();
  const updates = [];
  const values = [];

  const allowedFields = ['title', 'description', 'property_type', 'listing_type', 'price',
    'city', 'address_text', 'bedrooms', 'bathrooms', 'floor_area', 'land_area',
    'latitude', 'longitude', 'contact_phone', 'telegram', 'status'];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(body[field]);
    }
  }

  if (updates.length === 0) return errorResponse('No fields to update');

  updates.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  await env.DB.prepare(`UPDATE properties SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  // Update translations if provided
  if (body.translations && typeof body.translations === 'object') {
    for (const [lang, trans] of Object.entries(body.translations)) {
      if (trans.title) {
        await env.DB.prepare(`
          INSERT INTO property_translations (property_id, language_code, title, description)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(property_id, language_code) DO UPDATE SET title = ?, description = ?
        `).bind(propertyId, lang, sanitizeString(trans.title, 200), sanitizeString(trans.description, 2000),
          sanitizeString(trans.title, 200), sanitizeString(trans.description, 2000)).run();
      }
    }
  }

  return jsonResponse({ message: 'Property updated' });
}

async function deleteProperty(request, env, id) {
  const auth = await authenticate(request, env);
  if (!auth) return errorResponse('Unauthorized', 401);

  const property = await env.DB.prepare('SELECT * FROM properties WHERE id = ?').bind(id).first();
  if (!property) return errorResponse('Property not found', 404);

  if (property.owner_id !== auth.userId && auth.role !== 'admin') {
    return errorResponse('Forbidden', 403);
  }

  await env.DB.prepare("UPDATE properties SET status = 'removed', updated_at = ? WHERE id = ?").bind(Date.now(), id).run();

  return jsonResponse({ message: 'Property deleted' });
}

async function authenticate(request, env) {
  const token = getAuthToken(request);
  if (!token) return null;

  const payload = await verifyToken(token, env.JWT_SECRET);
  if (!payload) return null;

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.userId).first();
  return user || null;
}
