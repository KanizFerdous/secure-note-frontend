'use client';
import { useCallback, useEffect, useState } from 'react';
import Pager from '@/components/Pager';
import { api, json, Meta } from '@/lib/api';

type Post = { _id: string; title: string; content: string };
type U = { _id: string; name: string };

export default function PostsPage() {
  const [meId, setMeId] = useState('');
  const [role, setRole] = useState('');
  const [filter, setFilter] = useState('all');
  const [users, setUsers] = useState<U[]>([]);
  const [items, setItems] = useState<Post[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form, setForm] = useState({ title: '', content: '' });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api('auth/me')
      .then((m) => {
        setMeId(m.id);
        setRole(m.role);
        setReady(true);
        if (m.role === 'admin') {
          api<{ data: U[] }>('admin/users?page=1&limit=50')
            .then((r) => setUsers(r.data))
            .catch(() => undefined);
        }
      })
      .catch((e: any) => setError(e.message));
  }, []);

  const load = useCallback(async () => {
    if (!ready) return;
    try {
      setError('');
      if (role !== 'admin' || filter === 'all') {
        const r = await api<{ data: Post[]; meta: Meta }>(`posts?page=${page}&limit=${limit}`);
        setItems(r.data);
        setMeta(r.meta);
      } else {
        const r = await api(`users/${filter}/posts?page=${page}&limit=${limit}`);
        setItems(r.data);
        setMeta(r.meta);
      }
    } catch (e: any) {
      setError(e.message);
      setItems([]);
      setMeta(null);
    }
  }, [ready, meId, role, filter, page, limit]);
  useEffect(() => { load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('posts', json('POST', form));
      setForm({ title: '', content: '' });
      setOpen(false);
      setPage(1);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <h2>Posts</h2>
        {!open && (
          <button type="button" className="primary" onClick={() => { setForm({ title: '', content: '' }); setOpen(true); }}>
            Add post
          </button>
        )}
      </div>

      {open && (
        <form className="panel stack" onSubmit={create}>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <div className="row">
            <button type="submit">Create post</button>
            <button type="button" className="ghost" onClick={() => { setOpen(false); setForm({ title: '', content: '' }); }}>Cancel</button>
          </div>
        </form>
      )}

      {role === 'admin' && (
        <select
          className="filter-select"
          value={filter}
          onChange={(e) => { setPage(1); setFilter(e.target.value); }}
        >
          <option value="all">All</option>
          {meId && <option value={meId}>My posts</option>}
          {users.filter((u) => u._id !== meId).map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
      )}

      {error && <p className="error">{error}</p>}

      {items.map((p) => (
        <div className="card" key={p._id}>
          <b>{p.title}</b>
          <p style={{ whiteSpace: 'pre-wrap' }}>{p.content}</p>
        </div>
      ))}
      {ready && !items.length && !error && <p className="empty-state">No post available</p>}
      <Pager meta={meta} limit={limit} onPage={setPage} onLimit={setLimit} />
    </>
  );
}
