/**
 * Pentarch Hostname Resolver
 *
 * Single authoritative resolver for all hostname routing.
 * Every hostname goes through this — no parallel implementations anywhere.
 *
 * Categories:
 *   public    — pentarch.agency / localhost:3000
 *   admin     — admin.pentarch.agency / admin.localhost:3000
 *   client    — {slug}.pentarch.agency (registered org)
 *   product   — {slug}.pentarch.agency (registered product)
 *   reserved  — www, api, app, auth, assets, status
 *   unknown   — valid subdomain but not registered
 *   invalid   — malformed hostname
 */

export const RESERVED_SUBDOMAINS = new Set([
  'www',
  'admin',
  'api',
  'app',
  'auth',
  'assets',
  'status',
] as const);

export type HostCategory =
  | 'public'
  | 'admin'
  | 'client'
  | 'product'
  | 'reserved'
  | 'unknown'
  | 'invalid';

export interface ResolvedHost {
  category: HostCategory;
  /** The raw hostname that was resolved */
  hostname: string;
  /** Extracted subdomain, if any */
  subdomain: string | null;
  /** Organization ID, if category is 'client' */
  organizationId: string | null;
  /** Organization slug, if category is 'client' */
  organizationSlug: string | null;
  /** Product ID, if category is 'product' */
  productId: string | null;
  /** Product slug, if category is 'product' */
  productSlug: string | null;
  /** Whether this is a local development environment */
  isLocal: boolean;
}

const PRODUCTION_DOMAIN = 'pentarch.agency';
const LOCAL_PATTERNS = ['localhost', '127.0.0.1', '::1'];

/**
 * Extract subdomain from a hostname.
 * Returns null for apex domain.
 */
function extractSubdomain(hostname: string): { subdomain: string | null; isLocal: boolean } {
  // Strip port
  const host = hostname.split(':')[0].toLowerCase().trim();

  // Local development: {slug}.localhost
  for (const local of LOCAL_PATTERNS) {
    if (host === local) {
      return { subdomain: null, isLocal: true };
    }
    if (host.endsWith(`.${local}`)) {
      const sub = host.slice(0, -(local.length + 1));
      return { subdomain: sub || null, isLocal: true };
    }
  }

  // Production: {slug}.pentarch.agency
  if (host === PRODUCTION_DOMAIN) {
    return { subdomain: null, isLocal: false };
  }
  if (host.endsWith(`.${PRODUCTION_DOMAIN}`)) {
    const sub = host.slice(0, -(PRODUCTION_DOMAIN.length + 1));
    return { subdomain: sub || null, isLocal: false };
  }

  // Unknown domain — treat as invalid
  return { subdomain: null, isLocal: false };
}

/**
 * Validate a subdomain string.
 * Must be lowercase alphanumeric with hyphens, not start/end with hyphen, 3-63 chars.
 */
function isValidSubdomain(sub: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/.test(sub);
}

export interface SlugLookupResult {
  type: 'client' | 'product';
  id: string;
  slug: string;
  status: string;
}

/**
 * Resolve a hostname to its category and tenant context.
 *
 * @param hostname - The full hostname (may include port)
 * @param lookupSlug - Async function to check if a slug is a registered client or product.
 *                     This is injected so the resolver stays pure and testable.
 */
export async function resolveHostname(
  hostname: string,
  lookupSlug?: (slug: string) => Promise<SlugLookupResult | null>,
): Promise<ResolvedHost> {
  const base: Omit<ResolvedHost, 'category'> = {
    hostname,
    subdomain: null,
    organizationId: null,
    organizationSlug: null,
    productId: null,
    productSlug: null,
    isLocal: false,
  };

  if (!hostname || typeof hostname !== 'string') {
    return { ...base, category: 'invalid' };
  }

  const { subdomain, isLocal } = extractSubdomain(hostname);
  base.isLocal = isLocal;
  base.subdomain = subdomain;

  // Apex domain (no subdomain) — public site
  if (!subdomain) {
    // Check if the host is recognized at all
    const host = hostname.split(':')[0].toLowerCase().trim();
    const isKnownHost =
      host === PRODUCTION_DOMAIN ||
      LOCAL_PATTERNS.some((p) => host === p) ||
      // Accept the raw domain without subdomain
      host.endsWith(`.${PRODUCTION_DOMAIN}`);

    if (!isKnownHost && !isLocal) {
      return { ...base, category: 'invalid' };
    }

    return { ...base, category: 'public' };
  }

  // Admin subdomain
  if (subdomain === 'admin') {
    return { ...base, category: 'admin' };
  }

  // Reserved subdomains
  if (RESERVED_SUBDOMAINS.has(subdomain as never)) {
    return { ...base, category: 'reserved' };
  }

  // Validate subdomain format
  if (!isValidSubdomain(subdomain)) {
    return { ...base, category: 'invalid' };
  }

  // Look up in database: is this a client org or a product?
  if (lookupSlug) {
    const result = await lookupSlug(subdomain);
    if (result) {
      if (result.type === 'client') {
        return {
          ...base,
          category: 'client',
          organizationId: result.id,
          organizationSlug: result.slug,
        };
      }
      if (result.type === 'product') {
        return {
          ...base,
          category: 'product',
          productId: result.id,
          productSlug: result.slug,
        };
      }
    }
  }

  // Subdomain exists but not registered
  return { ...base, category: 'unknown' };
}
