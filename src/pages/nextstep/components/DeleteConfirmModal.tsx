import React from 'react';

interface DeleteConfirmModalProps {
  confirm: { type: 'goal' | 'project' | 'action'; id: string; name: string } | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ confirm, onClose, onConfirm }) => {
  if (!confirm) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
          <h3 className="text-xl font-bold text-[#131b2e]">Confirm Delete</h3>
        </div>
        <p className="text-[#434655] mb-6">
          {confirm.type === 'goal' && (
            <>Are you sure you want to delete <strong>{confirm.name}</strong>? This will also delete all projects and actions under this goal.</>
          )}
          {confirm.type === 'project' && (
            <>Are you sure you want to delete <strong>{confirm.name}</strong>? This will also delete all actions under this project.</>
          )}
          {confirm.type === 'action' && (
            <>Are you sure you want to delete this action? <strong>{confirm.name}</strong></>
          )}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#e2e7ff] text-[#4d556a] font-bold rounded-xl hover:opacity-90"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};