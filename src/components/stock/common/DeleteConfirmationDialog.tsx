import React, { useState, useCallback, useRef, useEffect } from 'react';
import ConfirmDialog from './ConfirmDialog';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Delete Valuation',
  message = 'Are you sure you want to delete this valuation? This action cannot be undone.',
}) => {
  if (!isOpen) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      message={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export interface UseDeleteConfirmationReturn {
  isOpen: boolean;
  itemId: string | null;
  open: (id: string) => void;
  close: () => void;
}

export function useDeleteConfirmation(
  onDelete: (id: string) => Promise<void> | void
): UseDeleteConfirmationReturn & {
  Dialog: React.FC<{ title?: string; message?: string }>;
} {
  const [isOpen, setIsOpen] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  const onDeleteRef = useRef(onDelete);
  
  useEffect(() => {
    onDeleteRef.current = onDelete;
  }, [onDelete]);

  const open = useCallback((id: string) => {
    setItemId(id);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setItemId(null);
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (itemId) {
      await onDeleteRef.current(itemId);
    }
    close();
  }, [itemId, close]);

  const Dialog: React.FC<{ title?: string; message?: string }> = ({
    title = 'Delete Valuation',
    message = 'Are you sure you want to delete this valuation? This action cannot be undone.',
  }) => {
    return (
      <ConfirmDialog
        isOpen={isOpen}
        title={title}
        message={message}
        onConfirm={handleConfirm}
        onCancel={close}
      />
    );
  };

  return {
    isOpen,
    itemId,
    open,
    close,
    Dialog,
  };
}

export default DeleteConfirmationDialog;
