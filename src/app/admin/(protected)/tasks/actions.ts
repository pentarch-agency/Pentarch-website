'use server';

import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function createTask(formData: FormData) {
  await requireFounder();

  const title = (formData.get('title') as string)?.trim();
  const projectId = formData.get('project_id') as string;
  const orgId = formData.get('organization_id') as string;
  const description = (formData.get('description') as string)?.trim() || null;
  const priority = (formData.get('priority') as string) || 'medium';
  const milestoneId = (formData.get('milestone_id') as string) || null;

  if (!title || title.length < 2) return { error: 'Title is required.' };
  if (!projectId) return { error: 'Project is required.' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('tasks').insert({
    title,
    project_id: projectId,
    organization_id: orgId,
    description,
    priority,
    milestone_id: milestoneId || null,
    status: 'todo',
  });

  if (error) return { error: error.message };
  redirect('/tasks');
}

export async function updateTask(taskId: string, data: {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  assigned_to?: string | null;
  milestone_id?: string | null;
  client_visible?: boolean;
}) {
  await requireFounder();

  const validStatuses = ['todo', 'in_progress', 'review', 'done', 'cancelled'];
  const validPriorities = ['low', 'medium', 'high', 'urgent'];

  if (data.status !== undefined && !validStatuses.includes(data.status)) return { error: 'Invalid status.' };
  if (data.priority !== undefined && !validPriorities.includes(data.priority)) return { error: 'Invalid priority.' };

  const supabase = createAdminClient();
  const update: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) update[key] = val;
  }

  const { error } = await supabase.from('tasks').update(update).eq('id', taskId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteTask(taskId: string) {
  await requireFounder();
  const supabase = createAdminClient();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) return { error: error.message };
  redirect('/tasks');
}
