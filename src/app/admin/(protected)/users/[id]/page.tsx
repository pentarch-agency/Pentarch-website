import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { UserRoleChanger } from './user-role-changer';
import { UserStatusActions } from './user-status-actions';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  await requireFounder();
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: user, error } = await supabase.from('user_profiles').select('*').eq('id', id).single();
  if (error || !user) notFound();

  const { data: memberships } = await supabase
    .from('organization_memberships')
    .select('id, organization_id, role, status, organizations(name)')
    .eq('user_id', id);

  const { data: projectMemberships } = await supabase
    .from('project_memberships')
    .select('project_id, role, projects(name)')
    .eq('user_id', id);

  const hasActiveMemberships = memberships?.some(m => m.status === 'active') || false;

  const cardStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' };
  const sectionIcon = { background: 'var(--surface-muted)', color: 'var(--text-subtle)' } as const;

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
            <Link href="/users" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Users</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <span className="font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{user.full_name || user.email}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-lg p-6 mb-6" style={cardStyle}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>{user.full_name || user.email}</h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
          <UserRoleChanger userId={user.id} currentRole={user.role} />
        </div>
        <div className="mt-4">
          <UserStatusActions userId={user.id} hasActiveMemberships={hasActiveMemberships} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Organization Memberships */}
        <div className="rounded-lg" style={cardStyle}>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={sectionIcon}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Organization Memberships</h2>
              <span className="text-[11px] ml-auto" style={{ color: 'var(--text-subtle)' }}>{memberships?.length ?? 0}</span>
            </div>

            {!memberships || memberships.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>No memberships.</p>
            ) : (
              <div>
                {memberships.map((m) => {
                  const isDanger = m.status === 'suspended' || m.status === 'removed';
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-3 gap-3"
                      style={{ borderBottom: '1px solid var(--border-default)' }}
                    >
                      <Link href={`/organizations/${m.organization_id}`} className="text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>
                        {(m as any).organizations?.name || m.organization_id}
                      </Link>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>{m.role}</span>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            background: isDanger ? 'var(--danger-tint)' : 'var(--surface-muted)',
                            color: isDanger ? 'var(--danger-text)' : 'var(--text-muted)',
                          }}
                        >
                          <span
                            className="w-1 h-1 rounded-full"
                            style={{ background: isDanger ? 'var(--danger-solid)' : m.status === 'active' ? 'var(--success-solid)' : 'var(--text-subtle)' }}
                          />
                          {m.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Project Memberships */}
        <div className="rounded-lg" style={cardStyle}>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={sectionIcon}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Project Memberships</h2>
              <span className="text-[11px] ml-auto" style={{ color: 'var(--text-subtle)' }}>{projectMemberships?.length ?? 0}</span>
            </div>

            {!projectMemberships || projectMemberships.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>No project memberships.</p>
            ) : (
              <div>
                {projectMemberships.map((pm) => (
                  <div
                    key={pm.project_id}
                    className="flex items-center justify-between py-3 gap-3"
                    style={{ borderBottom: '1px solid var(--border-default)' }}
                  >
                    <Link href={`/projects/${pm.project_id}`} className="text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>
                      {(pm as any).projects?.name || pm.project_id}
                    </Link>
                    <span className="text-[11px] shrink-0" style={{ color: 'var(--text-subtle)' }}>{pm.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
