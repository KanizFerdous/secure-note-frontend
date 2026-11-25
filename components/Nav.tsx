'use client';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { api } from '@/lib/api';

function cookieRole() {
  const m = document.cookie.match(/(?:^|; )role=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : '';
}

function Ico({ children }: { children: ReactNode }) {
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

const s = { stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export default function Nav() {
  const [role, setRole] = useState('');

  useEffect(() => {
    setRole(cookieRole());
    api('auth/me')
      .then((u) => {
        setRole(u.role);
        document.cookie = `role=${encodeURIComponent(u.role)}; path=/; max-age=3600; samesite=strict`;
      })
      .catch(() => undefined);
  }, []);

  const admin = role === 'admin';

  return (
    <nav className="side-nav">
      <Link href="/notes" className="brand">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M7 3.5h7.2L19 8.3V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7.5 3.5H7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M14 3.5V8h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M9 12h6M9 15.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </span>
        <span className="brand-name">Notes</span>
      </Link>
      <div className="side-links">
        <Link href="/notes">
          <Ico>
            <path d="M8 3.5h6.5L19 8v10.5A1.5 1.5 0 0 1 17.5 20h-9A1.5 1.5 0 0 1 7 18.5v-13A1.5 1.5 0 0 1 8.5 4H8z" {...s} />
            <path d="M14.5 3.5V8H19" {...s} />
            <path d="M10 12h5M10 15h3.5" {...s} />
          </Ico>
          New note
        </Link>
        <Link href="/all-notes">
          <Ico>
            <path d="M8 6h12M8 12h12M8 18h12" {...s} />
            <path d="M4 6h.01M4 12h.01M4 18h.01" {...s} />
          </Ico>
          All notes
        </Link>
        <Link href="/posts">
          <Ico>
            <path d="M4 5h16v14H4z" {...s} />
            <path d="M8 9h8M8 13h8M8 17h5" {...s} />
          </Ico>
          Posts
        </Link>
        {admin && (
          <Link href="/admin/users">
            <Ico>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...s} />
              <circle cx="9" cy="7" r="4" {...s} />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...s} />
            </Ico>
            Users
          </Link>
        )}
        {admin && (
          <Link href="/admin/interests">
            <Ico>
              <path d="M12 3l2.2 6.5H21l-5.3 3.9 2 6.3L12 16.2 6.3 19.7l2-6.3L3 9.5h6.8z" {...s} />
            </Ico>
            Interests
          </Link>
        )}
      </div>
    </nav>
  );
}
