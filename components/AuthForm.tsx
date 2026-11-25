'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body: Record<string, unknown> = { email: f.get('email'), password: f.get('password') };
    if (mode === 'register') {
      body.name = f.get('name');
      body.interests = String(f.get('interests') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    }
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Failed');
    window.location.href = '/notes';
  }

  return (
    <div className="auth-shell">
      <main>
        <p className="brand">Secure Notes</p>
        <p className="lede">{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</p>
        <form onSubmit={submit}>
          {mode === 'register' && <input name="name" placeholder="Name" required />}
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password (min 8)" required minLength={8} />
          {mode === 'register' && <input name="interests" placeholder="Interests, comma separated" />}
          {error && <p className="error">{error}</p>}
          <button type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
        <p className="swap">
          {mode === 'login' ? <Link href="/register">Create an account</Link> : <Link href="/login">Back to login</Link>}
        </p>
      </main>
    </div>
  );
}
