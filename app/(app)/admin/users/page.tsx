'use client';
import { useCallback, useEffect, useState } from 'react';
import ActionMenu from '@/components/ActionMenu';
import Pager from '@/components/Pager';
import { api, json, Meta } from '@/lib/api';

type U = { _id: string; name: string; email: string; role: string; interests: string[] };
const empty = { name: '', email: '', password: '', role: 'user', interests: '' };

export default function AdminUsers() {
  const [items, setItems] = useState<U[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const r = await api<{ data: U[]; meta: Meta }>(`admin/users?page=${page}&limit=${limit}`);
      setItems(r.data); setMeta(r.meta);
    } catch (e: any) { setError(e.message); }
  }, [page, limit]);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setError('');
    const body: Record<string, unknown> = {
      name: form.name, email: form.email, role: form.role,
      interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
    };
    if (form.password) body.password = form.password;
    try {
      await api(editing ? `admin/users/${editing}` : 'admin/users', json(editing ? 'PATCH' : 'POST', body));
      setForm(empty); setEditing(null); setOpen(false); load();
    } catch (e: any) { setError(e.message); }
  }
  async function remove(id: string) {
    try { await api(`admin/users/${id}`, { method: 'DELETE' }); load(); } catch (e: any) { setError(e.message); }
  }
  function closeForm() { setOpen(false); setEditing(null); setForm(empty); setError(''); }

  return (
    <>
      <div className="page-head">
        <h2>Users</h2>
        {!open && (
          <button type="button" className="primary" onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}>
            Add user
          </button>
        )}
      </div>
      {open && (
        <form className="panel stack" onSubmit={save}>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder={editing ? 'New password (optional)' : 'Password (min 8)'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
          <input placeholder="Interests, comma separated" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
          <div className="row">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">user</option><option value="admin">admin</option>
            </select>
            <button type="submit">{editing ? 'Update user' : 'Create user'}</button>
            <button type="button" className="ghost" onClick={closeForm}>Cancel</button>
          </div>
        </form>
      )}
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Interests</th><th>Id</th><th>Action</th></tr></thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td className="nowrap">{u.email}</td>
                <td className="nowrap">{u.role}</td>
                <td>{u.interests.join(', ')}</td>
                <td className="mono">{u._id}</td>
                <td>
                  <ActionMenu
                    items={[
                      {
                        label: 'Edit',
                        onClick: () => {
                          setEditing(u._id);
                          setForm({ name: u.name, email: u.email, password: '', role: u.role, interests: u.interests.join(', ') });
                          setOpen(true);
                        },
                      },
                      { label: 'Delete', danger: true, onClick: () => remove(u._id) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager meta={meta} limit={limit} onPage={setPage} onLimit={setLimit} />
    </>
  );
}
