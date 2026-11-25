'use client';
import { useState } from 'react';
import { api, json } from '@/lib/api';

export default function NotesPage() {
  const [form, setForm] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setOk('');
    try {
      await api('notes', json('POST', form));
      setForm({ title: '', content: '' });
      setOk('Note created');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <>
      <h2>New note</h2>
      <form className="panel stack" onSubmit={save}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
        <div className="row">
          <button type="submit">Add note</button>
        </div>
      </form>
      {error && <p className="error">{error}</p>}
      {ok && <p className="meta">{ok}</p>}
    </>
  );
}
