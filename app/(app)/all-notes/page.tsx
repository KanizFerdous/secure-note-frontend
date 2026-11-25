'use client';
import { useCallback, useEffect, useState } from 'react';
import ActionMenu from '@/components/ActionMenu';
import Pager from '@/components/Pager';
import { api, json, Meta } from '@/lib/api';

type Note = {
  _id: string;
  title: string;
  content: string;
  owner?: string | { _id?: string; name: string; email: string } | null;
};

type U = { _id: string; name: string; email: string };

function ownerId(n: Note) {
  if (!n.owner) return '';
  if (typeof n.owner === 'string') return n.owner;
  return String((n.owner as { _id?: string })._id ?? '');
}

export default function AllNotesPage() {
  const [role, setRole] = useState('');
  const [meId, setMeId] = useState('');
  const [items, setItems] = useState<Note[]>([]);
  const [users, setUsers] = useState<U[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '' });

  const admin = role === 'admin';

  useEffect(() => {
    api('auth/me')
      .then((m) => {
        setRole(m.role);
        setMeId(m.id);
        if (m.role === 'admin') {
          api<{ data: U[] }>('admin/users?page=1&limit=50')
            .then((r) => setUsers(r.data))
            .catch(() => undefined);
        }
      })
      .catch((e: any) => setError(e.message));
  }, []);

  const load = useCallback(async () => {
    if (!role) return;
    try {
      setError('');
      if (admin) {
        const r = await api<{ data: Note[]; meta: Meta }>(
          `admin/notes?page=${page}&limit=${limit}${userId ? `&userId=${userId}` : ''}`,
        );
        setItems(r.data);
        setMeta(r.meta);
      } else {
        const r = await api<{ data: Note[]; meta: Meta }>(`notes?page=${page}&limit=${limit}`);
        setItems(r.data);
        setMeta(r.meta);
      }
    } catch (e: any) {
      setError(e.message);
      setItems([]);
      setMeta(null);
    }
  }, [role, admin, page, limit, userId]);

  useEffect(() => { load(); }, [load]);

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await api(`notes/${editing}`, json('PATCH', form));
      setEditing(null);
      setForm({ title: '', content: '' });
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function remove(id: string) {
    try {
      await api(`notes/${id}`, { method: 'DELETE' });
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <h2>All notes</h2>
        {admin && (
          <select
            className="filter-select"
            value={userId}
            onChange={(e) => { setPage(1); setUserId(e.target.value); }}
          >
            <option value="">All</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
        )}
      </div>

      {editing && (
        <form className="panel stack" onSubmit={saveEdit}>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <div className="row">
            <button type="submit">Update note</button>
            <button type="button" className="ghost" onClick={() => { setEditing(null); setForm({ title: '', content: '' }); }}>Cancel</button>
          </div>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      {items.map((n) => {
        const mine = !admin || ownerId(n) === meId || (!n.owner && !admin);
        const ownerLabel =
          n.owner && typeof n.owner === 'object'
            ? `${n.owner.name} · ${n.owner.email}`
            : n.owner
              ? null
              : 'deleted user';
        return (
          <div className="card" key={n._id}>
            {admin && ownerLabel && <span className="meta">{ownerLabel}</span>}
            <div className="page-head" style={{ marginBottom: 0 }}>
              <b>{n.title}</b>
              {mine && (
                <ActionMenu
                  items={[
                    {
                      label: 'Edit',
                      onClick: () => { setEditing(n._id); setForm({ title: n.title, content: n.content }); },
                    },
                    { label: 'Delete', danger: true, onClick: () => remove(n._id) },
                  ]}
                />
              )}
            </div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{n.content}</p>
          </div>
        );
      })}

      {!items.length && !error && role && <p className="empty-state">No notes available</p>}
      <Pager meta={meta} limit={limit} onPage={setPage} onLimit={setLimit} />
    </>
  );
}
