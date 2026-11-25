import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000/api';

export async function POST(req: Request, { params }: { params: { action: string } }) {
  const { action } = params;
  if (!['login', 'register', 'logout'].includes(action)) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  if (action === 'logout') {
    const token = cookies().get('token')?.value;
    if (token) {
      await fetch(`${BACKEND}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined);
    }
    cookies().delete('token');
    cookies().delete('role');
    return NextResponse.json({ ok: true });
  }

  const res = await fetch(`${BACKEND}/auth/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await req.text(),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const cookieBase = {
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60,
  };
  cookies().set('token', data.accessToken, { ...cookieBase, httpOnly: true });
  if (data.user?.role) cookies().set('role', data.user.role, { ...cookieBase, httpOnly: false });
  return NextResponse.json({ user: data.user });
}
