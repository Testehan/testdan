import { useState, useCallback } from 'react';
import { HistoryEntry } from '../shared/types/valuation';

interface UseDeleteConfirmationReturn {
  isOpen: boolean;
  itemId: string | null;
  open: (id: string) => void;
  close: () => void;
}

export function useDeleteConfirmation(): UseDeleteConfirmationReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);

  const open = useCallback((id: string) => {
    setItemId(id);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setItemId(null);
    setIsOpen(false);
  }, []);

  return { isOpen, itemId, open, close };
}

export function useValuationHistory<T extends HistoryEntry>(
  endpoint: string,
  sortByDate: boolean = true
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8080${endpoint}/${symbol}`);
      
      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result: T[] = response.status === 404 ? [] : await response.json();
      
      if (sortByDate) {
        result.sort((a, b) => new Date(b.valuationDate).getTime() - new Date(a.valuationDate).getTime());
      }
      
      setData(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, sortByDate]);

  return { data, loading, error, fetch: fetchHistory };
}
