import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import Link from 'next/link';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; org?: string }>;
}) {
  await connection();
  await requireFounder();

  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase.from('projects').select('*, organizations(name)').order('created_at', { ascending: false });
  if (params.status) query = query.eq('status', params.status);
  if (params.org) query = query.eq('organization_id', params.org);

  const { data: projects } = await query;

  const cardStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' };
  const inputStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

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
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Projects</span>
          </div>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors duration-150"
            style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <select
          defaultValue={params.status || ''}
          className="rounded-md px-3 py-2 text-[13px] outline-none appearance-none"
          style={inputStyle}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={cardStyle}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--surface-muted)' }}>
              <th className="text-left px-4 data-sm" style={{ color: 'var(--text-subtle)', height: '36px' }}>Name</th>
              <th className="text-left px-4 data-sm" style={{ color: 'var(--text-subtle)', height: '36px' }}>Organization</th>
              <th className="text-left px-4 data-sm" style={{ color: 'var(--text-subtle)', height: '36px' }}>Status</th>
              <th className="text-left px-4 data-sm" style={{ color: 'var(--text-subtle)', height: '36px' }}>Visible</th>
              <th className="text-left px-4 data-sm" style={{ color: 'var(--text-subtle)', height: '36px' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {(!projects || projects.length === 0) && (
              <tr><td colSpan={5} className="px-4 text-[13px] text-center" style={{ color: 'var(--text-subtle)', height: '50px' }}>No projects yet.</td></tr>
            )}
            {projects?.map((p) => {
              const isDanger = p.status === 'cancelled';
              return (
                <tr
                  key={p.id}
                  className="onlee-row"
                  style={{ borderBottom: '1px solid var(--border-default)' }}
                >
                  <td className="px-4" style={{ height: '50px' }}>
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-[13px] font-medium onlee-link-accent"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 text-[13px]" style={{ color: 'var(--text-muted)', height: '50px' }}>{(p as any).organizations?.name}</td>
                  <td className="px-4" style={{ height: '50px' }}>
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        background: isDanger ? 'var(--danger-tint)' : 'var(--surface-muted)',
                        color: isDanger ? 'var(--danger-text)' : 'var(--text-muted)',
                      }}
                    >
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{ background: isDanger ? 'var(--danger-solid)' : p.status === 'active' ? 'var(--success-solid)' : 'var(--text-subtle)' }}
                      />
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 text-[13px]" style={{ color: 'var(--text-muted)', height: '50px' }}>{p.client_visible ? 'Yes' : 'No'}</td>
                  <td className="px-4 text-[13px]" style={{ color: 'var(--text-muted)', height: '50px' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
