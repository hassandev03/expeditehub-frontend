import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that require no authentication
const publicRoutePatterns: string[] = ['/', '/login', '/register'];

// Role-to-portal mapping for redirect on wrong-role access
const employeeRoleToPortalPathMap: Record<string, string> = {
  admin:   '/dashboard',
  cashier: '/pos',
  chef:    '/kds',
};

// Routes each role is allowed to access (prefix match)
const allowedRoutePathPrefixByRole: Record<string, string[]> = {
  admin:   ['/dashboard', '/staff', '/menu', '/orders'],
  cashier: ['/pos'],
  chef:    ['/kds'],
};

export async function proxy(incomingNextRequest: NextRequest): Promise<NextResponse> {
  const requestPathname = incomingNextRequest.nextUrl.pathname;

  // Allow public routes through unconditionally
  const isPublicRoute = publicRoutePatterns.some(
    (publicPattern) => requestPathname === publicPattern
  );
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Read access token from cookie
  const storedAccessToken = incomingNextRequest.cookies.get('accessToken')?.value;

  if (!storedAccessToken) {
    const loginRedirectUrl = incomingNextRequest.nextUrl.clone();
    loginRedirectUrl.pathname = '/login';
    return NextResponse.redirect(loginRedirectUrl);
  }

  // Decode JWT payload (no signature verification — backend enforces security)
  let decodedEmployeeRole: string;
  try {
    // Use jwtVerify with a dummy secret just to decode; we rely on backend for real auth.
    // Since we can't verify without the secret here, we decode manually via atob.
    const [, jwtPayloadBase64] = storedAccessToken.split('.');
    const decodedPayloadString = atob(jwtPayloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const jwtPayload = JSON.parse(decodedPayloadString) as { role?: string; exp?: number };

    // Check token expiry (UX guard only — backend will reject expired tokens)
    if (jwtPayload.exp && jwtPayload.exp < Math.floor(Date.now() / 1000)) {
      const loginRedirectUrl = incomingNextRequest.nextUrl.clone();
      loginRedirectUrl.pathname = '/login';
      return NextResponse.redirect(loginRedirectUrl);
    }

    decodedEmployeeRole = jwtPayload.role ?? '';
  } catch {
    const loginRedirectUrl = incomingNextRequest.nextUrl.clone();
    loginRedirectUrl.pathname = '/login';
    return NextResponse.redirect(loginRedirectUrl);
  }

  // Check if the current path is allowed for this role
  const allowedPathPrefixes = allowedRoutePathPrefixByRole[decodedEmployeeRole] ?? [];
  const isRouteAllowedForRole = allowedPathPrefixes.some(
    (allowedPrefix) => requestPathname.startsWith(allowedPrefix)
  );

  if (!isRouteAllowedForRole) {
    // Redirect to the correct portal for this role
    const correctPortalPath = employeeRoleToPortalPathMap[decodedEmployeeRole] ?? '/login';
    const portalRedirectUrl = incomingNextRequest.nextUrl.clone();
    portalRedirectUrl.pathname = correctPortalPath;
    return NextResponse.redirect(portalRedirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files and Next.js internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|eot)).*)']
};
