import { type NextRequest, NextResponse } from 'next/server';
import { resolveHostname, type ResolvedHost } from '@/lib/hostname-resolver';

/**
 * Next.js Middleware — Host-based routing
 *
 * Resolves the hostname, sets context headers, and rewrites to the correct
 * application surface. Authorization is NOT performed here — it happens
 * server-side in layouts and server actions.
 */

// Headers set by middleware for downstream consumption (server-side only)
const HEADER_HOST_CATEGORY = 'x-pentarch-host-category';
const HEADER_ORG_ID = 'x-pentarch-org-id';
const HEADER_ORG_SLUG = 'x-pentarch-org-slug';
const HEADER_PRODUCT_ID = 'x-pentarch-product-id';
const HEADER_PRODUCT_SLUG = 'x-pentarch-product-slug';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || request.nextUrl.hostname;

  // Resolve hostname without DB lookup in middleware (kept lightweight).
  // Full slug resolution happens in the layout/page server components.
  const resolved = await resolveHostname(hostname);

  // Unknown host — reject early
  if (resolved.category === 'invalid') {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Reserved subdomains — not implemented yet
  if (resolved.category === 'reserved') {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Clone request headers and inject tenant context
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(HEADER_HOST_CATEGORY, resolved.category);

  if (resolved.organizationSlug) {
    requestHeaders.set(HEADER_ORG_SLUG, resolved.organizationSlug);
  }
  if (resolved.organizationId) {
    requestHeaders.set(HEADER_ORG_ID, resolved.organizationId);
  }
  if (resolved.productSlug) {
    requestHeaders.set(HEADER_PRODUCT_SLUG, resolved.productSlug);
  }
  if (resolved.productId) {
    requestHeaders.set(HEADER_PRODUCT_ID, resolved.productId);
  }

  // Rewrite to the correct route group based on host category
  const url = request.nextUrl.clone();

  switch (resolved.category) {
    case 'admin':
      url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
      break;
    case 'client':
    case 'unknown':
      // Unknown subdomains route to dashboard — the layout will handle 404
      url.pathname = `/dashboard${url.pathname === '/' ? '' : url.pathname}`;
      break;
    case 'product':
      url.pathname = `/product${url.pathname === '/' ? '' : url.pathname}`;
      break;
    case 'public':
    default:
      // Public site — no rewrite needed
      break;
  }

  return NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
