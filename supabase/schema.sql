-- Prop Tech starter schema. Review and test policies before production.
create extension if not exists pgcrypto;
create type public.app_role as enum ('owner','agent','admin');
create type public.listing_type as enum ('sale','rent');
create type public.listing_status as enum ('active','paused','sold','rented','removed');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role public.app_role not null default 'owner',
 display_name text not null,
 phone text,
 telegram_username text,
 preferred_language text not null default 'km' check (preferred_language in ('km','en','zh-CN')),
 status text not null default 'active' check(status in ('active','suspended')),
 created_at timestamptz not null default now()
);
create table public.locations (
 id uuid primary key default gen_random_uuid(),
 parent_id uuid references public.locations(id),
 location_type text not null check(location_type in ('province','district','commune','neighborhood')),
 name_km text not null, name_en text, name_zh text
);
create table public.properties (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles(id),
 listing_type public.listing_type not null,
 property_type text not null,
 status public.listing_status not null default 'active',
 price numeric(15,2) not null check(price > 0),
 currency text not null default 'USD' check(currency in ('USD','KHR')),
 province_id uuid references public.locations(id),
 district_id uuid references public.locations(id),
 commune_id uuid references public.locations(id),
 address_text text,
 latitude double precision check(latitude between -90 and 90),
 longitude double precision check(longitude between -180 and 180),
 bedrooms integer check(bedrooms >= 0),
 bathrooms integer check(bathrooms >= 0),
 land_area numeric(12,2) check(land_area >= 0),
 floor_area numeric(12,2) check(floor_area >= 0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.property_translations (
 property_id uuid not null references public.properties(id) on delete cascade,
 language_code text not null check(language_code in ('km','en','zh-CN')),
 title text not null, description text,
 primary key(property_id,language_code)
);
create table public.property_images (
 id uuid primary key default gen_random_uuid(),
 property_id uuid not null references public.properties(id) on delete cascade,
 storage_path text not null unique,
 sort_order integer not null default 0,
 is_cover boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.favorites (
 user_id uuid not null references public.profiles(id) on delete cascade,
 property_id uuid not null references public.properties(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,property_id)
);
create table public.property_reports (
 id uuid primary key default gen_random_uuid(),
 property_id uuid not null references public.properties(id) on delete cascade,
 reporter_id uuid references public.profiles(id) on delete set null,
 reason text not null,
 details text,
 status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
 created_at timestamptz not null default now(),
 resolved_by uuid references public.profiles(id),
 resolved_at timestamptz
);
create table public.inquiries (
 id uuid primary key default gen_random_uuid(),
 property_id uuid not null references public.properties(id) on delete cascade,
 sender_id uuid references public.profiles(id) on delete set null,
 contact_method text not null check(contact_method in ('phone','telegram','message')),
 created_at timestamptz not null default now()
);
create table public.audit_logs (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid references public.profiles(id) on delete set null,
 action text not null,
 entity_type text not null,
 entity_id uuid,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index properties_search_idx on public.properties(status,listing_type,property_type,price);
create index properties_location_idx on public.properties(province_id,district_id,commune_id);
create index properties_newest_idx on public.properties(created_at desc);

-- Important security note:
-- Enable RLS on all public tables and add tested role-aware policies before production.
-- Admin roles must be assigned only by trusted server-side operations, never client signup.
-- Public SELECT policy should expose only active properties and non-sensitive public fields.
-- Do not expose phone/profile rows through public policies; use a narrow server endpoint for contact display.
