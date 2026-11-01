import { connection } from 'next/server';
import { requireFounder } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import NameForm from './name-form';
import EmailForm from './email-form';
import PasswordForm from './password-form';
import PlatformForm from './platform-form';
import AvatarUpload from './avatar-upload';

export default async function SettingsPage() {
  await connection();
  const user = await requireFounder();
  const supabase = createAdminClient();

  const { count: orgCount } = await supabase.from('organizations').select('id', { count: 'exact', head: true });
  const { count: userCount } = await supabase.from('user_profiles').select('id', { count: 'exact', head: true });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  const { data: platformSettings } = await supabase
    .from('platform_settings')
    .select('*')
    .limit(1)
    .single();

  const firstName = profile?.first_name ?? null;
  const lastName = profile?.last_name ?? null;
  const avatarUrl = profile?.avatar_url ?? null;
  const displayName = [firstName, lastName].filter(Boolean).join(' ');
  const initial = (displayName || user.email || 'A')[0].toUpperCase();
  const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

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
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</span>
          </div>
        </div>
      </div>

      {/* Profile + Account side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 mb-6">
        {/* Profile Card */}
        <div
          className="rounded-lg p-6 flex flex-col items-center text-center"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <AvatarUpload avatarUrl={avatarUrl} initial={initial} />
          <div className="mt-4">
            {displayName && <h1 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{displayName}</h1>}
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded data-sm mt-3"
            style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
          >
            Founder
          </span>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-subtle)' }}>Since {createdDate}</p>
          <div className="flex items-center gap-4 mt-3">
            <Link href="/organizations" className="text-[11px] onlee-link-accent" style={{ color: 'var(--text-subtle)' }}>{orgCount ?? 0} orgs</Link>
            <Link href="/users" className="text-[11px] onlee-link-accent" style={{ color: 'var(--text-subtle)' }}>{userCount ?? 0} users</Link>
          </div>
        </div>

        {/* Account Card */}
        <div
          className="rounded-lg p-6"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <h2 className="display-sm">Account</h2>
          </div>
          <div className="space-y-1">
            <NameForm firstName={firstName} lastName={lastName} />
            <EmailForm email={user.email ?? ''} />
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-md">
              <div className="min-w-0">
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Role</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Access level</p>
              </div>
              <span
                className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold"
                style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
              >
                Founder
              </span>
            </div>
            <PasswordForm />
          </div>
        </div>
      </div>

      {/* Platform + Notifications side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Platform Card */}
        <div
          className="rounded-lg p-6"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="display-sm">Platform</h2>
          </div>
          <PlatformForm settings={platformSettings} />
        </div>

        {/* Notifications Card */}
        <div
          className="rounded-lg p-6"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <h2 className="display-sm">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>New inquiries</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Contact form submissions</p>
              </div>
              <div className="w-9 h-5 rounded-full relative cursor-pointer shrink-0" style={{ background: 'var(--accent-solid)' }}>
                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full" style={{ background: 'var(--text-on-accent)', boxShadow: 'var(--shadow-switch-knob)' }} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Task updates</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Status changes &amp; assignments</p>
              </div>
              <div className="w-9 h-5 rounded-full relative cursor-pointer shrink-0" style={{ background: 'var(--accent-solid)' }}>
                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full" style={{ background: 'var(--text-on-accent)', boxShadow: 'var(--shadow-switch-knob)' }} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Weekly digest</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Platform activity summary</p>
              </div>
              <div className="w-9 h-5 rounded-full relative cursor-pointer shrink-0 transition-colors duration-150" style={{ background: 'var(--surface-muted)' }}>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full" style={{ background: 'var(--text-subtle)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="rounded-lg p-6"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--danger-border)' }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <svg className="w-4 h-4" style={{ color: 'var(--danger-text)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 className="display-sm" style={{ color: 'var(--danger-text)' }}>Danger Zone</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Reset Platform Data</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Permanently delete all organizations, projects, and user data</p>
          </div>
          <button
            className="text-[13px] font-semibold rounded-md px-6 py-2.5 self-start sm:self-auto shrink-0 transition-colors duration-150"
            style={{ background: 'var(--danger-tint)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)' }}
          >
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
}
