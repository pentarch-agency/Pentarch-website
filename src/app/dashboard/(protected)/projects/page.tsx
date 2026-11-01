import { connection } from 'next/server';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'rgba(34,197,94,0.1)', text: '#22C55E' },
  completed: { bg: 'rgba(99,102,241,0.1)', text: '#818CF8' },
  on_hold: { bg: 'rgba(234,179,8,0.1)', text: '#EAB308' },
  cancelled: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
};

export default async function ProjectsPage() {
  await connection();
  const user = await requireAuth('/login');
  const supabase = createAdminClient();

  // Get user's org memberships
  const { data: memberships } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active');

  const orgIds = (memberships ?? []).map((m) => m.organization_id);

  let projects: Array<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
    org_id: string;
  }> = [];

  let taskCounts: Record<string, { total: number; done: number }> = {};

  if (orgIds.length > 0) {
    const { data } = await supabase
      .from('projects')
      .select('id, name, description, status, created_at, org_id')
      .in('org_id', orgIds)
      .order('created_at', { ascending: false });

    projects = (data ?? []) as typeof projects;

    if (projects.length > 0) {
      const projectIds = projects.map((p) => p.id);
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status, project_id')
        .in('project_id', projectIds);

      for (const t of tasks ?? []) {
        if (!taskCounts[t.project_id]) taskCounts[t.project_id] = { total: 0, done: 0 };
        taskCounts[t.project_id].total++;
        if (t.status === 'done' || t.status === 'completed') taskCounts[t.project_id].done++;
      }
    }
  }

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="display-sm" style={{ color: 'var(--text-muted)' }}>
            <Link href="/dashboard" className="onlee-link-accent">Dashboard</Link>
            <span className="mx-1.5">/</span>
            Projects
          </p>
          <h1 className="text-[1.5rem] font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            Projects
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
            {activeCount} active
          </span>
          <span className="text-[12px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}>
            {completedCount} completed
          </span>
        </div>
      </div>

      {/* Projects */}
      {projects.length === 0 ? (
        <div
          className="rounded-xl py-20 text-center"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No projects yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Projects from your organizations will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => {
            const tc = taskCounts[project.id] ?? { total: 0, done: 0 };
            const progress = tc.total > 0 ? Math.round((tc.done / tc.total) * 100) : 0;
            const sc = statusColors[project.status] ?? statusColors.active;
            const updated = new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <div
                key={project.id}
                className="rounded-xl p-5 onlee-card transition-all"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, #5478D9, #7E9FF5)', color: '#fff' }}
                    >
                      {project.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{project.name}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>&nbsp;</p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 capitalize"
                    style={{ background: sc.bg, color: sc.text }}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-[12px] leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {project.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      {tc.done}/{tc.total} tasks
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-raised)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #5478D9, #7E9FF5)' }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Updated {updated}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
