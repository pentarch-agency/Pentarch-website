'use server';

import { revalidatePath } from 'next/cache';
import { requireFounder } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function uploadAvatar(formData: FormData) {
  const user = await requireFounder();
  const file = formData.get('avatar') as File;
  if (!file || !file.type.startsWith('image/')) {
    return { error: 'Invalid image file' };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: 'Image must be under 2MB' };
  }

  const supabase = createAdminClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath('/admin/settings');
  return { success: true };
}

export async function removeAvatar() {
  const user = await requireFounder();
  const supabase = createAdminClient();

  const { data: files } = await supabase.storage.from('avatars').list(user.id);
  if (files && files.length > 0) {
    await supabase.storage.from('avatars').remove(files.map(f => `${user.id}/${f.name}`));
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ avatar_url: null })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/settings');
  return { success: true };
}

export async function updateFounderName(formData: FormData) {
  const user = await requireFounder();
  const firstName = (formData.get('first_name') as string)?.trim() || null;
  const lastName = (formData.get('last_name') as string)?.trim() || null;
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('user_profiles')
    .update({ first_name: firstName, last_name: lastName, full_name: fullName })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateEmail(formData: FormData) {
  await requireFounder();
  const email = (formData.get('email') as string)?.trim();
  if (!email) return { error: 'Email is required' };

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(
    (await requireFounder()).id,
    { email }
  );

  if (error) return { error: error.message };

  revalidatePath('/admin/settings');
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const user = await requireFounder();
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm_password') as string;

  if (!password || password.length < 8) return { error: 'Password must be at least 8 characters' };
  if (password !== confirm) return { error: 'Passwords do not match' };

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePlatformSettings(formData: FormData) {
  await requireFounder();
  const field = formData.get('field') as string;
  const value = (formData.get('value') as string)?.trim();

  const allowed = ['platform_name', 'domain', 'timezone'];
  if (!allowed.includes(field)) return { error: 'Invalid field' };
  if (!value) return { error: 'Value is required' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('platform_settings')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .not('id', 'is', null);

  if (error) return { error: error.message };

  revalidatePath('/admin/settings');
  return { success: true };
}

export async function toggleMaintenance(settingsId: string, enabled: boolean) {
  await requireFounder();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('platform_settings')
    .update({ maintenance_mode: enabled, updated_at: new Date().toISOString() })
    .eq('id', settingsId);

  if (error) return { error: error.message };

  revalidatePath('/admin/settings');
  return { success: true };
}
