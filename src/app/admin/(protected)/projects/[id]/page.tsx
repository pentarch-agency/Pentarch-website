import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { EditProjectForm } from './edit-project-form';
import { MilestoneSection } from './milestone-section';
import { DeleteProjectButton } from './delete-project-button';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  await requireFounder();
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: project, error } = await supabase
    .from('projects')
    .select('*, organizations(name, slug)')
    .eq('id', id)
    .single();

  if (error || !project) notFound();

  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', id)
    .order('due_date', { ascending: true, nullsFirst: false });

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, priority, assigned_to, milestone_id')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  const { data: members } = await supabase
    .from('project_memberships')
    .select('user_id, role')
    .eq('project_id', id);

  const userIds = [...new Set([
    ...(members?.map(m => m.user_id) || []),
    ...(tasks?.map(t => t.assigned_to).filter(Boolean) || []),
  ])];
  const profileMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from('user_profiles').select('id, email').in('id', userIds);
    profiles?.forEach(p => { profileMap[p.id] = p.email; });
  }

  const org = project.organizations as any;
  const isDangerStatus = project.status === 'cancelled';

  const cardStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' };
  const sectionIcon = {
    width: '36px', height: '36px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--surface-muted)',
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
            <Link href="/projects" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Projects</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <span className="font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{project.name}</span>
          </div>
        </div>
      </div>

      {/* Header Card */}
      <div className="rounded-lg p-6 mb-5" style={cardStyle}>
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>{project.name}</h1>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{
                  background: isDangerStatus ? 'var(--danger-tint)' : 'var(--surface-muted)',
                  color: isDangerStatus ? 'var(--danger-text)' : 'var(--text-muted)',
                }}
              >
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: isDangerStatus ? 'var(--danger-solid)' : project.status === 'active' ? 'var(--success-solid)' : 'var(--text-subtle)' }}
                />
                {project.status}
              </span>
            </div>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-subtle)' }}>
              <Link
                href={`/organizations/${project.organization_id}`}
                className="onlee-link-up"
                style={{ color: 'var(--text-muted)' }}
              >
                {org?.name}
              </Link>
            </p>
            {project.description && <p className="text-[13px] mt-2" style={{ color: 'var(--text-muted)' }}>{project.description}</p>}
          </div>
        </div>
        <EditProjectForm projectId={project.id} name={project.name} description={project.description} status={project.status} clientVisible={project.client_visible} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Milestones */}
        <div className="rounded-lg" style={cardStyle}>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div style={sectionIcon}>
                <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
              </div>
              <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Milestones</h2>
            </div>
            <MilestoneSection projectId={id} milestones={milestones || []} />
          </div>
        </div>

        {/* Members */}
        <div className="rounded-lg" style={cardStyle}>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div style={sectionIcon}>
                <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Project Members</h2>
              <span className="text-[11px] ml-auto" style={{ color: 'var(--text-subtle)' }}>{members?.length ?? 0} total</span>
            </div>
            {!members || members.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>No members assigned.</p>
            ) : (
              <div>
                {members.map((m) => (
                  <div
                    key={m.user_id}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: '1px solid var(--border-default)' }}
                  >
                    <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{profileMap[m.user_id] || m.user_id}</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>{m.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="rounded-lg mb-5" style={cardStyle}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div style={sectionIcon}>
              <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Tasks</h2>
            <span className="text-[11px] ml-auto" style={{ color: 'var(--text-subtle)' }}>{tasks?.length || 0} total</span>
          </div>
          {!tasks || tasks.length === 0 ? (
            <p className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>No tasks yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <th className="text-left pb-2 data-sm" style={{ color: 'var(--text-subtle)' }}>Title</th>
                  <th className="text-left pb-2 data-sm" style={{ color: 'var(--text-subtle)' }}>Status</th>
                  <th className="text-left pb-2 data-sm" style={{ color: 'var(--text-subtle)' }}>Priority</th>
                  <th className="text-left pb-2 data-sm" style={{ color: 'var(--text-subtle)' }}>Assigned</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <td className="py-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      <Link
                        href={`/tasks/${t.id}`}
                        className="onlee-link-accent"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td className="py-3 text-[13px]" style={{ color: 'var(--text-muted)' }}>{t.status}</td>
                    <td className="py-3 text-[13px]" style={{ color: 'var(--text-muted)' }}>{t.priority}</td>
                    <td className="py-3 text-[13px]" style={{ color: 'var(--text-muted)' }}>{t.assigned_to ? profileMap[t.assigned_to] || t.assigned_to : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg" style={cardStyle}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              style={{ background: 'var(--danger-tint)' }}
            >
              <svg className="w-4 h-4" style={{ color: 'var(--danger-text)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--danger-text)' }}>Danger Zone</h2>
          </div>
          <DeleteProjectButton projectId={project.id} projectName={project.name} />
        </div>
      </div>
    </div>
  );
}
