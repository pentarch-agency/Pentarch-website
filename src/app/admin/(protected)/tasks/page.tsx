import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import Link from 'next/link';

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  await connection();
  await requireFounder();

  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase.from('tasks').select('*, projects(name)').order('created_at', { ascending: false });
  if (params.status) query = query.eq('status', params.status);
  if (params.priority) query = query.eq('priority', params.priority);

  const { data: tasks } = await query;

  const thStyle = {
    color: 'var(--text-subtle)',
    background: 'var(--surface-muted)',
    height: '36px',
  } as const;

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
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tasks</span>
          </div>
        </div>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
      >
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left px-4 data-sm" style={thStyle}>Title</th>
              <th className="text-left px-4 data-sm" style={thStyle}>Project</th>
              <th className="text-left px-4 data-sm" style={thStyle}>Status</th>
              <th className="text-left px-4 data-sm" style={thStyle}>Priority</th>
              <th className="text-left px-4 data-sm" style={thStyle}>Created</th>
            </tr>
          </thead>
          <tbody>
            {(!tasks || tasks.length === 0) && (
              <tr><td colSpan={5} className="p-4 text-[13px] text-center" style={{ color: 'var(--text-subtle)' }}>No tasks yet.</td></tr>
            )}
            {tasks?.map((t) => {
              const isDanger = t.status === 'cancelled';
              const isUrgent = t.priority === 'urgent' || t.priority === 'high';
              return (
                <tr key={t.id}>
                  <td className="px-4" style={{ borderBottom: '1px solid var(--border-default)', height: '50px' }}>
                    <Link href={`/tasks/${t.id}`} className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{t.title}</Link>
                  </td>
                  <td className="px-4 text-[13px]" style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                    {(t as any).projects?.name || '—'}
                  </td>
                  <td className="px-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <span
                      className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        background: isDanger ? 'var(--danger-tint)' : 'var(--surface-muted)',
                        color: isDanger ? 'var(--danger-text)' : 'var(--text-muted)',
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: isUrgent ? 'var(--danger-solid)' : 'var(--text-subtle)' }}
                      />
                      <span className="text-[13px]" style={{ color: isUrgent ? 'var(--text-primary)' : 'var(--text-muted)' }}>{t.priority}</span>
                    </div>
                  </td>
                  <td className="px-4 text-[13px]" style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-subtle)' }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
