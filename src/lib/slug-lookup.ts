import { type SlugLookupResult } from '@/lib/hostname-resolver';

/**
 * Look up a slug in the database to determine if it's a client org or product.
 * Used by the hostname resolver for full resolution.
 *
 * This queries the unified hostname registry — slugs are unique across
 * clients, products, and reserved names (enforced by DB constraint).
 */
export async function lookupSlugFromDB(slug: string): Promise<SlugLookupResult | null> {
  // Dynamic import to avoid circular deps in middleware
  const { createAdminClient } = await import('@/lib/supabase/server');
  const supabase = createAdminClient();

  // Check organizations first
  const { data: org } = await supabase
    .from('organizations')
    .select('id, slug, status')
    .eq('slug', slug)
    .single();

  if (org) {
    return { type: 'client', id: org.id, slug: org.slug, status: org.status };
  }

  // Check products
  const { data: product } = await supabase
    .from('products')
    .select('id, slug, status')
    .eq('slug', slug)
    .single();

  if (product) {
    return { type: 'product', id: product.id, slug: product.slug, status: product.status };
  }

  return null;
}
