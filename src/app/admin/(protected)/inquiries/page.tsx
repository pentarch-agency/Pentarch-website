import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import Link from 'next/link';

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await connection();
  await requireFounder();

  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false });
  if (params.status) query = query.eq('status', params.status);

  const { data: inquiries } = await query;

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
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Inquiries</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden" style={cardStyle}>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left px-5 data-sm" style={thStyle}>Name</th>
              <th className="text-left px-5 data-sm" style={thStyle}>Email</th>
              <th className="text-left px-5 data-sm" style={thStyle}>Company</th>
              <th className="text-left px-5 data-sm" style={thStyle}>Status</th>
              <th className="text-left px-5 data-sm" style={thStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {(!inquiries || inquiries.length === 0) && (
              <tr><td colSpan={5} className="p-5 text-[13px] text-center" style={{ color: 'var(--text-subtle)' }}>No inquiries yet.</td></tr>
            )}
            {inquiries?.map((inq) => {
              const isDanger = inq.status === 'spam';
              return (
                <tr
                  key={inq.id}
                  className="onlee-row"
                  style={{ borderBottom: '1px solid var(--border-default)' }}
                >
                  <td className="px-5" style={{ height: '50px' }}>
                    <Link
                      href={`/inquiries/${inq.id}`}
                      className="text-[13px] font-medium onlee-link-accent"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {inq.name}
                    </Link>
                  </td>
                  <td className="px-5 text-[13px]" style={{ color: 'var(--text-muted)' }}>{inq.email}</td>
                  <td className="px-5 text-[13px]" style={{ color: 'var(--text-muted)' }}>{inq.company || '—'}</td>
                  <td className="px-5">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        background: isDanger ? 'var(--danger-tint)' : 'var(--surface-muted)',
                        color: isDanger ? 'var(--danger-text)' : 'var(--text-muted)',
                      }}
                    >
                      {inq.status}
                    </span>
                  </td>
                  <td className="px-5 text-[13px]" style={{ color: 'var(--text-muted)' }}>{new Date(inq.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
