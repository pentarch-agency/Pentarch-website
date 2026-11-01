import type { Metadata } from 'next';
import { connection } from 'next/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { requireStaff, getUserProfile } from '@/lib/auth';
import MobileSidebarToggle from './mobile-sidebar-toggle';
import SidebarCollapseToggle, { SidebarWrapper, NavLabel, CollapsedOnly, NavTooltip, UserPopover } from './sidebar-collapse-toggle';

export const metadata: Metadata = {
  title: 'Admin — Pentarch',
  description: 'Pentarch founder administration dashboard',
};

const navItems = [
  { href: '/', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/organizations', label: 'Organizations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { href: '/projects', label: 'Projects', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/tasks', label: 'Tasks', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { href: '/inquiries', label: 'Inquiries', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { href: '/finance', label: 'Finance', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { href: '/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { href: '/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { href: '/audit-log', label: 'Audit Log', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { href: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

/* A-mark only (collapsed state) */
function LogoMark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 136 100" className="h-7 w-auto">
      <defs>
        <linearGradient id="faceL-sm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9FBBFF"/><stop offset="1" stopColor="#6F93F0"/></linearGradient>
        <linearGradient id="faceR-sm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7E9FF5"/><stop offset="1" stopColor="#5478D9"/></linearGradient>
        <radialGradient id="star-sm" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFFFFF"/><stop offset="0.45" stopColor="#F2F5FB"/><stop offset="1" stopColor="#B9C8E6"/></radialGradient>
      </defs>
      <polygon points="68,0 136,100 101.5,100 68,42 34.5,100 0,100" fill="url(#faceR-sm)" stroke="#0F1322" strokeWidth="1.2" strokeLinejoin="round"/>
      <polygon points="68,0 68,42 34.5,100 0,100" fill="url(#faceL-sm)"/>
      <path d="M 68,53 Q 71.08,73.92 90,77 Q 71.08,80.08 68,101 Q 64.92,80.08 46,77 Q 64.92,73.92 68,53 Z" fill="url(#star-sm)"/>
    </svg>
  );
}

/* Full wordmark (expanded state) */
function LogoFull() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1058.60 249.60" className="w-full">
      <defs>
        <linearGradient id="faceL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9FBBFF"/><stop offset="1" stopColor="#6F93F0"/></linearGradient>
        <linearGradient id="faceR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7E9FF5"/><stop offset="1" stopColor="#5478D9"/></linearGradient>
        <radialGradient id="star" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFFFFF"/><stop offset="0.45" stopColor="#F2F5FB"/><stop offset="1" stopColor="#B9C8E6"/></radialGradient>
      </defs>
      <g transform="translate(39.00,210.60)">
        <path d="M34.06 -45.24V-77.48H48.62Q57.98 -77.48 62.14 -85.02Q66.3 -92.56 66.3 -109.98Q66.3 -124.8 62.14 -132.21Q57.98 -139.62 49.4 -139.62H34.06V-171.6H54.34Q62.92 -171.6 72.28 -167.96Q81.64 -164.32 89.96 -156.78Q98.28 -149.24 103.35 -137.15Q108.42 -125.06 108.42 -108.16Q108.42 -87.62 100.49 -73.58Q92.56 -59.54 78.52 -52.39Q64.48 -45.24 46.02 -45.24ZM5.2 0V-171.6H45.24V0Z" fill="#DCE3EF"/>
        <path d="M116.48 0V-171.6H156.78V0ZM145.08 0V-32.76H192.4V0ZM145.08 -72.28V-102.18H185.64V-72.28ZM145.08 -138.84V-171.6H192.4V-138.84Z" fill="#DCE3EF"/>
        <path d="M201.24 0V-171.6H244.92L277.16 -68.9H277.94V-171.6H315.64V0H271.7L239.98 -102.7H239.2V0Z" fill="#DCE3EF"/>
        <path d="M350.74 0V-171.6H390.78V0ZM323.18 -139.1V-171.6H418.08V-139.1Z" fill="#DCE3EF"/>
        <path d="M650.4 0V-171.6H697.72Q706.56 -171.6 714.62 -169.65Q722.68 -167.7 729.31 -163.54Q735.94 -159.38 740.88 -153.4Q745.82 -147.42 748.55 -139.23Q751.28 -131.04 751.28 -120.64Q751.28 -112.06 749.2 -104.52Q747.12 -96.98 742.57 -91.13Q738.02 -85.28 731.26 -81.25Q724.5 -77.22 715.14 -75.66V-73.32Q728.92 -72.8 735.94 -67.6Q742.96 -62.4 745.82 -53.69Q748.68 -44.98 749.98 -33.54L754.4 0H712.8L710.46 -27.56Q709.68 -36.4 708.38 -43.55Q707.08 -50.7 703.57 -54.86Q700.06 -59.02 692.26 -59.28H690.44V0ZM690.44 -85.8H693.56Q702.4 -85.8 706.69 -92.56Q710.98 -99.32 710.98 -114.4Q710.98 -128.18 707.34 -133.9Q703.7 -139.62 695.64 -139.62H690.44Z" fill="#DCE3EF"/>
        <path d="M816.28 3.12Q800.17 3.12 789.5 -2.86Q778.84 -8.84 772.86 -20.15Q766.88 -31.46 764.41 -47.84Q761.94 -64.22 761.94 -85.28Q761.94 -104.52 764.15 -120.9Q766.36 -137.28 772.08 -149.24Q777.8 -161.2 788.46 -167.83Q799.12 -174.46 815.76 -174.46Q831.62 -174.46 841.63 -168.74Q851.64 -163.02 856.58 -153.4Q861.52 -143.78 862.3 -131.56Q863.08 -119.34 860.74 -106.34L823.3 -102.18Q824.86 -115.18 824.34 -124.54Q823.82 -133.9 821.22 -138.84Q818.62 -143.78 813.94 -143.78Q810.56 -143.78 808.35 -140.79Q806.14 -137.8 804.84 -131.43Q803.54 -125.06 802.89 -114.79Q802.24 -104.52 802.24 -89.96Q802.24 -66.56 803.54 -52.78Q804.84 -39 807.7 -33.15Q810.56 -27.3 814.98 -27.3Q820.96 -27.3 823.43 -34.97Q825.9 -42.64 826.03 -54.73Q826.16 -66.82 824.6 -79.82L863.08 -74.88Q866.2 -55.12 864.64 -40.43Q863.08 -25.74 856.97 -16.12Q850.86 -6.5 840.59 -1.69Q830.32 3.12 816.28 3.12Z" fill="#DCE3EF"/>
        <path d="M934.32 0V-171.6H974.36V0ZM874.26 0V-171.6H914.3V0ZM899.22 -71.5V-104.26H952V-71.5Z" fill="#DCE3EF"/>
        <g>
          <polygon points="530.34,-175.03 649.36,0.00 588.98,0.00 530.34,-101.52 471.71,0.00 411.32,0.00" fill="url(#faceR)" stroke="#0F1322" strokeWidth="2.10" strokeLinejoin="round"/>
          <polygon points="530.34,-175.03 530.34,-101.52 471.71,0.00 411.32,0.00" fill="url(#faceL)"/>
          <path d="M 530.34,-85.77 Q 536.71,-46.63 575.85,-40.26 Q 536.71,-33.89 530.34,5.25 Q 523.97,-33.89 484.83,-40.26 Q 523.97,-46.63 530.34,-85.77 Z" fill="url(#star)"/>
        </g>
      </g>
    </svg>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const { user, role: userRole } = await requireStaff();
  const profile = await getUserProfile(user.id);

  const fullName = profile?.full_name || null;
  const avatarUrl = profile?.avatar_url || null;
  const initial = (fullName?.[0] ?? user.email?.[0] ?? 'A').toUpperCase();

  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get('sidebar-collapsed')?.value;
  const sidebarCollapsed = sidebarCookie === undefined ? true : sidebarCookie === 'true';

  return (
    <SidebarCollapseToggle initialCollapsed={sidebarCollapsed}>
      <MobileSidebarToggle />

      {/* Sidebar */}
      <SidebarWrapper>
        {/* Logo */}
        <div className="py-5 shrink-0 flex justify-center overflow-hidden">
          <NavLabel>
            <div className="px-4 w-[240px]">
              <LogoFull />
            </div>
          </NavLabel>
          <CollapsedOnly>
            <LogoMark />
          </CollapsedOnly>
        </div>

        {/* Divider */}
        <div className="mx-4 shrink-0" style={{ height: '1px', background: '#303D59' }} />

        {/* Nav */}
        <nav className="flex-1 min-h-0 overflow-y-auto sidebar-scroll px-2 py-3 space-y-0.5">
          <NavLabel>
            <p className="px-3 mb-1.5" style={{ fontFamily: 'var(--font-family-display)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#98A9C4' }}>Navigation</p>
          </NavLabel>
          {navItems.slice(0, 5).map((item) => (
            <NavTooltip key={item.href} label={item.label}>
              <Link
                href={item.href}
                className="flex items-center gap-2.5 py-1.5 rounded-md transition-colors duration-150 hover:bg-[#111522]"
                style={{ color: '#DCE3EF', height: 'var(--nav-height, 36px)', justifyContent: 'var(--nav-justify, flex-start)', paddingLeft: 'var(--nav-px, 12px)', paddingRight: 'var(--nav-px, 12px)' }}
              >
                <svg className="shrink-0" style={{ width: 'var(--nav-icon, 16px)', height: 'var(--nav-icon, 16px)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <NavLabel><span className="text-[13px] font-medium">{item.label}</span></NavLabel>
              </Link>
            </NavTooltip>
          ))}

          <NavLabel>
            <div className="mx-3 my-2" style={{ height: '1px', background: '#303D59' }} />
            <p className="px-3 mb-1.5" style={{ fontFamily: 'var(--font-family-display)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#98A9C4' }}>Manage</p>
          </NavLabel>

          {navItems.slice(5).map((item) => (
            <NavTooltip key={item.href} label={item.label}>
              <Link
                href={item.href}
                className="flex items-center gap-2.5 py-1.5 rounded-md transition-colors duration-150 hover:bg-[#111522]"
                style={{ color: '#DCE3EF', height: 'var(--nav-height, 36px)', justifyContent: 'var(--nav-justify, flex-start)', paddingLeft: 'var(--nav-px, 12px)', paddingRight: 'var(--nav-px, 12px)' }}
              >
                <svg className="shrink-0" style={{ width: 'var(--nav-icon, 16px)', height: 'var(--nav-icon, 16px)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <NavLabel><span className="text-[13px] font-medium">{item.label}</span></NavLabel>
              </Link>
            </NavTooltip>
          ))}
        </nav>

        {/* User section */}
        <div className="p-2 shrink-0">
          <NavLabel>
            <div
              className="rounded-lg p-3"
              style={{ background: '#111522', border: '1px solid #303D59' }}
            >
              <div className="flex items-center gap-2.5">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-md object-cover" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-[12px] font-semibold"
                    style={{ background: '#98A9C4', color: '#111522' }}
                  >
                    {initial}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate" style={{ color: '#DCE3EF' }}>
                    {fullName ?? user.email}
                  </p>
                  <p className="text-[10px]" style={{ color: '#536684' }}>{userRole === 'founder' ? 'Founder' : 'Staff'}</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid #303D59' }}>
                <form action="/api/auth/signout" method="POST">
                  <button
                    className="flex items-center gap-1.5 text-[11px] font-medium cursor-pointer transition-colors duration-150 hover:text-[#C96C6C]"
                    style={{ color: '#536684' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </NavLabel>
          {/* Collapsed: just the avatar */}
          <CollapsedOnly>
            <UserPopover name={fullName ?? user.email ?? ''} role={userRole === 'founder' ? 'Founder' : 'Staff'} avatarUrl={avatarUrl} initial={initial} />
          </CollapsedOnly>
        </div>
      </SidebarWrapper>

      {/* Main content */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden admin-scroll lg:h-screen px-4" style={{ background: 'var(--surface-canvas)' }}>
        <div style={{ maxWidth: '1600px', padding: 'var(--shell-page-pad-y) var(--shell-page-pad-x)' }}>
          {children}
        </div>
      </main>
    </SidebarCollapseToggle>
  );
}
