import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ProductsPage() {
  await connection();
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, status, hostname, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="text-[13px]" style={{ color: 'var(--danger-text)' }}>
        Failed to load products: {error.message}
      </div>
    );
  }

  const cardStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' };
  const thStyle = { color: 'var(--text-subtle)', background: 'var(--surface-muted)', height: '36px' };

  return (
    <div>
      {/* Top Bar */}
      <div
        className="sticky top-0 z-20 -mx-6 -mt-6 px-6 mb-6"
        style={{ background: 'var(--surface-canvas)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5 text-[13px] pl-10 lg:pl-0">
            <Link href="/" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Pentarch</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Products</span>
          </div>
          <Link
            href="/products/new"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors duration-150"
            style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
          >
            Register product
          </Link>
        </div>
      </div>

      {!products || products.length === 0 ? (
        <div className="rounded-lg p-8 text-center" style={cardStyle}>
          <p className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>No products registered yet.</p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={cardStyle}>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left px-5 data-sm" style={thStyle}>Name</th>
                <th className="text-left px-5 data-sm" style={thStyle}>Slug</th>
                <th className="text-left px-5 data-sm" style={thStyle}>Status</th>
                <th className="text-left px-5 data-sm" style={thStyle}>Hostname</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isDanger = product.status === 'suspended';
                return (
                  <tr
                    key={product.id}
                    className="onlee-row"
                    style={{ borderBottom: '1px solid var(--border-default)' }}
                  >
                    <td className="px-5" style={{ height: '50px' }}>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-[13px] font-medium onlee-link-accent"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-5 font-mono text-[13px]" style={{ color: 'var(--text-muted)' }}>{product.slug}</td>
                    <td className="px-5">
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{
                          background: isDanger ? 'var(--danger-tint)' : 'var(--surface-muted)',
                          color: isDanger ? 'var(--danger-text)' : 'var(--text-muted)',
                        }}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 font-mono text-[13px]" style={{ color: 'var(--text-muted)' }}>
                      {product.hostname || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
