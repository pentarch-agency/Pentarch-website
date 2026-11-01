'use server';

import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function createProject(formData: FormData) {
  await requireFounder();

  const name = (formData.get('name') as string)?.trim();
  const orgId = formData.get('organization_id') as string;
  const description = (formData.get('description') as string)?.trim() || null;
  const clientVisible = formData.get('client_visible') === 'on';

  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters.' };
  if (!orgId) return { error: 'Organization is required.' };

  const user = await requireFounder();
  const supabase = createAdminClient();

  const { error } = await supabase.from('projects').insert({
    name,
    organization_id: orgId,
    description,
    client_visible: clientVisible,
    status: 'active',
    created_by: user.id,
  });

  if (error) return { error: error.message };
  redirect('/projects');
}

export async function updateProject(projectId: string, data: {
  name?: string;
  description?: string | null;
  status?: string;
  client_visible?: boolean;
}) {
  await requireFounder();

  if (data.name !== undefined && data.name.trim().length < 2) {
    return { error: 'Name must be at least 2 characters.' };
  }
  if (data.status !== undefined && !['active', 'completed', 'on_hold', 'cancelled'].includes(data.status)) {
    return { error: 'Invalid status.' };
  }

  const supabase = createAdminClient();
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name.trim();
  if (data.description !== undefined) update.description = data.description;
  if (data.status !== undefined) update.status = data.status;
  if (data.client_visible !== undefined) update.client_visible = data.client_visible;

  const { error } = await supabase.from('projects').update(update).eq('id', projectId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteProject(projectId: string) {
  await requireFounder();
  const supabase = createAdminClient();

  await supabase.from('tasks').delete().eq('project_id', projectId);
  await supabase.from('milestones').delete().eq('project_id', projectId);
  await supabase.from('project_memberships').delete().eq('project_id', projectId);
  await supabase.from('projects').delete().eq('id', projectId);

  redirect('/projects');
}

export async function addMilestone(formData: FormData) {
  await requireFounder();

  const projectId = formData.get('project_id') as string;
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const dueDate = (formData.get('due_date') as string) || null;

  if (!name || name.length < 2) return { error: 'Name is required.' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('milestones').insert({
    project_id: projectId,
    name,
    description,
    due_date: dueDate || null,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteMilestone(milestoneId: string) {
  await requireFounder();
  const supabase = createAdminClient();
  await supabase.from('tasks').update({ milestone_id: null }).eq('milestone_id', milestoneId);
  const { error } = await supabase.from('milestones').delete().eq('id', milestoneId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function addProjectMember(projectId: string, userId: string, role: string) {
  await requireFounder();
  if (!['viewer', 'contributor', 'manager'].includes(role)) return { error: 'Invalid role.' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('project_memberships').insert({
    project_id: projectId,
    user_id: userId,
    role,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function removeProjectMember(projectId: string, userId: string) {
  await requireFounder();
  const supabase = createAdminClient();
  const { error } = await supabase.from('project_memberships').delete()
    .eq('project_id', projectId).eq('user_id', userId);
  if (error) return { error: error.message };
  return { success: true };
}
