# Pentarch Agency — Project Brief
## Multi-Tenant Client Dashboard & Multi-Product Platform

**Status:** Draft for kickoff
**Owner:** Pentarch founders
**Last updated:** 2026-10-25

---

## 1. Purpose

Build a functional, secure, multi-tenant client management system for Pentarch Agency, and extend the same hostname architecture so Pentarch can launch its own software products under dedicated subdomains.

This is a **functionality and security project**. The existing Pentarch website, branding, and approved design system are preserved as-is. No visual redesign.

Everything must work end to end. No mock metrics, simulated auth, placeholder CRUD, or fake data to disguise incomplete work.

---

## 2. What We Are Building

Four application surfaces on one parent domain, sharing a backend and data model, with strict authorization boundaries between them.

| Surface | Production host | Local host | Audience |
|---|---|---|---|
| Public website | `pentarch.agency` | `localhost:3000` | Public visitors |
| Founder admin | `admin.pentarch.agency` | `admin.localhost:3000` | Founders / authorized internal admins |
| Client dashboard | `{client-slug}.pentarch.agency` | `{client-slug}.localhost:3000` | One registered client organization each |
| Product app | `{product-slug}.pentarch.agency` | `{product-slug}.localhost:3000` | Users of that specific Pentarch product |

Client slugs and product slugs share one subdomain namespace. A hostname is either a client, a product, reserved, or unknown — never ambiguous.

---

## 3. Technology Stack (existing — reuse, don't replace)

- Next.js 16 (App Router), TypeScript
- Supabase: PostgreSQL, Auth, Storage, Realtime (where appropriate)
- Row Level Security on every exposed table with protected data
- Existing host-routing / tenant-resolution logic
- Existing testing and CI infrastructure

Rule: inspect first, reuse where possible, add only what is missing. No duplicate auth systems, duplicate tenant models, or conflicting routing implementations.

---

## 4. Core Capabilities

### 4.1 Public website
- Company info, services, projects
- Contact inquiry form → protected backend (spam/abuse protected)
- No permanent client-login link in public nav; no exposure of admin or client data

### 4.2 Founder administration
- Founder auth with existing 2FA requirement; server-side + DB-enforced authorization
- Organizations: create, edit, slug management, suspend/reactivate, members, projects, invitations, revoke access
- Client invitations: founder-controlled, secure single-use time-limited tokens, real email delivery (or honest "not configured" error)
- Projects, milestones, internal team assignment, client visibility config
- Tasks: create/update/assign, status transitions, internal notes, client-visible updates, attachments
- Client communication: discussions, project updates, file sharing
- Contact inquiry management: status, notes, assignment, timestamps
- Audit log of security-relevant actions (actor, action, target, timestamp, non-sensitive metadata)
- Overview metrics from real database queries
- **Product registry:** register products, validate slugs, assign hostnames, record routing/deployment config, manage lifecycle

### 4.3 Client dashboard
- Client auth scoped to the resolved organization
- Dashboard summary: active projects, status, milestones, recent tasks/activity, unread notifications, recent files
- Project detail (read access, restricted internal fields hidden)
- Read-only task board (v1)
- Project discussions (client-visible only; internal notes stored separately)
- Secure file access via private buckets + short-lived signed URLs
- Notifications scoped to recipient + organization
- Profile/account management (no self-promotion of roles or memberships)

### 4.4 Product applications
- Hostname resolves to a registered **active** product, not a client
- Each product defines its own auth model, authorization rules, data boundaries, and configuration
- Products may share the Next.js deployment (host-based routing) or run as separate deployments; the registry records which
- Registering a product does **not** deploy it; activation requires verified DNS/HTTPS/routing

---

## 5. Roles

| Role | Scope |
|---|---|
| Founder / Super Admin | Full admin dashboard, cross-client reporting, product management. Explicitly granted; never inferred from email, URL, header, or client-side value. |
| Internal Team Member | Configurable, role-scoped access to assigned projects/tasks. Only if required or approved. |
| Client Administrator | Own organization's dashboard, projects, discussions, files, notifications, org profile. Optionally invite users if Pentarch enables it. |
| Client Member | Permitted projects, read-only tasks, authorized discussions, shared files, notifications, own profile. |
| Public Visitor | Public pages and contact form only. |

Client users must never reach admin by typing the URL. Org A users must never reach Org B by visiting Org B's subdomain.

---

## 6. Security Principles (non-negotiable)

1. Hostname identifies tenant context; it never grants authorization.
2. Authorization is enforced server-side **and** in database RLS. Middleware alone is not sufficient.
3. Never trust org IDs, roles, slugs, or permissions sent by the browser.
4. Service-role key never reaches the browser; no privileged secrets in public env vars.
5. Single authoritative hostname resolver; centralized reserved-name list (`www`, `admin`, `api`, `app`, `auth`, `assets`, `status`, plus any added).
6. Slug collisions (client vs product vs reserved) prevented by a database-enforced constraint, not frontend validation.
7. Internal-only notes and fields never returned through client queries.
8. Suspended/archived orgs and suspended/retired products reject normal access.
9. Errors never reveal another tenant's existence or private details.
10. Security-relevant actions are audited; logs never contain secrets.

---

## 7. Data Model (logical entities)

User profiles · Organizations · Organization memberships · Invitations · Projects · Project memberships · Milestones · Tasks · Discussions · Messages · Files + metadata · Notifications · Contact inquiries · Audit events · **Products** (registry)

Every tenant-owned record has a verifiable foreign-key relationship to its organization. Reuse existing tables where they fit; add only what's missing.

Organization statuses: Pending setup · Active · Suspended · Archived
Product statuses: Draft · Configuring · Active · Suspended · Retired

---

## 8. Infrastructure Requirements

- Apex domain, admin subdomain, wildcard client/product subdomains
- Wildcard DNS + wildcard (or otherwise valid) TLS coverage
- Hosting routes all hostnames to the Next.js app (or intended separate deployments)
- Supabase redirect URLs configured for production and local
- Cookie/session behavior per subdomain designed and tested explicitly — do not assume cross-subdomain sharing
- Unknown-host rejection and reserved-subdomain protection

DNS alone ≠ routing. Wildcard DNS alone ≠ HTTPS or authorization. Nothing is "working" until verified in the deployed environment.

---

## 9. Out of Scope (v1)

- Visual redesign or new design system
- Client-editable task boards
- Self-service client signup (invitations are founder-controlled)
- Automatic product build/deploy on registration (unless explicitly implemented as a separate workflow)
- Any mock, placeholder, or simulated functionality

---

## 10. Acceptance Criteria (summary)

The project is complete only when **all** of the following are verified:

1. Public site works independently of private dashboards.
2. Only authorized founders can access admin.
3. Each client subdomain resolves to the correct organization; each product subdomain to the correct active product.
4. Authentication alone never grants tenant or product access.
5. Cross-tenant and cross-product access is blocked by server auth **and** RLS.
6. Founder-controlled invitations work end to end with real email delivery.
7. Project/task data persisted in the database.
8. Clients see only authorized files and discussions; internal notes stay private.
9. Notifications scoped correctly.
10. Admin actions auditable; product lifecycle actions auditable.
11. Product/client/reserved slug collisions are impossible.
12. Suspended/retired products and suspended/archived orgs follow their access policies.
13. Production hostnames and HTTPS verified in the deployed environment.
14. All automated tests pass (existing + new routing, isolation, authorization, integration).
15. No credentials or privileged keys exposed to the browser.
16. Every incomplete or unverified integration is documented honestly.

---

## 11. Reference Documents

- Core specification: *Dashboard Functionality, Access Control & Subdomain Architecture* (§1–19)
- Extension: *§20 Multi-Product Platform and Subdomain Architecture*
- Companion: `PENTARCH_KICKOFF.md` (workflow, phases, decisions, definition of done)
