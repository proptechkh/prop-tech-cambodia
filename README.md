# Prop Tech Cambodia — mobile-first PWA starter

A responsive front-end prototype for a Cambodia property marketplace with:
- Buy / rent search, location and property-type filters
- Property detail pages and direct phone / Telegram contact
- Demo account creation with owner or agent role
- Listing creation, local photo previews, immediate demo publication
- My listings, pause/reactivate, sold/rented-ready status model, favorites, reporting
- Admin demo dashboard for listings, user list, and reports
- English, Khmer, and Simplified Chinese UI labels
- PWA manifest, install prompt, service worker and app icon
- Starter Supabase PostgreSQL schema

## Run locally

This is a static PWA prototype. Use a local web server (service workers do not work reliably from `file://`).

### Python
```bash
python -m http.server 8080
```
Open http://localhost:8080

### Node
```bash
npx serve .
```

## Demo behavior and limitations

The current prototype stores data in the current browser's `localStorage`. That is useful for trying the interface, but it is **not a real multi-user application**. Other visitors will not see your posts, and browser storage can be cleared. Sample properties use remote Unsplash images. Uploaded demo photos are stored locally in the browser and should not be used for large volumes.

Account creation is also demo-only: there is no real password, email verification, SMS OTP, or secure authentication. The admin view is a visual prototype, not a protected production admin system. Do not use real sensitive data.

## Production implementation checklist

1. Create a Supabase project.
2. Apply `supabase/schema.sql`, then enable RLS on every exposed table.
3. Add secure policies and server-side role assignment. Never let users self-assign `admin`.
4. Connect Supabase Auth for phone/email sign-in and verification.
5. Move property CRUD and moderation to authenticated, authorized requests.
6. Upload photos to Supabase Storage using restricted paths and size/type validation.
7. Add server-side validation, rate limiting, anti-spam controls, moderation audit logs and backups.
8. Add real Cambodian province/district/commune seed data and verify translations.
9. Add map provider keys only through appropriately restricted configuration.
10. Add production hosting, custom domain, HTTPS, error monitoring and analytics consent/privacy notice.
11. Test security and UI on real low-cost Android devices, iOS Safari and desktop browsers.

## Main files

- `index.html` — page structure
- `styles.css` — responsive UI
- `app.js` — prototype behavior, translations, demo data
- `manifest.webmanifest` — PWA metadata
- `sw.js` — basic asset cache/offline fallback
- `supabase/schema.sql` — database starter schema

## Product defaults

- Brand: Prop Tech, cobalt blue `#1747c8`
- Languages: Khmer (`km`), English (`en`), Simplified Chinese (`zh-CN`)
- Posting: property owners and sales agents
- Publication: immediate after client-side demo validation; production must validate server-side
- Currency shown in demo: USD; schema supports USD and KHR
