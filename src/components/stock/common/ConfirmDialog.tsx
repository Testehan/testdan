import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="p-8 border w-96 shadow-lg rounded-md bg-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-lg text-gray-500">{message}</p>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Confirm
            </button>
            <button
              onClick={onCancel}
              className="ml-4 px-4 py-2 bg-gray-200 text-gray-900 text-base font-medium rounded-md w-24 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
