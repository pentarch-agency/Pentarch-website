import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * Product Application Layout
 *
 * Resolves the product from the hostname.
 * Each product defines its own auth model and UI — this is a minimal shell.
 */
export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const productSlug = headersList.get('x-pentarch-product-slug');

  if (!productSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-500">This product does not exist.</p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug, status')
    .eq('slug', productSlug)
    .single();

  if (!product || product.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unavailable</h1>
          <p className="text-gray-500">
            {product?.status === 'suspended'
              ? 'This product is temporarily unavailable.'
              : 'This product does not exist.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
