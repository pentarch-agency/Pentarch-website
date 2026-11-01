import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder, getUserProfile } from '@/lib/auth';
import Link from 'next/link';
import SearchCommand from './search-command';

const getOverviewData = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const [orgsResult, projectsResult, activeTasksResult, allTasksResult, doneTasksResult, inquiriesResult, usersResult, financeResult, todoResult, eventsResult] = await Promise.all([
      supabase.from('organizations').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id, name, status', { count: 'exact' }),
      supabase.from('tasks').select('id, title, status, priority, project_id', { count: 'exact' }).eq('status', 'in_progress'),
      supabase.from('tasks').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'done'),
      supabase.from('contact_inquiries').select('id, name, email, status, created_at', { count: 'exact' }).eq('status', 'new').order('created_at', { ascending: false }).limit(5),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('finance_records').select('id, type, amount, status').eq('status', 'completed'),
      supabase.from('tasks').select('id, title, status, priority').in('status', ['todo', 'in_progress']).order('created_at', { ascending: false }).limit(8),
      supabase.from('audit_events').select('id, action, target_type, created_at').order('created_at', { ascending: false }).limit(6),
    ]);
    return { orgsResult, projectsResult, activeTasksResult, allTasksResult, doneTasksResult, inquiriesResult, usersResult, financeResult, todoResult, eventsResult };
  },
  ['admin-overview'],
  { revalidate: 30 }
);

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

const actionIcons: Record<string, string> = {
  create: 'M12 4v16m8-8H4',
  update: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  delete: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  invite: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
};

export default async function AdminOverviewPage() {
  const [user, { orgsResult, projectsResult, activeTasksResult, allTasksResult, doneTasksResult, inquiriesResult, usersResult, financeResult, todoResult, eventsResult }] = await Promise.all([
    requireFounder(),
    getOverviewData(),
  ]);

  const orgCount = orgsResult.count ?? 0;
  const activeCount = activeTasksResult.count ?? 0;
  const inquiryCount = inquiriesResult.count ?? 0;
  const totalTasks = allTasksResult.count ?? 0;
  const doneTasks = doneTasksResult.count ?? 0;
  const totalProjects = projectsResult.count ?? 0;
  const projects = projectsResult.data ?? [];
  const activeTasks = activeTasksResult.data ?? [];
  const recentInquiries = inquiriesResult.data ?? [];
  const financeRecords = financeResult.data ?? [];
  const totalIncome = financeRecords.filter((r: { type: string }) => r.type === 'income').reduce((s: number, r: { amount: number }) => s + Number(r.amount), 0);
  const totalExpense = financeRecords.filter((r: { type: string }) => r.type === 'expense').reduce((s: number, r: { amount: number }) => s + Number(r.amount), 0);
  const netProfit = totalIncome - totalExpense;
  const fmtCurrency = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const todoTasks = todoResult.data;
  const recentEvents = eventsResult.data;

  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const now = new Date();
  const hrs = now.getHours();
  const greeting = hrs < 12 ? 'Good Morning' : hrs < 18 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const founderProfile = await getUserProfile(user.id);

  const firstName = founderProfile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0]?.split('.').map(s => s[0].toUpperCase() + s.slice(1)).join(' ') ?? 'Founder';

  const cardStyle = {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
  };

  const sectionIcon = {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-m)',
    background: 'var(--surface-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties;

  return (
    <div>
      {/* Top Bar */}
      <div
        className="sticky top-0 z-20 -mx-6 -mt-6 px-6 mb-6"
        style={{ background: 'var(--surface-canvas)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5 text-[13px] pl-10 lg:pl-0">
            <span style={{ color: 'var(--text-muted)' }}>Pentarch</span>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block"><SearchCommand /></div>
            <Link
              href="/inquiries"
              className="relative p-2 rounded-md transition-colors duration-150"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {inquiryCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1"
                  style={{ background: 'var(--danger-solid)', color: '#fff' }}
                >{inquiryCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pt-2">
        <div>
          <p className="text-[12px] mb-1" style={{ color: 'var(--text-subtle)' }}>{dateStr}</p>
          <h1 className="display-lg">
            {greeting}, {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/tasks"
            className="btn-slide btn-slide-ghost rounded-lg text-[13px] font-medium px-6"
            style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)', height: 40, alignItems: 'flex-start' }}
          >
            <span className="btn-slide-inner">
              <span className="btn-slide-label" style={{ height: 40 }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </span>
              <span className="btn-slide-alt" style={{ height: 40 }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create
              </span>
            </span>
          </Link>
          <Link
            href="/organizations"
            className="btn-slide btn-slide-accent rounded-lg text-[13px] font-semibold px-6"
            style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-default)', height: 40, alignItems: 'flex-start' }}
          >
            <span className="btn-slide-inner">
              <span className="btn-slide-label" style={{ height: 40 }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
                <span className="hidden sm:inline">Organizations</span>
                <span className="sm:hidden">Orgs</span>
              </span>
              <span className="btn-slide-alt" style={{ height: 40 }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18m16.5-18v18" />
                </svg>
                View All
              </span>
            </span>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {/* Revenue Card */}
        <Link href="/finance" className="rounded-lg p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div style={sectionIcon}>
              <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="data-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Net Revenue</p>
          <p className="data-xl" style={{ color: 'var(--accent-solid)' }}>{fmtCurrency(netProfit)}</p>
          <div className="flex items-center gap-5 mt-4 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
            <span className="text-[11px] font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              {fmtCurrency(totalIncome)}
            </span>
            <span className="text-[11px] font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              {fmtCurrency(totalExpense)}
            </span>
          </div>
        </Link>

        {/* Tasks Progress Card */}
        <div className="rounded-lg p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div style={sectionIcon}>
              <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-right">
              <span className="text-[22px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{completionPct}</span>
              <span className="text-[13px] font-medium ml-0.5" style={{ color: 'var(--text-subtle)' }}>%</span>
            </div>
          </div>
          <p className="data-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Task Completion</p>
          <div className="flex items-baseline gap-2">
            <p className="data-xl" style={{ color: 'var(--text-primary)' }}>{doneTasks}</p>
            <p className="data-md" style={{ color: 'var(--text-muted)' }}>/ {totalTasks}</p>
          </div>
          <div className="mt-4 w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(completionPct, 2)}%`, background: 'var(--accent-solid)' }}
            />
          </div>
        </div>

        {/* Quick Metrics Stack */}
        <div className="grid grid-rows-2 gap-4">
          <Link href="/tasks" className="rounded-lg px-5 py-4 flex items-center gap-4" style={cardStyle}>
            <div style={sectionIcon}>
              <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="data-sm" style={{ color: 'var(--text-muted)' }}>Active Tasks</p>
              <p className="data-md mt-0.5" style={{ color: 'var(--text-primary)' }}>{activeCount}</p>
            </div>
            <svg className="w-4 h-4 ml-auto shrink-0" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
          <Link href="/inquiries" className="rounded-lg px-5 py-4 flex items-center gap-4" style={cardStyle}>
            <div style={sectionIcon}>
              <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="data-sm" style={{ color: 'var(--text-muted)' }}>Inquiries</p>
              <p className="data-md mt-0.5" style={{ color: 'var(--text-primary)' }}>{inquiryCount}</p>
            </div>
            {inquiryCount > 0 && (
              <span className="ml-auto shrink-0 w-2 h-2 rounded-full" style={{ background: 'var(--danger-solid)' }} />
            )}
          </Link>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        {/* Today's Focus */}
        <div className="md:col-span-2 xl:col-span-8 rounded-lg overflow-hidden" style={cardStyle}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div className="flex items-center gap-3">
              <div style={{ ...sectionIcon, width: 28, height: 28 }}>
                <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="display-sm" style={{ color: 'var(--text-primary)' }}>Today&apos;s Focus</h2>
            </div>
            <Link href="/tasks" className="text-[11px] font-medium transition-colors duration-150 flex items-center gap-1" style={{ color: 'var(--text-subtle)' }}>
              View all
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {(!todoTasks || todoTasks.length === 0) ? (
            <div className="px-5 py-12 text-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--surface-muted)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>All clear</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-subtle)' }}>No active tasks right now</p>
            </div>
          ) : (
            <div>
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-5 onlee-row"
                  style={{ height: 42, borderBottom: '1px solid var(--border-default)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: task.priority === 'urgent' || task.priority === 'high' ? 'var(--danger-solid)' : 'var(--text-subtle)' }}
                  />
                  <span className="text-[13px] font-medium flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                    style={{
                      background: 'var(--surface-muted)',
                      color: 'var(--text-muted)',
                    }}
                  >{task.status === 'in_progress' ? 'Active' : 'To Do'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="xl:col-span-4 rounded-lg overflow-hidden" style={cardStyle}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div className="flex items-center gap-3">
              <div style={{ ...sectionIcon, width: 28, height: 28 }}>
                <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="display-sm" style={{ color: 'var(--text-primary)' }}>Projects</h3>
            </div>
            <Link href="/projects" className="text-[11px] font-medium transition-colors duration-150 flex items-center gap-1" style={{ color: 'var(--text-subtle)' }}>
              All
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>No projects</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-subtle)' }}>Create your first project</p>
            </div>
          ) : (
            <div>
              {projects.slice(0, 6).map((proj) => (
                <div
                  key={proj.id}
                  className="px-5 flex items-center justify-between onlee-row"
                  style={{ height: 42, borderBottom: '1px solid var(--border-default)' }}
                >
                  <p className="text-[13px] font-medium truncate mr-3" style={{ color: 'var(--text-primary)' }}>{proj.name}</p>
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0"
                    style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: proj.status === 'active' || proj.status === 'in_progress' ? 'var(--success-solid)' : 'var(--text-subtle)' }}
                    />
                    {proj.status === 'in_progress' ? 'Active' : proj.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inquiries */}
        <div className="xl:col-span-5 rounded-lg overflow-hidden" style={cardStyle}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div className="flex items-center gap-3">
              <div style={{ ...sectionIcon, width: 28, height: 28 }}>
                <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="display-sm" style={{ color: 'var(--text-primary)' }}>Inquiries</h3>
              {inquiryCount > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md" style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>{inquiryCount} new</span>
              )}
            </div>
            <Link href="/inquiries" className="text-[11px] font-medium transition-colors duration-150 flex items-center gap-1" style={{ color: 'var(--text-subtle)' }}>
              All
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>No new inquiries</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-subtle)' }}>Contact form submissions appear here</p>
            </div>
          ) : (
            <div>
              {recentInquiries.map((inq) => (
                <Link
                  key={inq.id}
                  href={`/inquiries/${inq.id}`}
                  className="flex items-center gap-3 px-5 onlee-row"
                  style={{ height: 48, borderBottom: '1px solid var(--border-default)' }}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
                  >
                    {inq.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{inq.name}</p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--text-subtle)' }}>{inq.email}</p>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--text-subtle)' }}>{timeAgo(inq.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="xl:col-span-4 rounded-lg overflow-hidden" style={cardStyle}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div className="flex items-center gap-3">
              <div style={{ ...sectionIcon, width: 28, height: 28 }}>
                <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="display-sm" style={{ color: 'var(--text-primary)' }}>Activity</h3>
            </div>
            <Link href="/audit-log" className="text-[11px] font-medium transition-colors duration-150 flex items-center gap-1" style={{ color: 'var(--text-subtle)' }}>
              Log
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {!recentEvents || recentEvents.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>No activity yet</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-subtle)' }}>Actions appear here</p>
            </div>
          ) : (
            <div>
              {recentEvents.map((e) => {
                const iconPath = actionIcons[e.action] ?? 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 px-5 onlee-row"
                    style={{ height: 38, borderBottom: '1px solid var(--border-default)' }}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{
                        background: e.action === 'delete' ? 'var(--danger-tint)' : 'var(--surface-muted)',
                        color: e.action === 'delete' ? 'var(--danger-text)' : 'var(--text-subtle)',
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{e.action}</span>
                      <span className="text-[12px] ml-1.5" style={{ color: 'var(--text-subtle)' }}>{e.target_type}</span>
                    </div>
                    <span className="text-[10px] shrink-0" style={{ color: 'var(--text-subtle)' }}>{timeAgo(e.created_at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overview */}
        <div className="md:col-span-2 xl:col-span-3 rounded-lg overflow-hidden" style={cardStyle}>
          <div className="px-5 py-3.5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ ...sectionIcon, width: 28, height: 28 }}>
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
              </svg>
            </div>
            <h3 className="display-sm" style={{ color: 'var(--text-primary)' }}>Overview</h3>
          </div>
          <div className="p-4 space-y-1">
            {[
              { label: 'Organizations', value: orgCount, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
              { label: 'Projects', value: totalProjects, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2' },
              { label: 'Users', value: usersResult.count ?? 0, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
              { label: 'Tasks Done', value: doneTasks, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-2 rounded-md onlee-row"
              >
                <div style={{ ...sectionIcon, width: 28, height: 28 }}>
                  <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <p className="text-[12px] flex-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                <span className="data-md" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
