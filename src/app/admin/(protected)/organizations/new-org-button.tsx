'use client';

import { useState } from 'react';
import { NewOrgModal } from './new-org-modal';

export function NewOrgButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors duration-150"
        style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">New Organization</span>
        <span className="sm:hidden">New</span>
      </button>
      <NewOrgModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
