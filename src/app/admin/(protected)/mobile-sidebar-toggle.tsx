'use client';

import { useState, useEffect, useCallback } from 'react';

export default function MobileSidebarToggle() {
  const [open, setOpen] = useState(false);

  const closeSidebar = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const sidebar = document.getElementById('admin-sidebar');
    if (!sidebar) return;

    if (open) {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
      document.body.style.overflow = 'hidden';
    } else {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('translate-x-0');
      document.body.style.overflow = '';
    }

    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {!open && <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-0 left-0 z-50 flex items-center justify-center transition-colors duration-150"
        style={{ height: '56px', width: '48px', color: 'var(--text-muted)' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>}

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30"
          style={{ background: 'var(--surface-scrim)' }}
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
