import { connection } from 'next/server';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

type Discussion = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  project_id: string;
  organization_id: string;
  created_by: string;
  projects: { name: string } | null;
  organizations: { name: string } | null;
  messages: { id: string; content: string; created_at: string; author_id: string }[];
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function MessagesPage() {
  await connection();
  const user = await requireAuth('/login');
  const supabase = createAdminClient();

  const { data: memberships } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active');

  const orgIds = (memberships ?? []).map((m) => m.organization_id);

  let discussions: Discussion[] = [];

  if (orgIds.length > 0) {
    const { data } = await supabase
      .from('discussions')
      .select('id, title, created_at, updated_at, project_id, organization_id, created_by')
      .in('organization_id', orgIds)
      .eq('is_internal', false)
      .order('updated_at', { ascending: false })
      .limit(50);

    discussions = (data ?? []) as Discussion[];
  }

  const totalMessages = discussions.reduce((sum, d) => sum + d.messages.length, 0);

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="display-sm" style={{ color: 'var(--text-muted)' }}>
            <Link href="/dashboard" className="onlee-link-accent">Dashboard</Link>
            <span className="mx-1.5">/</span>
            Messages
          </p>
          <h1 className="text-[1.5rem] font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            Messages
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(126,159,245,0.1)', color: '#7E9FF5' }}>
            {discussions.length} discussions
          </span>
          <span className="text-[12px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
            {totalMessages} messages
          </span>
        </div>
      </div>

      {discussions.length === 0 ? (
        <div
          className="rounded-xl py-20 text-center"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No messages yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Discussions from your projects will appear here.</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden divide-y"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderColor: 'var(--border-default)' }}
        >
          {discussions.map((disc) => {
            const lastMessage = disc.messages.length > 0
              ? disc.messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
              : null;
            const lastActivity = lastMessage?.created_at ?? disc.updated_at;

            return (
              <div
                key={disc.id}
                className="flex items-start gap-4 px-5 py-4 onlee-row transition-colors"
                style={{ borderColor: 'var(--border-default)' }}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(126, 159, 245, 0.1)' }}
                >
                  <svg className="w-4 h-4" style={{ color: '#7E9FF5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {disc.title}
                    </p>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0" style={{ background: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
                      {disc.messages.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {disc.projects?.name && (
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{disc.projects.name}</span>
                    )}
                    {disc.projects?.name && disc.organizations?.name && (
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>&middot;</span>
                    )}
                    {disc.organizations?.name && (
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{disc.organizations.name}</span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="text-[12px] mt-1.5 truncate" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                      {lastMessage.content.length > 120 ? lastMessage.content.slice(0, 120) + '…' : lastMessage.content}
                    </p>
                  )}
                </div>

                {/* Time */}
                <span className="text-[11px] shrink-0 mt-1" style={{ color: 'var(--text-muted)' }}>
                  {timeAgo(lastActivity)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
