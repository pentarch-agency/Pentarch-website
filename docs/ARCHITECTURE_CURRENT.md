# Architecture — Current State

> Phase 1 deliverable. Updated as the project progresses.

## Directory Structure

```
src/
  app/
    (public)/          — Public website (pentarch.agency)
      page.tsx         — Homepage
      contact/page.tsx — Contact form
      layout.tsx       — Public layout with nav/footer
    admin/             — Founder admin dashboard (admin.pentarch.agency)
      layout.tsx       — Admin layout with sidebar, requireFounder() guard
      page.tsx         — Overview with real DB metrics
      organizations/   — Org management
      products/        — Product registry
    dashboard/         — Client dashboard ({slug}.pentarch.agency)
      layout.tsx       — Dashboard layout, org resolution + membership check
      page.tsx         — Client overview with real DB metrics
    product/           — Product apps ({product-slug}.pentarch.agency)
      layout.tsx       — Product resolution, status check
      page.tsx         — Product shell
    api/
      contact/route.ts — Public contact form submission
    layout.tsx         — Root layout (fonts, global CSS)
    globals.css        — Tailwind base
  lib/
    hostname-resolver.ts  — Single authoritative hostname resolver
    hostname-resolver.test.ts — Tests for all host categories
    slug-lookup.ts        — DB-backed slug resolution
    auth/index.ts         — Auth utilities (getCurrentUser, requireAuth, requireFounder, getOrgMembership)
    supabase/
      server.ts           — Server-side Supabase client + admin client
      client.ts           — Browser-side Supabase client
      middleware.ts       — Session refresh utility
  middleware.ts           — Host-based routing middleware
supabase/
  migrations/
    001_initial_schema.sql — Full data model with hostname registry
    002_rls_policies.sql   — RLS policies for every table
docs/
  ARCHITECTURE_CURRENT.md  — This file
```

## Hostname Resolution

Single resolver at `src/lib/hostname-resolver.ts`. Categories:
- **public** — apex domain
- **admin** — admin.pentarch.agency
- **client** — registered org subdomain
- **product** — registered product subdomain  
- **reserved** — www, api, app, auth, assets, status
- **unknown** — valid but unregistered subdomain
- **invalid** — malformed or unknown domain

Slug uniqueness enforced by `hostname_registry` table — shared across organizations, products, and reserved names.

## Security Model

1. Middleware sets tenant context headers but does NOT authorize
2. Layouts verify auth + membership server-side
3. RLS enforces boundaries at the database level
4. `is_founder()` and `is_org_member()` are SECURITY DEFINER functions
5. Audit events table is append-only (no update/delete for users)
6. Internal notes/fields hidden from client queries via RLS + query shape

## What's Implemented

- [x] Next.js 16 scaffold with App Router
- [x] Hostname resolver with full test coverage
- [x] Host-based routing middleware
- [x] Four route groups (public, admin, dashboard, product)
- [x] Supabase client utilities (server, client, middleware)
- [x] Auth utilities with server-side verification
- [x] Full database schema (15 tables)
- [x] RLS policies for all tables
- [x] Contact form with API route
- [x] Admin overview with real DB queries
- [x] Client dashboard with real DB queries
- [x] Product registry page

## What's Missing (next phases)

- [ ] Supabase project connection (.env.local)
- [ ] Auth flows (login/signup pages, OAuth config)
- [ ] Invitation flow (issue → email → accept → activate)
- [ ] Organization CRUD (create/edit/suspend)
- [ ] Project/task/milestone management
- [ ] Discussion and messaging
- [ ] File upload with signed URLs
- [ ] Notification system
- [ ] Audit logging implementation
- [ ] Product lifecycle management
- [ ] Production DNS/TLS/hosting setup
- [ ] Full test suite execution
