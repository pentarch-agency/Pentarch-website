'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
};

type ToastContextType = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastType, JSX.Element> = {
  success: (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="var(--success-solid)" opacity="0.15" />
      <path d="M8.5 12.5l2 2 5-5" stroke="var(--success-solid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="var(--danger-solid)" opacity="0.15" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="var(--danger-solid)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="var(--accent-solid)" opacity="0.15" />
      <path d="M12 8v4m0 4h.01" stroke="var(--accent-solid)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: 'var(--success-solid)',
  error: 'var(--danger-solid)',
  info: 'var(--accent-solid)',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    const timer = setTimeout(() => dismiss(id), 4000);
    timersRef.current.set(id, timer);
  }, [dismiss]);

  useEffect(() => {
    return () => { timersRef.current.forEach(t => clearTimeout(t)); };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none"
        style={{ maxWidth: '380px' }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderLeft: `3px solid ${BORDER_COLORS[t.type]}`,
              backdropFilter: 'blur(12px)',
              animation: t.exiting ? 'toast-out 0.3s ease forwards' : 'toast-in 0.35s cubic-bezier(0.21,1.02,0.73,1) forwards',
            }}
          >
            {ICONS[t.type]}
            <span className="text-[13px] leading-snug" style={{ color: 'var(--text-primary)' }}>
              {t.message}
            </span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-auto pl-2 cursor-pointer"
              style={{ color: 'var(--text-subtle)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toast-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-8px) scale(0.96); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
