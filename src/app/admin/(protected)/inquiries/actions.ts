'use server';

import { requireFounder } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function updateInquiryStatus(inquiryId: string, status: string) {
  await requireFounder();
  if (!['new', 'in_progress', 'responded', 'closed', 'spam'].includes(status)) return { error: 'Invalid status.' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('contact_inquiries').update({ status }).eq('id', inquiryId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateInquiryNotes(inquiryId: string, notes: string) {
  await requireFounder();
  const supabase = createAdminClient();
  const { error } = await supabase.from('contact_inquiries').update({ notes }).eq('id', inquiryId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function assignInquiry(inquiryId: string, userId: string | null) {
  await requireFounder();
  const supabase = createAdminClient();
  const { error } = await supabase.from('contact_inquiries').update({ assigned_to: userId }).eq('id', inquiryId);
  if (error) return { error: error.message };
  return { success: true };
}
