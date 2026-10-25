import { describe, it, expect } from 'vitest';
import { resolveHostname, RESERVED_SUBDOMAINS } from './hostname-resolver';

describe('Hostname Resolver', () => {
  // -------------------------------------------------------------------------
  // Public (apex domain)
  // -------------------------------------------------------------------------
  it('resolves production apex as public', async () => {
    const result = await resolveHostname('pentarch.agency');
    expect(result.category).toBe('public');
    expect(result.isLocal).toBe(false);
    expect(result.subdomain).toBeNull();
  });

  it('resolves localhost as public', async () => {
    const result = await resolveHostname('localhost:3000');
    expect(result.category).toBe('public');
    expect(result.isLocal).toBe(true);
  });

  it('resolves localhost without port as public', async () => {
    const result = await resolveHostname('localhost');
    expect(result.category).toBe('public');
    expect(result.isLocal).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Admin
  // -------------------------------------------------------------------------
  it('resolves admin.pentarch.agency as admin', async () => {
    const result = await resolveHostname('admin.pentarch.agency');
    expect(result.category).toBe('admin');
    expect(result.subdomain).toBe('admin');
  });

  it('resolves admin.localhost:3000 as admin', async () => {
    const result = await resolveHostname('admin.localhost:3000');
    expect(result.category).toBe('admin');
    expect(result.isLocal).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Reserved subdomains
  // -------------------------------------------------------------------------
  for (const reserved of ['www', 'api', 'app', 'auth', 'assets', 'status']) {
    it(`resolves ${reserved}.pentarch.agency as reserved`, async () => {
      const result = await resolveHostname(`${reserved}.pentarch.agency`);
      expect(result.category).toBe('reserved');
    });
  }

  // -------------------------------------------------------------------------
  // Client subdomain (with lookup)
  // -------------------------------------------------------------------------
  it('resolves a registered client slug', async () => {
    const lookup = async (slug: string) =>
      slug === 'acme'
        ? { type: 'client' as const, id: 'org-1', slug: 'acme', status: 'active' }
        : null;

    const result = await resolveHostname('acme.pentarch.agency', lookup);
    expect(result.category).toBe('client');
    expect(result.organizationId).toBe('org-1');
    expect(result.organizationSlug).toBe('acme');
  });

  // -------------------------------------------------------------------------
  // Product subdomain (with lookup)
  // -------------------------------------------------------------------------
  it('resolves a registered product slug', async () => {
    const lookup = async (slug: string) =>
      slug === 'analytics'
        ? { type: 'product' as const, id: 'prod-1', slug: 'analytics', status: 'active' }
        : null;

    const result = await resolveHostname('analytics.pentarch.agency', lookup);
    expect(result.category).toBe('product');
    expect(result.productId).toBe('prod-1');
    expect(result.productSlug).toBe('analytics');
  });

  // -------------------------------------------------------------------------
  // Unknown subdomain
  // -------------------------------------------------------------------------
  it('resolves an unregistered subdomain as unknown', async () => {
    const lookup = async () => null;
    const result = await resolveHostname('nonexistent.pentarch.agency', lookup);
    expect(result.category).toBe('unknown');
  });

  it('resolves an unregistered subdomain without lookup as unknown', async () => {
    const result = await resolveHostname('something.pentarch.agency');
    expect(result.category).toBe('unknown');
  });

  // -------------------------------------------------------------------------
  // Invalid
  // -------------------------------------------------------------------------
  it('rejects empty hostname', async () => {
    const result = await resolveHostname('');
    expect(result.category).toBe('invalid');
  });

  it('rejects malformed subdomain (starts with hyphen)', async () => {
    const result = await resolveHostname('-bad.pentarch.agency');
    expect(result.category).toBe('invalid');
  });

  it('rejects unknown domain', async () => {
    const result = await resolveHostname('evil.example.com');
    expect(result.category).toBe('invalid');
  });

  // -------------------------------------------------------------------------
  // Local development
  // -------------------------------------------------------------------------
  it('resolves client.localhost:3000 as unknown (no lookup)', async () => {
    const result = await resolveHostname('acme.localhost:3000');
    expect(result.category).toBe('unknown');
    expect(result.isLocal).toBe(true);
    expect(result.subdomain).toBe('acme');
  });

  it('resolves client.localhost:3000 with lookup', async () => {
    const lookup = async (slug: string) =>
      slug === 'acme'
        ? { type: 'client' as const, id: 'org-1', slug: 'acme', status: 'active' }
        : null;

    const result = await resolveHostname('acme.localhost:3000', lookup);
    expect(result.category).toBe('client');
    expect(result.isLocal).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Reserved set completeness
  // -------------------------------------------------------------------------
  it('has all required reserved subdomains', () => {
    expect(RESERVED_SUBDOMAINS.has('www')).toBe(true);
    expect(RESERVED_SUBDOMAINS.has('admin')).toBe(true);
    expect(RESERVED_SUBDOMAINS.has('api')).toBe(true);
    expect(RESERVED_SUBDOMAINS.has('app')).toBe(true);
    expect(RESERVED_SUBDOMAINS.has('auth')).toBe(true);
    expect(RESERVED_SUBDOMAINS.has('assets')).toBe(true);
    expect(RESERVED_SUBDOMAINS.has('status')).toBe(true);
  });
});
