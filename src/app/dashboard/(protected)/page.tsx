import { connection } from 'next/server';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardOverviewPage() {
  await connection();
  const user = await requireAuth('/login');

  const supabase = createAdminClient();

  const [profileRes, membershipsRes] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, first_name, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('organization_memberships')
      .select('role, organization_id, organizations(id, name, slug, status)')
      .eq('user_id', user.id)
      .eq('status', 'active'),
  ]);

  const profile = profileRes.data;
  const memberships = (membershipsRes.data ?? []) as unknown as Array<{
    role: string;
    organization_id: string;
    organizations: { id: string; name: string; slug: string; status: string } | null;
  }>;

  const firstName = profile?.first_name || profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';
  const isFounder = profile?.role === 'founder';

  const activeOrgs = memberships.filter((m) => m.organizations != null);

  // Gather stats across all orgs
  const orgIds = activeOrgs.map((m) => m.organizations!.id);

  let totalProjects = 0;
  let activeProjects = 0;
  let totalTasks = 0;
  let completedTasks = 0;

  if (orgIds.length > 0) {
    const [projRes, taskRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id, status')
        .in('org_id', orgIds),
      supabase
        .from('tasks')
        .select('id, status')
        .in('org_id', orgIds),
    ]);

    const projects = projRes.data ?? [];
    totalProjects = projects.length;
    activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'in_progress').length;

    const tasks = taskRes.data ?? [];
    totalTasks = tasks.length;
    completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'done').length;
  }

  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <p className="display-sm" style={{ color: 'var(--text-muted)' }}>Dashboard</p>
        <h1 className="text-[1.5rem] font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
          {getGreeting()}, {firstName}
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Organizations" value={activeOrgs.length} icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        <StatCard label="Active Projects" value={activeProjects} subtitle={`${totalProjects} total`} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <StatCard label="Tasks" value={totalTasks} subtitle={`${completedTasks} completed`} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(126, 159, 245, 0.1)' }}>
              <svg className="w-4 h-4" style={{ color: '#7E9FF5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Progress
            </p>
          </div>
          <p className="data-xl" style={{ color: 'var(--text-primary)' }}>{taskProgress}%</p>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-raised)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${taskProgress}%`, background: 'linear-gradient(90deg, #5478D9, #7E9FF5)' }}
            />
          </div>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Organizations panel — spans 2 cols */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h2 className="display-sm" style={{ color: 'var(--text-primary)' }}>Your Organizations</h2>
            {isFounder && (
              <Link
                href="/admin"
                className="text-[12px] font-medium px-3 py-1 rounded-md transition-colors"
                style={{ color: '#7E9FF5', background: 'rgba(126,159,245,0.08)' }}
              >
                Admin Panel
              </Link>
            )}
          </div>
          <div className="px-5 pb-5">
            {activeOrgs.length === 0 ? (
              <div className="py-12 text-center">
                <svg className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No organizations yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>You&apos;ll see your organizations here once you&apos;re added to one.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeOrgs.map((m) => {
                  const org = m.organizations!;
                  return (
                    <div
                      key={org.id}
                      className="flex items-center justify-between p-3 rounded-lg onlee-row transition-colors"
                      style={{ border: '1px solid var(--border-default)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold"
                          style={{ background: 'linear-gradient(135deg, #5478D9, #7E9FF5)', color: '#fff' }}
                        >
                          {org.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{org.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{m.role} &middot; {org.slug}</p>
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: org.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)', color: org.status === 'active' ? '#22C55E' : '#EAB308' }}
                      >
                        {org.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="px-5 pt-5 pb-3">
            <h2 className="display-sm" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {[
              { label: 'View Projects', href: '/dashboard/projects', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { label: 'My Tasks', href: '/dashboard/tasks', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: 'Messages', href: '/dashboard/messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
              { label: 'Files', href: '/dashboard/files', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg onlee-row transition-colors"
                style={{ border: '1px solid var(--border-default)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(126, 159, 245, 0.1)' }}>
                  <svg className="w-4 h-4" style={{ color: '#7E9FF5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                  </svg>
                </div>
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                <svg className="w-4 h-4 ml-auto" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, subtitle, icon }: { label: string; value: number; subtitle?: string; icon: string }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(126, 159, 245, 0.1)' }}>
          <svg className="w-4 h-4" style={{ color: '#7E9FF5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
      </div>
      <p className="data-xl" style={{ color: 'var(--text-primary)' }}>{value}</p>
      {subtitle && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  );
}
