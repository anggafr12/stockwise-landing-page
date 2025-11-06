Manual Test Checklist — Membership Tiers

Backend
- Run migration: npm run -w backend db:migrate:tiers (or run SQL in your DB pipeline)
- Seed tiers: npm run -w backend db:seed:tiers
- Verify tables: membership_tiers has 3 rows; users/courses/membership_plans FKs present

App endpoints
- GET /api/public/courses returns rows with min_tier_name and min_tier_badge_color and only FREE-accessible courses
- GET /api/app/courses (logged in, verified) returns rows with meta and respects tier gating by sort_order
- GET /api/public/courses/:id returns meta fields
- GET /api/me returns user.membership_tier and tier_meta
- GET /api/app/membership/plans returns tier_meta for each plan

Admin
- GET /api/admin/courses returns meta for min_tier
- POST/PUT /api/admin/membership-plans validates membership_tier_granted against membership_tiers

Frontend
- LMS course cards render dynamic badge (label/color) from API metadata
- User membership page shows a badge using me.tier_meta (or '-' if none)

Idempotency
- Re-run migration/seed safely (ON CONFLICT upserts, IF EXISTS/IF NOT EXISTS used)

