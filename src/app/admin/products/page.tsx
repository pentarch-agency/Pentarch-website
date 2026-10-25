import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

/**
 * Product Registry — Admin page.
 * Founders register products, validate slugs, manage lifecycle.
 */
export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, status, hostname, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-600">Failed to load products: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          Register product
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          No products registered yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Hostname</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/products/${product.id}`} className="text-gray-900 font-medium hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">{product.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      product.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm font-mono">
                    {product.hostname || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
