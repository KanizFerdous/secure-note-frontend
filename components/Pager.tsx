'use client';
import type { Meta } from '@/lib/api';

const SIZES = [5, 10, 25];

export default function Pager({
  meta,
  limit,
  onPage,
  onLimit,
}: {
  meta: Meta | null;
  limit: number;
  onPage: (p: number) => void;
  onLimit: (n: number) => void;
}) {
  if (!meta) return null;
  const { page, total, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const first = page <= 1;
  const last = page >= totalPages || totalPages === 0;

  return (
    <div className="pager">
      <label className="pager-rows">
        Rows per page:
        <select
          value={limit}
          onChange={(e) => { onLimit(Number(e.target.value)); onPage(1); }}
        >
          {SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <span className="pager-range">{from}-{to} of {total}</span>
      <div className="pager-btns">
        <button type="button" className="ghost" disabled={first} onClick={() => onPage(1)} aria-label="First">«</button>
        <button type="button" className="ghost" disabled={first} onClick={() => onPage(page - 1)} aria-label="Prev">‹</button>
        <button type="button" className="ghost" disabled={last} onClick={() => onPage(page + 1)} aria-label="Next">›</button>
        <button type="button" className="ghost" disabled={last} onClick={() => onPage(totalPages)} aria-label="Last">»</button>
      </div>
    </div>
  );
}
