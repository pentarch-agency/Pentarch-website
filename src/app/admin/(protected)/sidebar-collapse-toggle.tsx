'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';

const CollapsedContext = createContext(false);
export const useCollapsed = () => useContext(CollapsedContext);

export default function SidebarCollapseToggle({ children, initialCollapsed = false }: { children: React.ReactNode; initialCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  useEffect(() => {
    document.cookie = `sidebar-collapsed=${collapsed};path=/;max-age=31536000;SameSite=Lax`;
  }, [collapsed]);

  return (
    <CollapsedContext.Provider value={collapsed}>
      <div
        className="min-h-screen flex transition-all duration-200"
        style={{ background: 'var(--surface-canvas)' }}
      >
        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden lg:flex fixed z-50 items-center justify-center rounded-full transition-all duration-200 hover:bg-[rgba(152,169,196,0.12)]"
          style={{
            top: '18px',
            left: collapsed ? '52px' : '224px',
            width: '28px',
            height: '28px',
            background: '#1E263B',
            border: '1px solid #303D59',
            color: '#98A9C4',
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
        {children}
      </div>
    </CollapsedContext.Provider>
  );
}

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const collapsed = useCollapsed();
  return (
    <aside
      id="admin-sidebar"
      className="fixed inset-y-0 left-0 z-40 flex flex-col shrink-0 h-screen transform -translate-x-full lg:translate-x-0 lg:sticky lg:top-0 transition-all duration-200"
      style={{
        width: collapsed ? '68px' : 'var(--shell-sidebar)',
        background: '#1E263B',
        borderRight: '1px solid #303D59',
        ['--nav-justify' as string]: collapsed ? 'center' : 'flex-start',
        ['--nav-icon' as string]: collapsed ? '22px' : '16px',
        ['--nav-px' as string]: collapsed ? '0px' : '12px',
        ['--nav-height' as string]: collapsed ? '44px' : '36px',
      }}
    >
      {children}
    </aside>
  );
}

export function NavLabel({ children }: { children: React.ReactNode }) {
  const collapsed = useCollapsed();
  if (collapsed) return null;
  return <>{children}</>;
}

export function CollapsedOnly({ children }: { children: React.ReactNode }) {
  const collapsed = useCollapsed();
  if (!collapsed) return null;
  return <>{children}</>;
}

export function UserPopover({ name, role, avatarUrl, initial }: { name: string; role: string; avatarUrl: string | null; initial: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ bottom: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node) && btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const toggle = useCallback(() => {
    setOpen(o => {
      if (!o && btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        setPos({ bottom: window.innerHeight - r.top + 8, left: r.left });
      }
      return !o;
    });
  }, []);

  return (
    <div className="flex justify-center">
      <button ref={btnRef} onClick={toggle} className="rounded-md transition-all duration-150 hover:ring-2 hover:ring-[#536684]" aria-label="User menu">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-md object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-[12px] font-semibold" style={{ background: '#98A9C4', color: '#111522' }}>
            {initial}
          </div>
        )}
      </button>
      {open && pos && (
        <div
          ref={cardRef}
          className="fixed w-52 rounded-lg p-3 z-[9999]"
          style={{ bottom: pos.bottom, left: pos.left, background: '#111522', border: '1px solid #303D59', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
        >
          <div className="flex items-center gap-2.5 mb-2.5">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-md object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-md flex items-center justify-center text-[12px] font-semibold" style={{ background: '#98A9C4', color: '#111522' }}>
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: '#DCE3EF' }}>{name}</p>
              <p className="text-[11px]" style={{ color: '#536684' }}>{role}</p>
            </div>
          </div>
          <div className="pt-2.5" style={{ borderTop: '1px solid #303D59' }}>
            <form action="/api/auth/signout" method="POST">
              <button className="flex items-center gap-1.5 text-[12px] font-medium cursor-pointer transition-colors duration-150 hover:text-[#C96C6C]" style={{ color: '#536684' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const collapsed = useCollapsed();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.top + r.height / 2, left: r.right + 12 });
  }, []);
  const hide = useCallback(() => setPos(null), []);

  if (!collapsed) return <>{children}</>;
  return (
    <div ref={ref} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {pos && (
        <div
          className="pointer-events-none fixed -translate-y-1/2 px-2.5 py-1.5 rounded-md text-[12px] font-medium whitespace-nowrap z-[9999]"
          style={{ top: pos.top, left: pos.left, background: '#111522', color: '#DCE3EF', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
