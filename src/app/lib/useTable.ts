import { useCallback, useEffect, useState } from 'react';

type Row = { id: string };

const key = (table: string) => `lifeos.${table}`;
const read = (table: string): any[] => {
  try {
    return JSON.parse(localStorage.getItem(key(table)) || '[]');
  } catch {
    return [];
  }
};
const write = (table: string, rows: any[]) => {
  try {
    localStorage.setItem(key(table), JSON.stringify(rows));
  } catch {
    /* storage full or blocked */
  }
};

/** Applies the small subset of query options the pages use: order, gte filter, limit. */
function apply(rows: any[], query: string) {
  const q = new URLSearchParams(query);
  let out = [...rows];
  for (const [k, v] of q.entries()) {
    if (v.startsWith('gte.')) out = out.filter((r) => String(r[k] ?? '') >= v.slice(4));
  }
  const order = q.get('order');
  if (order) {
    const [field, dir] = order.split('.');
    out.sort((a, b) => (String(a[field] ?? '') < String(b[field] ?? '') ? -1 : 1) * (dir === 'desc' ? -1 : 1));
  }
  const limit = Number(q.get('limit'));
  return limit ? out.slice(0, limit) : out;
}

/** Minimal CRUD hook. Rows live in this browser's storage until the cloud sign-in is back. */
export function useTable<T extends Row>(table: string, query = 'select=*&order=created_at.desc') {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');

  const reload = useCallback(async () => {
    setRows(apply(read(table), query) as T[]);
    setLoading(false);
  }, [table, query]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const add = async (values: Partial<T>) => {
    const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), done: false, ...values };
    write(table, [...read(table), row]);
    await reload();
  };
  const update = async (id: string, values: Partial<T>) => {
    write(table, read(table).map((r) => (r.id === id ? { ...r, ...values } : r)));
    await reload();
  };
  const remove = async (id: string) => {
    write(table, read(table).filter((r) => r.id !== id));
    await reload();
  };

  return { rows, loading, error, add, update, remove, reload };
}
