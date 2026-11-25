import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (!req.cookies.get('token')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (req.nextUrl.pathname.startsWith('/admin') && req.cookies.get('role')?.value !== 'admin') {
    return NextResponse.redirect(new URL('/notes', req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/notes/:path*', '/all-notes/:path*', '/posts/:path*', '/admin/:path*'] };
