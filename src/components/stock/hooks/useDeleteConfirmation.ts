import { useState, useCallback } from 'react';

export interface DeleteDialogState {
  isOpen: boolean;
  itemId: string | null;
}

export interface UseDeleteConfirmationReturn extends DeleteDialogState {
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

  return {
    isOpen,
    itemId,
    open,
    close,
  };
}
