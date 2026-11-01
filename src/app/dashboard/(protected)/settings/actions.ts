'use server';

import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const user = await requireAuth('/login');
  const supabase = createAdminClient();

  const fullName = (formData.get('full_name') as string)?.trim() || null;
  const avatarUrl = (formData.get('avatar_url') as string)?.trim() || null;

  await supabase
    .from('user_profiles')
    .update({ full_name: fullName, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  revalidatePath('/dashboard/settings');
}

export async function updateEmail(formData: FormData) {
  const user = await requireAuth('/login');
  const supabase = createAdminClient();

  const email = (formData.get('email') as string)?.trim();
  if (!email) return;

  await supabase.auth.admin.updateUserById(user.id, { email });
  await supabase
    .from('user_profiles')
    .update({ email, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  revalidatePath('/dashboard/settings');
}

export async function updatePassword(formData: FormData) {
  const user = await requireAuth('/login');
  const supabase = createAdminClient();

  const password = formData.get('password') as string;
  if (!password || password.length < 6) return;

  await supabase.auth.admin.updateUserById(user.id, { password });
  revalidatePath('/dashboard/settings');
}
