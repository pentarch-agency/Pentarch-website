'use server';

import { revalidatePath } from 'next/cache';
import { requireFounder } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function createOrgProject(orgId: string, name: string, description?: string) {
  const user = await requireFounder();
  if (!name || name.trim().length < 2) return { error: 'Name must be at least 2 characters.' };

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('projects').insert({
    name: name.trim(),
    org_id: orgId,
    owner_id: user.id,
    description: description?.trim() || '',
  } as any).select('id').single();

  if (error) return { error: error.message };
  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true, projectId: data.id };
}

export async function createOrgTask(data: {
  title: string;
  projectId: string;
  orgId: string;
  description?: string;
  priority?: string;
  assignedTo?: string;
}) {
  const user = await requireFounder();
  if (!data.title || data.title.trim().length < 2) return { error: 'Title is required.' };
  if (!data.projectId) return { error: 'Project is required.' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('tasks').insert({
    title: data.title.trim(),
    project_id: data.projectId,
    org_id: data.orgId,
    description: data.description?.trim() || '',
    priority: data.priority || 'medium',
    assigned_to: data.assignedTo || null,
    created_by: user.id,
    status: 'todo',
  } as any);

  if (error) return { error: error.message };
  revalidatePath(`/admin/organizations/${data.orgId}`);
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: string, orgId: string) {
  await requireFounder();
  const valid = ['todo', 'in_progress', 'review', 'done', 'cancelled'];
  if (!valid.includes(status)) return { error: 'Invalid status.' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true };
}

export async function deleteOrgTask(taskId: string, orgId: string) {
  await requireFounder();
  const supabase = createAdminClient();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true };
}

export async function addOrgProjectMember(projectId: string, userId: string, role: string, orgId: string) {
  await requireFounder();
  if (!['viewer', 'contributor', 'manager'].includes(role)) return { error: 'Invalid role.' };

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return { error: 'User is already a member of this project.' };

  const { error } = await supabase.from('project_members').insert({
    project_id: projectId,
    user_id: userId,
    role,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true };
}

export async function removeOrgProjectMember(projectId: string, userId: string, orgId: string) {
  await requireFounder();
  const supabase = createAdminClient();
  const { error } = await supabase.from('project_members').delete()
    .eq('project_id', projectId).eq('user_id', userId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true };
}

export async function updateTask(taskId: string, orgId: string, updates: {
  title?: string;
  description?: string;
  priority?: string;
  assigned_to?: string | null;
  project_id?: string;
}) {
  const user = await requireFounder();
  const supabase = createAdminClient();
  const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
  if (error) return { error: error.message };

  await supabase.from('task_activity').insert({
    task_id: taskId,
    user_id: user.id,
    action: 'updated',
    details: { fields: Object.keys(updates) },
  });

  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true };
}

export async function addTaskComment(taskId: string, orgId: string, content: string) {
  const user = await requireFounder();
  if (!content.trim()) return { error: 'Comment cannot be empty.' };

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('task_comments').insert({
    task_id: taskId,
    user_id: user.id,
    content: content.trim(),
  }).select('id, content, created_at, user_id').single();

  if (error) return { error: error.message };

  await supabase.from('task_activity').insert({
    task_id: taskId,
    user_id: user.id,
    action: 'commented',
    details: { comment_id: data.id },
  });

  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true, comment: data };
}

export async function getTaskComments(taskId: string) {
  await requireFounder();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('task_comments')
    .select('id, content, created_at, updated_at, user_id')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  if (error) return { error: error.message, comments: [] };
  return { comments: data || [] };
}

export async function updateTaskComment(commentId: string, orgId: string, content: string) {
  const user = await requireFounder();
  if (!content.trim()) return { error: 'Comment cannot be empty.' };

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('task_comments')
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', user.id)
    .select('id, content, created_at, updated_at, user_id')
    .single();

  if (error) return { error: error.message };
  return { success: true, comment: data };
}

export async function getTaskActivity(taskId: string) {
  await requireFounder();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('task_activity')
    .select('id, action, details, created_at, user_id')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return { error: error.message, activity: [] };
  return { activity: data || [] };
}

export async function addTaskAttachment(taskId: string, orgId: string, fileName: string, fileUrl: string, fileSize: number, mimeType: string) {
  const user = await requireFounder();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('task_attachments').insert({
    task_id: taskId,
    uploaded_by: user.id,
    file_name: fileName,
    file_url: fileUrl,
    file_size: fileSize,
    mime_type: mimeType,
  }).select('id, file_name, file_url, file_size, mime_type, created_at').single();

  if (error) return { error: error.message };

  await supabase.from('task_activity').insert({
    task_id: taskId,
    user_id: user.id,
    action: 'attached_file',
    details: { file_name: fileName },
  });

  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true, attachment: data };
}

export async function getTaskAttachments(taskId: string) {
  await requireFounder();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('task_attachments')
    .select('id, file_name, file_url, file_size, mime_type, created_at, uploaded_by')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });
  if (error) return { error: error.message, attachments: [] };
  return { attachments: data || [] };
}

export async function deleteTaskAttachment(attachmentId: string, orgId: string) {
  await requireFounder();
  const supabase = createAdminClient();
  const { error } = await supabase.from('task_attachments').delete().eq('id', attachmentId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/organizations/${orgId}`);
  return { success: true };
}
