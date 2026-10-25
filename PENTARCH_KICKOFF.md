# Pentarch Dashboard — Kickoff & Workflow

**Companion to:** `PENTARCH_PROJECT_BRIEF.md`
**Kickoff date:** 2026-10-25

This document defines *how* the work runs: prerequisites, phases, gates, decisions, and reporting. The brief defines *what* is being built.

---

## 1. Pre-Kickoff Checklist

Nothing starts until these are confirmed.

- [ ] Repository access granted (local folder or GitHub `owner/repo`)
- [ ] Supabase project access: dashboard, database URL, migrations history, Auth settings, Storage buckets
- [ ] Hosting provider identified (e.g. Vercel) and project access confirmed
- [ ] DNS provider identified and access confirmed
- [ ] Email provider for invitations identified (Resend / SendGrid / Supabase SMTP / other) — or confirmed as *not yet configured*
- [ ] Existing 2FA mechanism for founders identified
- [ ] List of authorized founder accounts (emails) provided
- [ ] Local dev hostname convention confirmed (`*.localhost:3000` or whatever the repo currently uses)
- [ ] CI pipeline access confirmed
- [ ] Working mode agreed (see §3)

---

## 2. Working Rules

1. **Inspect before implementing.** No migration, route, or policy is written until Phase 1's architecture report is reviewed.
2. **Preserve, don't replace.** Working functionality stays. Changes to existing code must note what depends on it.
3. **No fakes.** No mock data, simulated auth, placeholder CRUD, or fake "deployed" states. If something isn't configured, the UI and the report say so.
4. **Security is never deferred.** A dashboard that "looks done" with missing RLS is not done.
5. **One resolver.** All hostname parsing goes through the single authoritative resolver. No parallel implementations in middleware, server actions, API routes, or DB utilities.
6. **Defense in depth.** Every protected operation: authenticate → resolve host → verify role → verify org/product context → authorize resource → validate input → execute → return only authorized data → audit if relevant.
7. **Verified means executed.** A test or integration is marked verified only after it has actually run against the relevant environment.
8. **Honest reporting.** Every phase ends with: implemented / tested / deployed / unverified / blocked.
9. **No design changes.** Zero changes to the approved visual identity.
10. **Secrets stay secret.** Nothing privileged in `NEXT_PUBLIC_*`, client bundles, the product registry, or logs.

---

## 3. Working Mode (decision required)

Choose one before Phase 1:

| Mode | Behavior |
|---|---|
| **Gated** | Stop for founder sign-off after every phase. Slower, maximum control. |
| **Checkpointed** (recommended) | Stop after Phase 1 (architecture review) and Phase 5 (RLS audit); run the rest autonomously, flagging gaps in the final report. |
| **Autonomous** | Run all phases; founders review the final report only. Irreversible decisions still stop for confirmation. |

Regardless of mode, these **always** pause for explicit approval:
- Any destructive migration or data change
- Changing an existing slug, hostname, or auth redirect config in production
- DNS or certificate changes
- Suspending/retiring an org or product that has live data

**Selected mode:** `__________________`

---

## 4. Phased Workflow

Each phase has an objective, deliverables, and an exit gate. A phase is not complete until its gate is met.

### Phase 1 — Repository Inspection & Architecture Report
**Objective:** Understand what exists before changing anything.
**Activities:**
- Map directory structure, App Router layout, middleware, host utilities
- Catalogue Supabase schema, migrations, existing RLS policies, Auth config, Storage buckets
- Trace current auth flow (founder + client), session handling, 2FA
- Identify existing tenant-resolution logic and reserved-name handling
- Inventory tests and CI
- Document environment variables and where secrets live
**Deliverable:** `docs/ARCHITECTURE_CURRENT.md` — what exists, what works, what's missing, what conflicts with the spec
**Gate:** Founder reviews the report. Open questions in §6 answered.

### Phase 2 — Hostname Resolution
**Objective:** One typed resolver covering all host categories.
**Activities:**
- Extend existing resolver: public / admin / client / product / reserved / unknown / invalid / local / production
- Centralize reserved-name list
- Normalize and validate hostnames
- Resolve slugs against the DB registry (clients + products), never accept arbitrary hosts
**Deliverable:** Resolver + unit tests for every host category, local and production
**Gate:** All routing tests pass; no second resolver exists anywhere in the codebase

### Phase 3 — Data Model Verification
**Objective:** Confirm or add the logical entities.
**Activities:**
- Verify organizations, memberships, invitations, projects, tasks, milestones, discussions, messages, files, notifications, inquiries, audit events
- Add **products** registry table with status, slug, hostname, routing/deployment reference, audit fields
- Add DB-enforced slug-uniqueness across clients + products + reserved names (shared hostname registry or equivalent constraint)
- Add missing foreign keys and constraints; centralize status enums
**Deliverable:** Migrations (additive, reviewed) + schema doc
**Gate:** Migrations apply cleanly to a fresh DB and to the existing DB; collision constraint proven by test

### Phase 4 — Authentication & RBAC
**Objective:** Trusted identity, server-enforced roles.
**Activities:**
- Founder auth: explicit allow-list, 2FA enforcement, step-up for sensitive ops, revocation
- Client auth: resolve host → resolve org → authenticate → verify membership → verify active → authorize
- Product auth model hooks (per-product requirements)
- Centralized authorization utilities used by all server actions / API routes
- Supabase SSR integration, cookie/session behavior per subdomain designed and documented
- Redirect URLs for local + production
**Deliverable:** Auth flows + tests (unauthenticated, valid founder, unauthorized admin attempt, valid client, suspended, wrong-tenant)
**Gate:** All auth tests pass; wrong-tenant and client→admin escalation attempts fail

### Phase 5 — RLS Audit & Implementation
**Objective:** Database enforces every boundary the app enforces.
**Activities:**
- Policy per exposed table; secure membership-lookup helpers (no recursive policy issues)
- Internal-only fields/rows hidden from client roles
- Product data isolation policies
- Audit table immutable to ordinary users
**Deliverable:** RLS migrations + isolation test suite run against the real DB
**Gate:** ⚠ **Checkpoint.** Founder reviews the policy matrix. Every tenant-isolation test passes at the DB layer with the app bypassed.

### Phase 6 — Founder Org & Invitation Management
**Objective:** Founders can run client onboarding end to end.
**Activities:**
- Org CRUD, status transitions, controlled + audited slug changes
- Invitation issue → email → accept → verify → activate membership → redirect to subdomain → audit
- Real email provider wiring, or explicit "not configured" error surfaced in UI
**Deliverable:** Working flows + integration tests
**Gate:** A real invitation has been sent, accepted, and recorded in a test environment

### Phase 7 — Client Dashboard
**Objective:** Clients see accurate, authorized data.
**Activities:**
- Summary metrics from real queries
- Project detail, read-only task board, notifications, profile/account
- Suspended / archived / unknown-tenant responses
**Deliverable:** Working dashboard + tests
**Gate:** Every metric traceable to a query; no hard-coded values

### Phase 8 — Projects, Tasks, Discussions, Files
**Objective:** Full delivery workflow for founders, scoped views for clients.
**Activities:**
- Project/milestone/task management with validated status transitions
- Client-visible vs internal discussions stored separately
- Private storage buckets, signed short-lived URLs, size/type validation
**Deliverable:** Working workflows + tests (including file access across orgs, internal-note leakage attempts)
**Gate:** Cross-org file/discussion/task access fails at both app and DB layers

### Phase 9 — Notifications, Contact Inquiries, Audit Logging
**Objective:** Close the operational loop.
**Activities:**
- Notification creation on key events, read/unread, recipient scoping
- Public contact form → protected backend; spam/abuse protection; founder inquiry management
- Audit log coverage for all listed actions (org, invitation, membership, role, project, permission, file, product lifecycle)
**Deliverable:** Working modules + tests
**Gate:** Audit coverage checklist complete; no secrets in log samples

### Phase 10 — Product Registry & Lifecycle
**Objective:** Founders can register and manage products without redesign.
**Activities:**
- Product management UI in admin: create, slug validation, collision check, hostname assignment, routing/deployment reference
- Lifecycle: Draft → Configuring → Active → Suspended → Retired, with defined access policy per state
- Hostname verification step before activation
- Registered / configured / deployed / verified states shown distinctly
- Product routing tests, suspended/retired access tests, cross-product isolation tests
**Deliverable:** Registry + UI + tests
**Gate:** A product can be registered, blocked while non-active, and served only once active and verified

### Phase 11 — Production Subdomains & Auth Redirects
**Objective:** It works on the real domain.
**Activities:**
- Wildcard DNS, TLS coverage, hosting routing for apex + admin + wildcard
- Supabase redirect URL allow-list for production
- Verify cookie/session behavior per subdomain in production
- Unknown-host and reserved-host rejection verified live
**Deliverable:** Infrastructure checklist with each item marked verified / unverified
**Gate:** Apex, admin, one client subdomain, and one product subdomain all load over HTTPS with correct auth behavior

### Phase 12 — Tests, Build, Security Checks
**Activities:** Full test suite, production build, dependency audit, secret-exposure scan of client bundles, RLS re-run
**Gate:** All green; no `NEXT_PUBLIC_` leak of privileged values

### Phase 13 — Final Report & Handover
**Deliverable:** `docs/IMPLEMENTATION_REPORT.md` — exactly what was implemented, tested, deployed, and left unverified; remaining infrastructure requirements; known limitations

---

## 5. Test Coverage Map

| Area | Required cases |
|---|---|
| Host routing | public, admin, registered client, registered product, unknown client, unknown product, reserved, invalid, localhost, production normalization |
| Authentication | unauthenticated, valid founder, unauthorized admin attempt, valid client, suspended user, expired invitation, revoked invitation, wrong-tenant user |
| Tenant isolation | Org A ↔ Org B projects / tasks / files / discussions / notifications; client cannot read internal notes; client cannot self-promote; client cannot edit internal-only task fields |
| Product isolation | product ↔ product data; product ↔ client data; suspended product; retired product; product-specific authorization; slug collision |
| Authorization | direct API calls protected; server actions enforce permissions; RLS rejects bypass; invalid org IDs cannot escape tenant; sensitive admin actions require step-up |
| Integration | invitation issue + accept; project creation; task update; file share; discussion creation; notification delivery; contact inquiry; org suspension; product activation |

---

## 6. Open Questions for Founders

Answer before or during Phase 1.

1. Is internal team member access needed in v1, or founders-only?
2. Which email provider should send invitations? Is it already configured?
3. Should client administrators be allowed to invite users in v1 (feature-flagged)?
4. Shared sessions across subdomains: required, or separate sign-in per hostname?
5. Which products are planned first (names + slugs), and will any run as separate deployments?
6. Hosting provider and DNS provider — who holds access?
7. What is the suspension policy for products: full block, maintenance page, or admin-only?
8. Retention/export expectations when an org is archived or a product is retired?
9. Any additional reserved subdomains beyond `www, admin, api, app, auth, assets, status`?
10. Are there existing clients whose slugs could collide with planned product names?

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Existing resolver conflicts with spec | Phase 1 documents it; extend rather than replace; tests pin behavior |
| Recursive RLS on membership lookups | Security-definer helper functions; tested in Phase 5 |
| Cross-subdomain cookie assumptions | Explicit design + production verification in Phases 4 and 11 |
| Wildcard TLS not supported by host | Confirm provider capability during pre-kickoff; document fallback |
| Email not configured → silent failure | Fail loudly in UI; never simulate delivery |
| Slug collision between client and product | DB-level constraint, not just UI check |
| "Looks done" pressure | Phase gates; security phases cannot be skipped |

---

## 8. Reporting Format (end of every phase)

```
Phase N — <name>
Implemented:   …
Tested:        … (what ran, against which environment)
Deployed:      … (or "not deployed")
Unverified:    …
Blocked by:    …
Decisions needed: …
```

---

## 9. Definition of Done

All 16 acceptance criteria in the Project Brief are met, every test in §5 passes, Phase 11's infrastructure checklist shows the production hostnames verified, and the final report contains no undocumented gaps.
