import { NextRequest, NextResponse } from 'next/server';

const REALM = 'Kultivaprix Admin';

/**
 * Basic Auth pour /admin/*.
 *
 * Active uniquement si ADMIN_PASSWORD est défini en environnement (sinon
 * /admin reste public — et donc à éviter de déployer sans la var).
 */
export function middleware(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return new NextResponse(
      "Admin désactivée (ADMIN_PASSWORD non configurée).",
      { status: 503 },
    );
  }

  const auth = req.headers.get('authorization');
  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic' && encoded) {
      try {
        const decoded = atob(encoded);
        const sep = decoded.indexOf(':');
        if (sep > -1) {
          const user = decoded.slice(0, sep);
          const pass = decoded.slice(sep + 1);
          const expectedUser = process.env.ADMIN_USER ?? 'kultiva';
          if (user === expectedUser && pass === expected) {
            return NextResponse.next();
          }
        }
      } catch {
        // décodage cassé → 401
      }
    }
  }

  return new NextResponse('Authentification requise', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
