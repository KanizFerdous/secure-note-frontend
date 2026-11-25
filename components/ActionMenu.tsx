'use client';
import { useEffect, useRef, useState } from 'react';

type Item = { label: string; onClick: () => void; danger?: boolean };

export default function ActionMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="action-menu" ref={ref}>
      <button type="button" className="action-trigger" aria-label="Actions" onClick={() => setOpen((v) => !v)}>
        ⋮
      </button>
      {open && (
        <div className="action-pop">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              className={it.danger ? 'danger-item' : undefined}
              onClick={() => { setOpen(false); it.onClick(); }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
