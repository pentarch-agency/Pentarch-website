'use server';

import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { sendInvitationEmail } from '@/lib/email';

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/;

export async function createOrganization(formData: FormData) {
  await requireFounder();

  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim().toLowerCase();
  const contactEmail = (formData.get('contact_email') as string)?.trim() || null;
  const contactPhone = (formData.get('contact_phone') as string)?.trim() || null;
  const website = (formData.get('website') as string)?.trim() || null;
  const industry = (formData.get('industry') as string)?.trim() || null;

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
    .insert({
      name,
      slug,
      status: 'pending_setup',
      settings: { contact_email: contactEmail, contact_phone: contactPhone, website, industry },
    });

  if (orgError) {
    // Rollback hostname_registry entry
    await supabase.from('hostname_registry').delete().eq('slug', slug);
    return { error: `Failed to create organization: ${orgError.message}` };
  }

  redirect('/organizations');
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

export async function updateOrganization(orgId: string, data: { name?: string; logo_url?: string | null }) {
  await requireFounder();

  if (data.name !== undefined && data.name.trim().length < 2) {
    return { error: 'Name must be at least 2 characters.' };
  }

  const supabase = createAdminClient();
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name.trim();
  if (data.logo_url !== undefined) update.logo_url = data.logo_url;

  const { error } = await supabase.from('organizations').update(update).eq('id', orgId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateMemberRole(membershipId: string, role: string) {
  await requireFounder();
  if (!['admin', 'member'].includes(role)) return { error: 'Invalid role.' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('organization_memberships').update({ role }).eq('id', membershipId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateMemberStatus(membershipId: string, status: string) {
  await requireFounder();
  if (!['active', 'suspended', 'removed'].includes(status)) return { error: 'Invalid status.' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('organization_memberships').update({ status }).eq('id', membershipId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function resendInvite(orgId: string, userId: string) {
  await requireFounder();

  const supabase = createAdminClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('name, slug')
    .eq('id', orgId)
    .single();

  if (!org) return { error: 'Organization not found.' };

  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  if (!userData?.user) return { error: 'User not found.' };

  if (userData.user.last_sign_in_at) {
    return { error: 'This user has already logged in.' };
  }

  const password = generatePassword();

  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { password });
  if (updateError) return { error: `Failed to reset password: ${updateError.message}` };

  try {
    await sendInvitationEmail({
      to: userData.user.email!,
      orgName: org.name,
      orgSlug: org.slug,
      role: 'member',
      password,
    });
  } catch {
    return { error: 'Password updated but email delivery failed.' };
  }

  return { success: true };
}

export async function deleteOrganization(orgId: string) {
  await requireFounder();
  const supabase = createAdminClient();

  const { data: org } = await supabase.from('organizations').select('slug').eq('id', orgId).single();
  if (!org) return { error: 'Organization not found.' };

  // Cascade delete in dependency order
  await supabase.from('notifications').delete().eq('organization_id', orgId);
  await supabase.from('messages').delete().in('discussion_id',
    (await supabase.from('discussions').select('id').eq('organization_id', orgId)).data?.map(d => d.id) || []
  );
  await supabase.from('discussions').delete().eq('organization_id', orgId);
  await supabase.from('files').delete().eq('organization_id', orgId);

  const { data: projects } = await supabase.from('projects').select('id').eq('organization_id', orgId);
  const projectIds = projects?.map(p => p.id) || [];
  if (projectIds.length > 0) {
    await supabase.from('tasks').delete().in('project_id', projectIds);
    await supabase.from('milestones').delete().in('project_id', projectIds);
    await supabase.from('project_memberships').delete().in('project_id', projectIds);
  }
  await supabase.from('projects').delete().eq('organization_id', orgId);
  await supabase.from('invitations').delete().eq('organization_id', orgId);
  await supabase.from('organization_memberships').delete().eq('organization_id', orgId);
  await supabase.from('audit_events').delete().eq('organization_id', orgId);
  await supabase.from('organizations').delete().eq('id', orgId);
  await supabase.from('hostname_registry').delete().eq('slug', org.slug);

  redirect('/organizations');
}

function generatePassword(length = 16): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => chars[b % chars.length]).join('');
}

export async function inviteMember(formData: FormData) {
  await requireFounder();

  const orgId = formData.get('organization_id') as string;
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const role = (formData.get('role') as string) || 'member';

  if (!email || !email.includes('@')) {
    return { error: 'Valid email required.' };
  }

  const validRoles = ['admin', 'member'];
  if (!validRoles.includes(role)) {
    return { error: 'Invalid role.' };
  }

  const supabase = createAdminClient();

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === email);

  let reactivated = false;
  if (existing) {
    const { data: existingMembership } = await supabase
      .from('organization_memberships')
      .select('id, status')
      .eq('organization_id', orgId)
      .eq('user_id', existing.id)
      .single();

    if (existingMembership) {
      if (existingMembership.status === 'removed') {
        await supabase.from('organization_memberships')
          .update({ status: 'active', role })
          .eq('id', existingMembership.id);
        reactivated = true;
      } else {
        return { error: 'This user is already a member of this organization.' };
      }
    }
  }

  const user = await requireFounder();

  const { data: org } = await supabase
    .from('organizations')
    .select('name, slug')
    .eq('id', orgId)
    .single();

  if (!org) {
    return { error: 'Organization not found.' };
  }

  const password = generatePassword();

  let userId: string;
  if (existing) {
    userId = existing.id;
    await supabase.auth.admin.updateUserById(userId, { password });
  } else {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError || !newUser?.user) {
      return { error: createError?.message || 'Failed to create user account.' };
    }
    userId = newUser.user.id;
  }

  if (!reactivated) {
    const { error: memberError } = await supabase
      .from('organization_memberships')
      .insert({
        organization_id: orgId,
        user_id: userId,
        role,
        status: 'active',
      });

    if (memberError) {
      return { error: `Failed to add member: ${memberError.message}` };
    }
  }

  // Audit trail
  await supabase.from('invitations').insert({
    organization_id: orgId,
    email,
    role,
    invited_by: user.id,
    status: 'accepted',
  });

  try {
    await sendInvitationEmail({
      to: email,
      orgName: org.name,
      orgSlug: org.slug,
      role,
      password,
      invitedByEmail: user.email,
    });
  } catch (emailError) {
    console.error('Failed to send invitation email:', emailError);
    return { success: true, warning: 'Member added but email delivery failed.' };
  }

  return { success: true };
}
