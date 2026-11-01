'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createOrganization } from './actions';

export function NewOrgModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setSlug('');
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open && !loading) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, loading, onClose]);

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 63);
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await createOrganization(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  if (!open) return null;

  const inputStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => { if (e.target === overlayRef.current && !loading) onClose(); }}
    >
      <div className="absolute inset-0" style={{ background: 'var(--surface-scrim)' }} />

      <div
        className="relative w-full max-w-lg rounded-lg overflow-hidden"
        style={{ background: 'var(--surface-popover)', border: '1px solid var(--border-popover)', boxShadow: 'var(--shadow-popover)' }}
      >
        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                style={{ background: 'var(--surface-muted)' }}
              >
                <svg className="w-5 h-5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>New Organization</h2>
                <p className="text-[12px]" style={{ color: 'var(--text-subtle)' }}>Set up a new client tenant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-md p-2 transition-colors duration-150"
              style={{ color: 'var(--text-subtle)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-subtle)'; }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="modal-name" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Organization name <span style={{ color: 'var(--danger-text)' }}>*</span>
              </label>
              <input
                ref={nameRef}
                id="modal-name"
                name="name"
                required
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
                style={inputStyle}
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label htmlFor="modal-slug" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Subdomain slug <span style={{ color: 'var(--danger-text)' }}>*</span>
              </label>
              <div className="flex items-center">
                <input
                  id="modal-slug"
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 rounded-l-md px-3 py-2 font-mono text-[14px] outline-none transition-colors duration-150"
                  style={inputStyle}
                  placeholder="acme"
                />
                <span
                  className="px-3 py-2 font-mono text-[13px] rounded-r-md flex items-center"
                  style={{
                    background: 'var(--surface-muted)',
                    border: '1px solid var(--border-default)',
                    borderLeft: 'none',
                    color: 'var(--text-subtle)',
                  }}
                >
                  .pentarch.agency
                </span>
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-subtle)' }}>Lowercase letters, numbers, and hyphens only.</p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '4px' }} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-email" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Contact email</label>
                <input
                  id="modal-email"
                  name="contact_email"
                  type="email"
                  className="w-full rounded-md px-3 text-[14px] outline-none transition-colors duration-150"
                  style={inputStyle}
                  placeholder="contact@acme.com"
                />
              </div>
              <div>
                <label htmlFor="modal-phone" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Contact phone</label>
                <input
                  id="modal-phone"
                  name="contact_phone"
                  type="tel"
                  className="w-full rounded-md px-3 text-[14px] outline-none transition-colors duration-150"
                  style={inputStyle}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-website" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Website</label>
                <input
                  id="modal-website"
                  name="website"
                  type="url"
                  className="w-full rounded-md px-3 text-[14px] outline-none transition-colors duration-150"
                  style={inputStyle}
                  placeholder="https://acme.com"
                />
              </div>
              <div>
                <label htmlFor="modal-industry" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Industry</label>
                <select
                  id="modal-industry"
                  name="industry"
                  className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150 appearance-none"
                  style={inputStyle}
                  defaultValue=""
                >
                  <option value="" style={{ background: 'var(--surface-popover)', color: 'var(--text-subtle)' }}>Select industry...</option>
                  {['Technology','Finance','Healthcare','Education','Retail & E-commerce','Real Estate','Hospitality','Media & Entertainment','Manufacturing','Consulting','Non-profit','Other'].map(ind => (
                    <option key={ind} value={ind.toLowerCase().replace(/[^a-z]+/g, '_')} style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-2.5 p-3 rounded-md text-[13px]"
                style={{ background: 'var(--danger-tint)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-md px-5 py-2.5 text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50 flex items-center gap-2"
                style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                )}
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-md px-5 py-2.5 text-[13px] transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
