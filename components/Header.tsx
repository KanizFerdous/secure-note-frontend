'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const labels: Record<string, string> = {
  '/notes': 'New note',
  '/all-notes': 'All notes',
  '/posts': 'Posts',
  '/admin/users': 'Users',
  '/admin/interests': 'Interests',
};

export default function Header() {
  const path = usePathname();
  const [me, setMe] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    api('auth/me')
      .then(setMe)
      .catch(() => undefined);
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  const role = me?.role === 'admin' ? 'Admin' : 'User';
  const page = labels[path] ?? 'Notes';
  const initial = (me?.name?.trim()?.[0] ?? '?').toUpperCase();

  return (
    <header className="top-bar">
      <p className="crumb">{role} / {page}</p>
      <div className="top-actions">
        <button type="button" className="ghost logout-btn" onClick={logout}>Logout</button>
        <span className="avatar" title={me?.name ?? ''}>{initial}</span>
      </div>
    </header>
  );
}
