import { connection } from 'next/server';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  todo: { label: 'To Do', bg: 'rgba(148,163,184,0.1)', text: '#94A3B8', dot: '#94A3B8' },
  in_progress: { label: 'In Progress', bg: 'rgba(59,130,246,0.1)', text: '#3B82F6', dot: '#3B82F6' },
  review: { label: 'Review', bg: 'rgba(168,85,247,0.1)', text: '#A855F7', dot: '#A855F7' },
  done: { label: 'Done', bg: 'rgba(34,197,94,0.1)', text: '#22C55E', dot: '#22C55E' },
  cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.1)', text: '#EF4444', dot: '#EF4444' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: '#EF4444' },
  high: { label: 'High', color: '#F59E0B' },
  medium: { label: 'Medium', color: '#3B82F6' },
  low: { label: 'Low', color: '#94A3B8' },
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  project_id: string;
  org_id: string;
  updated_at: string;
  created_at: string;
};

export default async function TasksPage() {
  await connection();
  const user = await requireAuth('/login');
  const supabase = createAdminClient();

  const { data: memberships } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active');

  const orgIds = (memberships ?? []).map((m) => m.organization_id);

  let tasks: Task[] = [];

  if (orgIds.length > 0) {
    const { data } = await supabase
      .from('tasks')
      .select('id, title, description, status, priority, assigned_to, project_id, org_id, updated_at, created_at')
      .in('org_id', orgIds)
      .order('created_at', { ascending: false });

    tasks = (data ?? []) as Task[];
  }

  const groups: Record<string, Task[]> = { todo: [], in_progress: [], review: [], done: [], cancelled: [] };
  for (const t of tasks) {
    (groups[t.status] ?? groups.todo).push(t);
  }

  const openCount = tasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled').length;

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="display-sm" style={{ color: 'var(--text-muted)' }}>
            <Link href="/dashboard" className="onlee-link-accent">Dashboard</Link>
            <span className="mx-1.5">/</span>
            Tasks
          </p>
          <h1 className="text-[1.5rem] font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            Tasks
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
            {openCount} open
          </span>
          <span className="text-[12px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
            {groups.done.length} done
          </span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div
          className="rounded-xl py-20 text-center"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No tasks yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tasks from your organizations will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(['in_progress', 'todo', 'review', 'done', 'cancelled'] as const).map((status) => {
            const items = groups[status];
            if (items.length === 0) return null;
            const sc = statusConfig[status];

            return (
              <div key={status}>
                {/* Section header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: sc.dot }} />
                  <h2 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{sc.label}</h2>
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: sc.bg, color: sc.text }}>
                    {items.length}
                  </span>
                </div>

                {/* Task list */}
                <div
                  className="rounded-xl overflow-hidden divide-y"
                  style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderColor: 'var(--border-default)' }}
                >
                  {items.map((task) => {
                    const pc = priorityConfig[task.priority] ?? priorityConfig.medium;
                    const updated = new Date(task.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 px-5 py-3.5 onlee-row transition-colors"
                        style={{ borderColor: 'var(--border-default)' }}
                      >
                        {/* Priority indicator */}
                        <div className="shrink-0" title={pc.label}>
                          <div className="w-1.5 h-8 rounded-full" style={{ background: pc.color, opacity: 0.7 }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{task.priority}</span>
                          </div>
                        </div>

                        {/* Priority badge */}
                        <span
                          className="hidden sm:inline text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: `${pc.color}15`, color: pc.color }}
                        >
                          {pc.label}
                        </span>

                        {/* Date */}
                        <span className="hidden md:inline text-[11px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {updated}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
