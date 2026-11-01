import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { StatusActions } from './status-actions';
import { InviteForm } from './invite-form';
import { EditOrgForm } from './edit-org-form';
import { MemberActions } from './member-actions';
import { DeleteOrgButton } from './delete-org-button';
import KanbanBoard from './kanban-board';

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  await requireFounder();
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !org) {
    notFound();
  }

  const { data: members } = await supabase
    .from('organization_memberships')
    .select('id, user_id, role, status, created_at')
    .eq('organization_id', id)
    .neq('status', 'removed')
    .order('created_at', { ascending: true });

  const { data: invitations } = await supabase
    .from('invitations')
    .select('id, email, role, status, created_at')
    .eq('organization_id', id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const memberProfiles: Record<string, { email: string; hasLoggedIn: boolean }> = {};
  if (members && members.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, email')
      .in('id', members.map((m) => m.user_id));

    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authMap = new Map(authUsers?.users?.map(u => [u.id, u]) ?? []);

    members.forEach((m) => {
      const profile = profiles?.find(p => p.id === m.user_id);
      const authUser = authMap.get(m.user_id);
      memberProfiles[m.user_id] = {
        email: profile?.email || authUser?.email || m.user_id,
        hasLoggedIn: !!authUser?.last_sign_in_at,
      };
    });
  }

  // Fetch projects, tasks, and project memberships for Kanban
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, status')
    .eq('org_id', id)
    .order('created_at', { ascending: false });

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, description, status, priority, assigned_to, project_id, created_at')
    .eq('org_id', id)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  const projectIds = (projects ?? []).map(p => p.id);
  let projectMemberships: { project_id: string; user_id: string; role: string; email: string }[] = [];
  if (projectIds.length > 0) {
    const { data: pm } = await supabase
      .from('project_members')
      .select('project_id, user_id, role')
      .in('project_id', projectIds);
    projectMemberships = (pm ?? []).map(m => ({
      ...m,
      email: memberProfiles[m.user_id]?.email || m.user_id,
    }));
  }

  const orgMembers = (members ?? [])
    .filter(m => m.status === 'active')
    .map(m => ({
      user_id: m.user_id,
      email: memberProfiles[m.user_id]?.email || m.user_id,
      role: m.role,
    }));

  const activeMembers = members?.filter(m => m.status === 'active').length ?? 0;
  const pendingCount = invitations?.length ?? 0;
  const totalMembers = activeMembers;
  const initial = org.name[0]?.toUpperCase() ?? '?';
  const isActive = org.status === 'active';
  const isSuspended = org.status === 'suspended';

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
            <Link href="/organizations" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Organizations</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <span className="font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{org.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <div
        className="rounded-lg mb-5 overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
      >
        {/* Accent bar */}
        <div style={{ height: '3px', background: isSuspended ? 'var(--danger-solid)' : 'var(--accent-solid)' }} />

        <div className="px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center text-[17px] font-bold shrink-0"
                style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{org.name}</h1>
                  <EditOrgForm orgId={org.id} name={org.name} logoUrl={org.logo_url} />
                </div>
                <p className="text-[12px] font-mono mt-0.5" style={{ color: 'var(--text-subtle)' }}>{org.slug}.pentarch.agency</p>
              </div>
            </div>
            <StatusActions orgId={org.id} currentStatus={org.status} />
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="flex items-center gap-6 px-6 py-3 text-[12px]"
          style={{ background: 'var(--surface-muted)', borderTop: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <span style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{activeMembers}</span> active
            </span>
          </div>
          {pendingCount > 0 && (
            <>
              <span style={{ color: 'var(--border-default)' }}>|</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ color: 'var(--text-muted)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pendingCount}</span> pending
                </span>
              </div>
            </>
          )}
          <span style={{ color: 'var(--border-default)' }}>|</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span style={{ color: 'var(--text-muted)' }}>
              Created {new Date(org.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Members Section — full width */}
      <div
        className="rounded-lg mb-5"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <h2 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Members</h2>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
              style={{ background: 'var(--surface-muted)', color: 'var(--text-subtle)' }}
            >
              {totalMembers}
            </span>
          </div>
        </div>

        {!members || members.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>No members yet. Send an invitation below.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {members.map((m) => {
              const profile = memberProfiles[m.user_id];
              const email = profile?.email || m.user_id;
              const emailInitial = email[0]?.toUpperCase() ?? '?';
              const hasLoggedIn = profile?.hasLoggedIn ?? false;
              const isSuspendedMember = m.status === 'suspended';
              const avatarColors = [
                ['#EEF2FF', '#6366F1'], ['#FDF2F8', '#EC4899'], ['#ECFDF5', '#10B981'],
                ['#FFF7ED', '#F97316'], ['#F0F9FF', '#0EA5E9'], ['#FAF5FF', '#A855F7'],
              ];
              const colorIdx = email.charCodeAt(0) % avatarColors.length;
              const [avatarBg, avatarFg] = avatarColors[colorIdx];

              return (
                <div
                  key={m.id}
                  className="flex items-center gap-4 px-5 py-3.5 onlee-row"
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0"
                    style={{ background: avatarBg, color: avatarFg }}
                  >
                    {emailInitial}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{email}</span>
                      {!hasLoggedIn && m.status === 'active' && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider" style={{ background: 'var(--warning-tint, #FEF3C7)', color: 'var(--warning-text, #92400E)' }}>
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] capitalize" style={{ color: 'var(--text-subtle)' }}>{m.role}</span>
                      <span className="text-[11px]" style={{ color: 'var(--border-default)' }}>&middot;</span>
                      <span
                        className="inline-flex items-center gap-1 text-[11px]"
                        style={{ color: isSuspendedMember ? 'var(--danger-text)' : 'var(--text-subtle)' }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: isSuspendedMember ? 'var(--danger-solid)' : 'var(--success-solid)' }}
                        />
                        {m.status}
                      </span>
                      <span className="text-[11px] hidden sm:inline" style={{ color: 'var(--border-default)' }}>&middot;</span>
                      <span className="text-[11px] hidden sm:inline" style={{ color: 'var(--text-subtle)' }}>
                        {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    <MemberActions membershipId={m.id} currentRole={m.role} currentStatus={m.status} orgId={id} userId={m.user_id} hasLoggedIn={hasLoggedIn} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="mb-5">
        <KanbanBoard
          orgId={id}
          tasks={tasks ?? []}
          projects={projects ?? []}
          members={orgMembers}
          projectMemberships={projectMemberships}
        />
      </div>

      {/* Two-column: Invite + Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Invite Card */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div
            className="flex items-center gap-2.5 px-5 py-3.5"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <h2 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Invite Member</h2>
          </div>
          <div className="p-5">
            <InviteForm orgId={org.id} />
          </div>
        </div>

        {/* Pending Invitations */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Pending Invitations</h2>
            </div>
            {pendingCount > 0 && (
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
                style={{ background: 'var(--surface-muted)', color: 'var(--text-subtle)' }}
              >
                {pendingCount}
              </span>
            )}
          </div>

          {!invitations || invitations.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>No pending invitations</p>
            </div>
          ) : (
            <div>
              {invitations.map((inv, i) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-5 py-3 gap-3"
                  style={{ borderBottom: i < invitations.length - 1 ? '1px solid var(--border-default)' : 'none' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
                    >
                      {inv.email[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>{inv.email}</p>
                      <p className="text-[11px] capitalize" style={{ color: 'var(--text-subtle)' }}>{inv.role}</p>
                    </div>
                  </div>
                  <span className="text-[11px] shrink-0" style={{ color: 'var(--text-subtle)' }}>
                    {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone — compact */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid var(--danger-border, var(--border-default))' }}
      >
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ background: 'var(--danger-tint)', borderBottom: '1px solid var(--danger-border, var(--border-default))' }}
        >
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4" style={{ color: 'var(--danger-text)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h2 className="text-[13px] font-semibold" style={{ color: 'var(--danger-text)' }}>Danger Zone</h2>
          </div>
        </div>
        <div className="px-5 py-4" style={{ background: 'var(--surface-card)' }}>
          <DeleteOrgButton orgId={org.id} orgName={org.name} />
        </div>
      </div>
    </div>
  );
}
