import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import Link from 'next/link';

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; target_type?: string; page?: string }>;
}) {
  await connection();
  await requireFounder();

  const params = await searchParams;
  const supabase = createAdminClient();
  const pageNum = parseInt(params.page || '1', 10);
  const perPage = 50;
  const offset = (pageNum - 1) * perPage;

  let query = supabase
    .from('audit_events')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (params.action) query = query.eq('action', params.action);
  if (params.target_type) query = query.eq('target_type', params.target_type);

  const { data: events, count } = await query;
  const totalPages = Math.ceil((count || 0) / perPage);

  const actorIds = [...new Set(events?.map(e => e.actor_id).filter(Boolean) || [])];
  const actorMap: Record<string, string> = {};
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase.from('user_profiles').select('id, email').in('id', actorIds);
    profiles?.forEach(p => { actorMap[p.id] = p.email; });
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
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Audit Log</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden" style={cardStyle}>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left px-5 data-sm" style={thStyle}>Time</th>
              <th className="text-left px-5 data-sm" style={thStyle}>Actor</th>
              <th className="text-left px-5 data-sm" style={thStyle}>Action</th>
              <th className="text-left px-5 data-sm" style={thStyle}>Target</th>
              <th className="text-left px-5 data-sm" style={thStyle}>IP</th>
            </tr>
          </thead>
          <tbody>
            {(!events || events.length === 0) && (
              <tr><td colSpan={5} className="p-5 text-[13px] text-center" style={{ color: 'var(--text-subtle)' }}>No audit events.</td></tr>
            )}
            {events?.map((e) => (
              <tr
                key={e.id}
                className="onlee-row"
                style={{ borderBottom: '1px solid var(--border-default)' }}
              >
                <td className="px-5 text-[11px] font-mono" style={{ color: 'var(--text-subtle)', height: '50px' }}>{new Date(e.created_at).toLocaleString()}</td>
                <td className="px-5 text-[13px]" style={{ color: 'var(--text-muted)' }}>{(e.actor_id && actorMap[e.actor_id]) || e.actor_id || '—'}</td>
                <td className="px-5 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{e.action}</td>
                <td className="px-5 text-[13px]" style={{ color: 'var(--text-muted)' }}>{e.target_type}{e.target_id ? ` / ${e.target_id.slice(0, 8)}` : ''}</td>
                <td className="px-5 text-[11px] font-mono" style={{ color: 'var(--text-subtle)' }}>{e.ip_address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {pageNum > 1 && (
            <a
              href={`/audit-log?page=${pageNum - 1}`}
              className="px-3 py-2.5 rounded-md text-[13px] flex items-center transition-colors duration-150"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
            >
              Prev
            </a>
          )}
          <span className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>Page {pageNum} of {totalPages}</span>
          {pageNum < totalPages && (
            <a
              href={`/audit-log?page=${pageNum + 1}`}
              className="px-3 py-2.5 rounded-md text-[13px] flex items-center transition-colors duration-150"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
