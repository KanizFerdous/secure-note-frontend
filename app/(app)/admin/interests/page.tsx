'use client';
import { useCallback, useEffect, useState } from 'react';
import Pager from '@/components/Pager';
import { api, Meta } from '@/lib/api';

type G = { interest: string; count: number; users: { _id: string; name: string; email: string }[] };

export default function Interests() {
  const [items, setItems] = useState<G[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const r = await api<{ data: G[]; meta: Meta }>(`admin/users/grouped-by-interests?page=${page}&limit=${limit}`);
      setItems(r.data); setMeta(r.meta);
    } catch (e: any) { setError(e.message); }
  }, [page, limit]);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <h2>Users grouped by interest</h2>
      {error && <p className="error">{error}</p>}
      {items.map((g) => (
        <div className="card" key={g.interest}>
          <b>{g.interest}</b>
          <span className="meta">{g.count} users</span>
          <ul>{g.users.map((u) => <li key={u._id}>{u.name} — {u.email}</li>)}</ul>
        </div>
      ))}
      <Pager meta={meta} limit={limit} onPage={setPage} onLimit={setLimit} />
    </>
  );
}
