'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createFinanceRecord(formData: FormData) {
  const user = await requireFounder();
  const supabase = createAdminClient();

  const type = formData.get('type') as string;
  const category = formData.get('category') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const reference = formData.get('reference') as string || null;
  const organization_id = formData.get('organization_id') as string || null;
  const project_id = formData.get('project_id') as string || null;
  const recorded_at = formData.get('recorded_at') as string || new Date().toISOString().split('T')[0];
  const notes = formData.get('notes') as string || null;
  const status = formData.get('status') as string || 'completed';

  if (!type || !category || !amount || !description) {
    redirect('/finance?error=missing_fields');
  }

  const { error } = await supabase.from('finance_records').insert({
    type,
    category,
    status,
    amount,
    description,
    reference,
    organization_id: organization_id || null,
    project_id: project_id || null,
    recorded_at,
    notes,
    created_by: user.id,
  });

  if (error) {
    redirect('/finance?error=create_failed');
  }

  revalidatePath('/admin/finance');
  revalidatePath('/admin');
  redirect('/finance');
}

export async function deleteFinanceRecord(formData: FormData) {
  await requireFounder();
  const supabase = createAdminClient();
  const id = formData.get('id') as string;

  await supabase.from('finance_records').delete().eq('id', id);

  revalidatePath('/admin/finance');
  revalidatePath('/admin');
  redirect('/finance');
}
