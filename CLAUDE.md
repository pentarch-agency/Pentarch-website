# Pentarch Agency — Multi-Tenant Platform

## Project Overview
Multi-tenant client dashboard and multi-product platform for Pentarch Agency.
Four surfaces on one domain: public site, founder admin, client dashboards, product apps.

## Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Supabase: PostgreSQL, Auth, Storage, Realtime
- Row Level Security on every exposed table

## Architecture
- `src/lib/hostname-resolver.ts` — Single authoritative hostname resolver (public/admin/client/product/reserved/unknown)
- `src/middleware.ts` — Host-based routing, sets tenant context headers
- `src/app/(public)/` — Public website routes
- `src/app/(admin)/` — Founder admin routes (admin.pentarch.agency)
- `src/app/(dashboard)/` — Client dashboard routes ({slug}.pentarch.agency)
- `src/app/(product)/` — Product app routes ({product-slug}.pentarch.agency)
- `src/lib/supabase/` — Supabase client utilities (server/client/middleware)
- `src/lib/auth/` — Authentication and RBAC utilities
- `supabase/migrations/` — Database migrations

## Key Conventions
- Authorization enforced server-side AND in database RLS — middleware alone is never sufficient
- Never trust org IDs, roles, slugs from browser
- Service-role key never reaches the browser
- Internal notes/fields never returned through client queries
- All security-relevant actions are audited

## Commands
- `npm run dev` — Start dev server on localhost:3000
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npx supabase db push` — Push migrations
- `npx supabase gen types typescript` — Generate TypeScript types from DB

## Reserved Subdomains
www, admin, api, app, auth, assets, status
