import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000/api';

async function handler(req: Request, { params }: { params: { path: string[] } }) {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (params.path.some((s) => s === '.' || s === '..')) {
    return NextResponse.json({ message: 'Bad request' }, { status: 400 });
  }

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const target = `${BACKEND}/${params.path.map(encodeURIComponent).join('/')}${new URL(req.url).search}`;
  const res = await fetch(target, {
    method: req.method,
    headers: { Authorization: `Bearer ${token}`, ...(hasBody ? { 'Content-Type': 'application/json' } : {}) },
    body: hasBody ? await req.text() : undefined,
    cache: 'no-store',
  });
  if (res.status === 401) cookies().delete('token');
  return new NextResponse(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
