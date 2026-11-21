import { useCallback, useEffect, useState } from 'react';
import { rest } from './neon';

type Row = { id: string };

/** Minimal CRUD hook over one table of the Neon Data API. */
export function useTable<T extends Row>(table: string, query = 'select=*&order=created_at.desc') {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      setRows(await rest<T[]>(`/${table}?${query}`));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load data');
    } finally {
      setLoading(false);
    }
  }, [table, query]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const add = async (values: Partial<T>) => {
    await rest(`/${table}`, { method: 'POST', body: JSON.stringify(values) });
    await reload();
  };
  const update = async (id: string, values: Partial<T>) => {
    await rest(`/${table}?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(values) });
    await reload();
  };
  const remove = async (id: string) => {
    await rest(`/${table}?id=eq.${id}`, { method: 'DELETE' });
    await reload();
  };

  return { rows, loading, error, add, update, remove, reload };
}
