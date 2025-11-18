import React from 'react';

const NotesDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}> = ({ isOpen, onClose, onSave, notes, onNotesChange }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Personal Notes</h3>
              <textarea
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={10}
              />
              <div className="mt-4 flex justify-end space-x-2">
                  <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                      Cancel
                  </button>
                  <button onClick={onSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Save
                  </button>
              </div>
          </div>
      </div>
  );
};

export default NotesDialog;
