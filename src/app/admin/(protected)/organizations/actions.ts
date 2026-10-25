'use server';

import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/;

export async function createOrganization(formData: FormData) {
  await requireFounder();

  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim().toLowerCase();

  if (!name || name.length < 2) {
    return { error: 'Name must be at least 2 characters.' };
  }
  if (!slug || !SLUG_REGEX.test(slug)) {
    return { error: 'Slug must be lowercase letters, numbers, and hyphens (3–63 chars).' };
  }

  const supabase = createAdminClient();

  // Check slug uniqueness in hostname_registry
  const { data: existing } = await supabase
    .from('hostname_registry')
    .select('slug')
    .eq('slug', slug)
    .single();

  if (existing) {
    return { error: 'That slug is already taken.' };
  }

  // Register slug first, then create org (FK constraint)
  const { error: registryError } = await supabase
    .from('hostname_registry')
    .insert({ slug, entity_type: 'organization' });

  if (registryError) {
    return { error: `Failed to register slug: ${registryError.message}` };
  }

  const { error: orgError } = await supabase
    .from('organizations')
    .insert({ name, slug, status: 'pending_setup' });

  if (orgError) {
    // Rollback hostname_registry entry
    await supabase.from('hostname_registry').delete().eq('slug', slug);
    return { error: `Failed to create organization: ${orgError.message}` };
  }

  redirect('/admin/organizations');
}

export async function updateOrganizationStatus(orgId: string, status: string) {
  await requireFounder();

  const validStatuses = ['active', 'pending_setup', 'suspended', 'archived'];
  if (!validStatuses.includes(status)) {
    return { error: 'Invalid status.' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('organizations')
    .update({ status })
    .eq('id', orgId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function inviteMember(formData: FormData) {
  await requireFounder();

  const orgId = formData.get('organization_id') as string;
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const role = (formData.get('role') as string) || 'client_member';

  if (!email || !email.includes('@')) {
    return { error: 'Valid email required.' };
  }

  const validRoles = ['client_admin', 'client_member'];
  if (!validRoles.includes(role)) {
    return { error: 'Invalid role.' };
  }

  const supabase = createAdminClient();

  // Check for existing pending invitation
  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('id')
    .eq('organization_id', orgId)
    .eq('email', email)
    .eq('status', 'pending')
    .single();

  if (existingInvite) {
    return { error: 'An invitation is already pending for this email.' };
  }

  // Get the current founder user
  const user = await requireFounder();

  const { error } = await supabase
    .from('invitations')
    .insert({
      organization_id: orgId,
      email,
      role,
      invited_by: user.id,
    });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
