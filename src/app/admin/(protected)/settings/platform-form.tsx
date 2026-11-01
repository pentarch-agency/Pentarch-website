'use client';

import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updatePlatformSettings, toggleMaintenance } from './actions';

const TIMEZONE_GROUPS = [
  { label: 'Universal', items: [
    { value: 'UTC', label: 'UTC', offset: '+00:00' },
  ]},
  { label: 'Americas', items: [
    { value: 'America/New_York', label: 'Eastern Time (US)', offset: '-05:00' },
    { value: 'America/Chicago', label: 'Central Time (US)', offset: '-06:00' },
    { value: 'America/Denver', label: 'Mountain Time (US)', offset: '-07:00' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US)', offset: '-08:00' },
    { value: 'America/Anchorage', label: 'Alaska', offset: '-09:00' },
    { value: 'Pacific/Honolulu', label: 'Hawaii', offset: '-10:00' },
    { value: 'America/Toronto', label: 'Eastern (Canada)', offset: '-05:00' },
    { value: 'America/Vancouver', label: 'Pacific (Canada)', offset: '-08:00' },
    { value: 'America/Sao_Paulo', label: 'São Paulo', offset: '-03:00' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires', offset: '-03:00' },
  ]},
  { label: 'Europe', items: [
    { value: 'Europe/London', label: 'London', offset: '+00:00' },
    { value: 'Europe/Paris', label: 'Central European', offset: '+01:00' },
    { value: 'Europe/Berlin', label: 'Berlin', offset: '+01:00' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam', offset: '+01:00' },
    { value: 'Europe/Moscow', label: 'Moscow', offset: '+03:00' },
    { value: 'Europe/Istanbul', label: 'Istanbul', offset: '+03:00' },
  ]},
  { label: 'Asia & Middle East', items: [
    { value: 'Asia/Dubai', label: 'Dubai', offset: '+04:00' },
    { value: 'Asia/Kolkata', label: 'India', offset: '+05:30' },
    { value: 'Asia/Singapore', label: 'Singapore', offset: '+08:00' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong', offset: '+08:00' },
    { value: 'Asia/Shanghai', label: 'China', offset: '+08:00' },
    { value: 'Asia/Tokyo', label: 'Japan', offset: '+09:00' },
    { value: 'Asia/Seoul', label: 'Korea', offset: '+09:00' },
  ]},
  { label: 'Oceania', items: [
    { value: 'Australia/Sydney', label: 'Sydney', offset: '+11:00' },
    { value: 'Australia/Melbourne', label: 'Melbourne', offset: '+11:00' },
    { value: 'Australia/Perth', label: 'Perth', offset: '+08:00' },
    { value: 'Pacific/Auckland', label: 'New Zealand', offset: '+13:00' },
  ]},
  { label: 'Africa', items: [
    { value: 'Africa/Johannesburg', label: 'South Africa', offset: '+02:00' },
    { value: 'Africa/Lagos', label: 'West Africa', offset: '+01:00' },
    { value: 'Africa/Cairo', label: 'Cairo', offset: '+02:00' },
  ]},
];

const ALL_TIMEZONES = TIMEZONE_GROUPS.flatMap(g => g.items);

interface PlatformSettings {
  id: string;
  platform_name: string;
  domain: string;
  timezone: string;
  maintenance_mode: boolean;
}

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'var(--text-primary)',
  height: '40px',
};

const modalOverlay = { background: 'rgba(0,0,0,0.85)' };
const modalCard = { background: '#1e1e21', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' };

function EditableField({ label, description, name, value, type = 'text' }: {
  label: string; description: string; name: string; value: string; type?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-md cursor-pointer transition-colors duration-150"
        onClick={() => { setOpen(true); setError(null); }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; }}
      >
        <div className="min-w-0">
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[13px] ${type === 'mono' ? 'font-mono' : ''} px-2.5 py-1 rounded-md`} style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>{value}</span>
          <span className="text-[12px] font-medium" style={{ color: 'var(--accent-text)' }}>Edit</span>
        </div>
      </div>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalOverlay} onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-xl p-6" style={modalCard} onClick={e => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Edit {label}</h3>
            <form
              className="space-y-3"
              action={(formData) => {
                setError(null);
                startTransition(async () => {
                  const result = await updatePlatformSettings(formData);
                  if (result.error) setError(result.error);
                  else setOpen(false);
                });
              }}
            >
              <input type="hidden" name="field" value={name} />
              <div>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--text-subtle)' }}>{label}</label>
                <input name="value" defaultValue={value} required className="w-full text-[13px] rounded-md px-3 outline-none" style={inputStyle} />
              </div>
              {error && <p className="text-[11px]" style={{ color: 'var(--danger-text)' }}>{error}</p>}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="text-[13px] rounded-md px-6 py-2.5" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>Cancel</button>
                <button type="submit" disabled={pending} className="text-[13px] font-semibold rounded-md px-6 py-2.5 disabled:opacity-50" style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}>
                  {pending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function TimezoneField({ value }: { value: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [search, setSearch] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const displayLabel = ALL_TIMEZONES.find(t => t.value === selected)?.label ?? selected;

  const filtered = search.trim()
    ? TIMEZONE_GROUPS.map(g => ({
        ...g,
        items: g.items.filter(t =>
          t.label.toLowerCase().includes(search.toLowerCase()) ||
          t.value.toLowerCase().includes(search.toLowerCase()) ||
          t.offset.includes(search)
        ),
      })).filter(g => g.items.length > 0)
    : TIMEZONE_GROUPS;

  function handleSave() {
    setError(null);
    const formData = new FormData();
    formData.set('field', 'timezone');
    formData.set('value', selected);
    startTransition(async () => {
      const result = await updatePlatformSettings(formData);
      if (result.error) setError(result.error);
      else setOpen(false);
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-md cursor-pointer transition-colors duration-150"
        onClick={() => { setOpen(true); setError(null); setSearch(''); setSelected(value); }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; }}
      >
        <div className="min-w-0">
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Timezone</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Default for reporting</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[13px] px-2.5 py-1 rounded-md" style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>{displayLabel}</span>
          <span className="text-[12px] font-medium" style={{ color: 'var(--accent-text)' }}>Edit</span>
        </div>
      </div>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalOverlay} onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-xl p-6" style={modalCard} onClick={e => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Edit Timezone</h3>

            <div className="mb-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search timezones..."
                  className="w-full text-[13px] rounded-md pl-9 pr-3 outline-none"
                  style={inputStyle}
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-[280px] overflow-y-auto overscroll-contain rounded-md mb-3" style={{ border: '1px solid rgba(255,255,255,0.1)', scrollbarWidth: 'thin' }}>
              {filtered.length === 0 && (
                <p className="text-[12px] text-center py-6" style={{ color: 'var(--text-subtle)' }}>No timezones found</p>
              )}
              {filtered.map(group => (
                <div key={group.label}>
                  <div className="px-3 py-1.5 data-sm sticky top-0" style={{ color: 'var(--text-subtle)', background: 'var(--navy)' }}>{group.label}</div>
                  {group.items.map(tz => (
                    <button
                      key={tz.value}
                      type="button"
                      onClick={() => setSelected(tz.value)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors duration-150"
                      style={{
                        background: selected === tz.value ? 'var(--accent-tint)' : undefined,
                        color: selected === tz.value ? 'var(--accent-text)' : 'var(--text-primary)',
                      }}
                      onMouseEnter={e => { if (selected !== tz.value) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                      onMouseLeave={e => { if (selected !== tz.value) e.currentTarget.style.background = ''; }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {selected === tz.value ? (
                          <svg className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-text)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        ) : (
                          <div className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="text-[13px] truncate">{tz.label}</span>
                      </div>
                      <span className="text-[11px] font-mono shrink-0 ml-3" style={{ color: 'var(--text-subtle)' }}>UTC{tz.offset}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {error && <p className="text-[11px] mb-2" style={{ color: 'var(--danger-text)' }}>{error}</p>}
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="text-[13px] rounded-md px-6 py-2.5" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>Cancel</button>
              <button type="button" onClick={handleSave} disabled={pending} className="text-[13px] font-semibold rounded-md px-6 py-2.5 disabled:opacity-50" style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}>
                {pending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function MaintenanceToggle({ enabled, settingsId }: { enabled: boolean; settingsId: string }) {
  const [on, setOn] = useState(enabled);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Maintenance</p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Client dashboards</p>
      </div>
      <div className="shrink-0 flex items-center gap-2.5">
        <span className="text-[11px] font-medium" style={{ color: on ? 'var(--danger-text)' : 'var(--success-text)' }}>
          {on ? 'Maintenance' : 'Live'}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            const next = !on;
            setOn(next);
            startTransition(async () => {
              const result = await toggleMaintenance(settingsId, next);
              if (result.error) setOn(!next);
            });
          }}
          className="w-9 h-5 rounded-full relative transition-colors duration-300"
          style={{ background: on ? 'var(--danger-solid)' : 'var(--surface-muted)' }}
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300"
            style={{
              ...(on
                ? { right: '2px', background: 'var(--text-on-accent)', boxShadow: 'var(--shadow-switch-knob)' }
                : { left: '2px', background: 'var(--text-subtle)' }
              ),
            }}
          />
        </button>
      </div>
    </div>
  );
}

export default function PlatformForm({ settings }: { settings: PlatformSettings | null }) {
  const s = settings ?? { id: '', platform_name: 'Pentarch Agency', domain: 'pentarch.agency', timezone: 'UTC', maintenance_mode: false };

  return (
    <div className="space-y-1">
      <EditableField label="Platform Name" description="Across all surfaces" name="platform_name" value={s.platform_name} />
      <EditableField label="Domain" description="Primary tenant domain" name="domain" value={s.domain} type="mono" />
      <TimezoneField value={s.timezone} />
      <MaintenanceToggle enabled={s.maintenance_mode} settingsId={s.id} />
    </div>
  );
}
