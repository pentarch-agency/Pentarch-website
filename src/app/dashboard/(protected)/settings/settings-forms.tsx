'use client';

import { useRef, useState, useTransition } from 'react';
import { updateProfile, updateEmail, updatePassword } from './actions';

type Props = {
  fullName: string;
  avatarUrl: string;
  email: string;
  role: string;
  lastSignIn: string | null;
  orgs: Array<{
    role: string;
    organization_id: string;
    organizations: { name: string; slug: string } | null;
  }>;
};

const tabs = [
  { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'orgs', label: 'Organizations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
] as const;

export function SettingsForms({ fullName, avatarUrl, email, role, lastSignIn, orgs }: Props) {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [saved, setSaved] = useState<string | null>(null);

  function showSaved(section: string) {
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  }

  const initials = fullName
    ? fullName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : email[0]?.toUpperCase() ?? '?';

  return (
    <>
      {/* Profile hero card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
      >
        {/* Gradient banner */}
        <div className="h-28 relative" style={{ background: 'linear-gradient(135deg, #0B0F1A 0%, #1a2440 40%, #5478D9 100%)' }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(126,159,245,0.3), transparent 60%)' }} />
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-5 -mt-10 relative">
          <div className="flex items-end gap-4 mb-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-20 h-20 rounded-2xl object-cover ring-4"
                style={{ ringColor: 'var(--surface-card)' }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-[24px] font-bold ring-4"
                style={{ background: 'linear-gradient(135deg, #5478D9, #7E9FF5)', color: '#fff', ringColor: 'var(--surface-card)' }}
              >
                {initials}
              </div>
            )}
            <div className="pb-1">
              <h2 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {fullName || 'Unnamed User'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{email}</span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(126,159,245,0.12)', color: '#7E9FF5' }}>
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 flex-1 justify-center py-2 px-3 rounded-lg text-[12px] font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? 'var(--surface-card)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-5">
        {activeTab === 'profile' && (
          <ProfileTab fullName={fullName} avatarUrl={avatarUrl} email={email} onSaved={showSaved} saved={saved} />
        )}
        {activeTab === 'security' && (
          <SecurityTab email={email} lastSignIn={lastSignIn} onSaved={showSaved} saved={saved} />
        )}
        {activeTab === 'orgs' && (
          <OrgsTab orgs={orgs} />
        )}
      </div>
    </>
  );
}

function ProfileTab({ fullName, avatarUrl, email, onSaved, saved }: { fullName: string; avatarUrl: string; email: string; onSaved: (s: string) => void; saved: string | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <Card
        title="Personal Information"
        description="Update your name and profile picture."
        action={<SaveBtn pending={pending} saved={saved === 'profile'} form="profile-form" />}
      >
        <form
          id="profile-form"
          action={(fd) => startTransition(async () => { await updateProfile(fd); onSaved('profile'); })}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <FormInput label="Full Name" name="full_name" defaultValue={fullName} placeholder="John Doe" />
          <FormInput label="Avatar URL" name="avatar_url" defaultValue={avatarUrl} placeholder="https://..." />
        </form>
      </Card>

      <Card
        title="Email Address"
        description="Used for sign-in and notifications."
        action={<SaveBtn pending={false} saved={saved === 'email'} form="email-form" />}
      >
        <EmailForm email={email} onSaved={() => onSaved('email')} />
      </Card>
    </div>
  );
}

function EmailForm({ email, onSaved }: { email: string; onSaved: () => void }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      id="email-form"
      action={(fd) => startTransition(async () => { await updateEmail(fd); onSaved(); })}
    >
      <FormInput label="Email" name="email" type="email" defaultValue={email} placeholder="you@example.com" />
    </form>
  );
}

function SecurityTab({ email, lastSignIn, onSaved, saved }: { email: string; lastSignIn: string | null; onSaved: (s: string) => void; saved: string | null }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-5">
      <Card
        title="Change Password"
        description="Choose a strong password with at least 6 characters."
        action={<SaveBtn pending={pending} saved={saved === 'password'} form="password-form" label="Update Password" />}
      >
        <form
          id="password-form"
          ref={formRef}
          action={(fd) => startTransition(async () => { await updatePassword(fd); formRef.current?.reset(); onSaved('password'); })}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <FormInput label="New Password" name="password" type="password" placeholder="Enter new password" />
          <FormInput label="Confirm Password" name="password_confirm" type="password" placeholder="Repeat password" />
        </form>
      </Card>

      {/* Session info */}
      <Card title="Session" description="Current sign-in details.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoBlock label="Authentication" value="Email & Password" icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          <InfoBlock
            label="Last Sign-in"
            value={lastSignIn ? new Date(lastSignIn).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </div>
      </Card>
    </div>
  );
}

function OrgsTab({ orgs }: { orgs: Props['orgs'] }) {
  if (orgs.length === 0) {
    return (
      <Card title="Organizations" description="Teams and companies you belong to.">
        <div className="py-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-raised)' }}>
            <svg className="w-5 h-5" style={{ color: 'var(--text-muted)', opacity: 0.4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>No organizations yet</p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>You&apos;ll see your teams here once you&apos;re added.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Organizations" description="Teams and companies you belong to.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {orgs.map((m) => (
          <div
            key={m.organization_id}
            className="flex items-center gap-3 p-3.5 rounded-xl transition-colors"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-default)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #5478D9, #7E9FF5)', color: '#fff' }}
            >
              {m.organizations?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{m.organizations?.name}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{m.organizations?.slug}</p>
            </div>
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full capitalize shrink-0" style={{ background: 'rgba(126,159,245,0.1)', color: '#7E9FF5' }}>
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Shared components ────────────────────────────────────────── */

function Card({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 sm:p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          {description && <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function FormInput({ label, name, type = 'text', defaultValue, placeholder }: {
  label: string; name: string; type?: string; defaultValue?: string; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full text-[13px] font-medium rounded-lg px-3.5 py-2.5 outline-none transition-all focus:ring-2 focus:ring-[#7E9FF5]/40"
        style={{ color: 'var(--text-primary)', background: 'var(--surface-raised)', border: '1px solid var(--border-default)' }}
        autoComplete={type === 'password' ? 'new-password' : undefined}
      />
    </div>
  );
}

function InfoBlock({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'var(--surface-raised)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(126,159,245,0.1)' }}>
        <svg className="w-4 h-4" style={{ color: '#7E9FF5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-[13px] font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

function SaveBtn({ pending, saved, form, label = 'Save Changes' }: { pending: boolean; saved: boolean; form: string; label?: string }) {
  return (
    <button
      type="submit"
      form={form}
      disabled={pending}
      className="text-[12px] font-medium px-4 py-2 rounded-lg transition-all shrink-0"
      style={{
        background: saved ? 'rgba(34,197,94,0.12)' : 'linear-gradient(135deg, #5478D9, #7E9FF5)',
        color: saved ? '#22C55E' : '#fff',
        opacity: pending ? 0.6 : 1,
        boxShadow: saved ? 'none' : '0 2px 8px rgba(84,120,217,0.25)',
      }}
    >
      {pending ? 'Saving...' : saved ? 'Saved!' : label}
    </button>
  );
}
