-- Prop Tech Cambodia - Cloudflare D1 Schema
-- Run this in your D1 database to set up all tables

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table (replaces Supabase auth.users + profiles)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK(role IN ('owner', 'agent', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended')),
  verified INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK(preferred_language IN ('km', 'en', 'zh-CN')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Locations table (Cambodia provinces, districts, communes)
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES locations(id),
  location_type TEXT NOT NULL CHECK(location_type IN ('province', 'district', 'commune', 'neighborhood')),
  name_km TEXT NOT NULL,
  name_en TEXT,
  name_zh TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_id);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(location_type);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL CHECK(property_type IN ('House', 'Villa', 'Condo', 'Apartment', 'Land', 'Shophouse', 'Commercial')),
  listing_type TEXT NOT NULL CHECK(listing_type IN ('sale', 'rent')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'paused', 'sold', 'rented', 'removed')),
  price REAL NOT NULL CHECK(price > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK(currency IN ('USD', 'KHR')),
  city TEXT NOT NULL,
  address_text TEXT,
  latitude REAL CHECK(latitude BETWEEN -90 AND 90),
  longitude REAL CHECK(longitude BETWEEN -180 AND 180),
  bedrooms INTEGER DEFAULT 0 CHECK(bedrooms >= 0),
  bathrooms INTEGER DEFAULT 0 CHECK(bathrooms >= 0),
  floor_area REAL DEFAULT 0 CHECK(floor_area >= 0),
  land_area REAL DEFAULT 0 CHECK(land_area >= 0),
  contact_phone TEXT NOT NULL,
  telegram TEXT,
  views_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_created ON properties(created_at DESC);

-- Property translations
CREATE TABLE IF NOT EXISTS property_translations (
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL CHECK(language_code IN ('km', 'en', 'zh-CN')),
  title TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (property_id, language_code)
);

-- Property images
CREATE TABLE IF NOT EXISTS property_images (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_images_property ON property_images(property_id);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (user_id, property_id)
);

-- Property reports
CREATE TABLE IF NOT EXISTS property_reports (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  reporter_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at INTEGER NOT NULL,
  resolved_by TEXT REFERENCES users(id),
  resolved_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_reports_property ON property_reports(property_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON property_reports(status);

-- Inquiries (contact tracking)
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  contact_method TEXT NOT NULL CHECK(contact_method IN ('phone', 'telegram', 'message')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);

-- Rate limiting log
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id TEXT PRIMARY KEY,
  ip TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ratelimit_ip ON rate_limit_log(ip, created_at);
