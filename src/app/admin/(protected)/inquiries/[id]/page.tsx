import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { InquiryActions } from './inquiry-actions';

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  await requireFounder();
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: inquiry, error } = await supabase.from('contact_inquiries').select('*').eq('id', id).single();
  if (error || !inquiry) notFound();

  const { data: founders } = await supabase.from('user_profiles').select('id, email').eq('role', 'founder');

  const cardStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' };

  return (
    <div>
      {/* Top Bar */}
      <div
        className="sticky top-0 z-20 -mx-6 -mt-6 px-6 mb-6"
        style={{ background: 'var(--surface-canvas)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5 text-[13px] pl-10 lg:pl-0">
            <Link href="/" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Pentarch</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <Link href="/inquiries" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Inquiries</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <span className="font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{inquiry.name}</span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-lg p-6" style={cardStyle}>
          <h1 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{inquiry.name}</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>{inquiry.email}{inquiry.company ? ` — ${inquiry.company}` : ''}</p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-subtle)' }}>Submitted {new Date(inquiry.created_at).toLocaleString()}</p>

          <div className="mt-5 rounded-md p-4" style={{ background: 'var(--surface-muted)' }}>
            <p className="text-[13px] whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{inquiry.message}</p>
          </div>
        </div>

        <InquiryActions
          inquiryId={inquiry.id}
          currentStatus={inquiry.status}
          currentNotes={inquiry.notes}
          assignedTo={inquiry.assigned_to}
          founders={founders || []}
        />
      </div>
    </div>
  );
}
