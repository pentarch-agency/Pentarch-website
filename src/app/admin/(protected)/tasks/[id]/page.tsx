import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TaskEditor } from './task-editor';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  await requireFounder();
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*, projects(name, organization_id)')
    .eq('id', id)
    .single();

  if (error || !task) notFound();

  const { data: orgMembers } = await supabase
    .from('organization_memberships')
    .select('user_id, user_profiles(email)')
    .eq('organization_id', task.organization_id)
    .eq('status', 'active');

  const { data: milestones } = await supabase
    .from('milestones')
    .select('id, name')
    .eq('project_id', task.project_id);

  const assignableUsers = orgMembers?.map(m => ({
    id: m.user_id,
    email: (m as any).user_profiles?.email || m.user_id,
  })) || [];

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
            <Link href="/tasks" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Tasks</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <span className="font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
          </div>
        </div>
      </div>

      <TaskEditor
        task={task}
        assignableUsers={assignableUsers}
        milestones={milestones || []}
      />
    </div>
  );
}
