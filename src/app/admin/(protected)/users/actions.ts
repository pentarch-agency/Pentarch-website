'use server';

import { requireFounder } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function updateUserRole(userId: string, role: string) {
  await requireFounder();
  if (!['founder', 'team_member', 'client'].includes(role)) return { error: 'Invalid role.' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('user_profiles').update({ role }).eq('id', userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deactivateUser(userId: string) {
  await requireFounder();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('organization_memberships')
    .update({ status: 'suspended' })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) return { error: error.message };
  return { success: true };
}

export async function reactivateUser(userId: string) {
  await requireFounder();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('organization_memberships')
    .update({ status: 'active' })
    .eq('user_id', userId)
    .eq('status', 'suspended');

  if (error) return { error: error.message };
  return { success: true };
}
