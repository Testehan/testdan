import React from 'react';
import { Priority } from '../types';

interface AddGoalModalProps {
  show: boolean;
  onClose: () => void;
  goalForm: { title: string; priority: Priority; active: boolean };
  onGoalFormChange: (form: any) => void;
  onCreateGoal: (title: string, priority: Priority, active: boolean) => void;
  loading: boolean;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  show,
  onClose,
  goalForm,
  onGoalFormChange,
  onCreateGoal,
  loading,
}) => {
  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title.trim()) return;
    onCreateGoal(goalForm.title.trim(), goalForm.priority, goalForm.active);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#131b2e]">Add Goal</h3>
          <button onClick={onClose} className="text-[#737686] hover:text-[#131b2e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Title</label>
            <input
              type="text"
              value={goalForm.title}
              onChange={e => onGoalFormChange({ ...goalForm, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
              placeholder="What do you want to achieve?"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Priority</label>
            <select
              value={goalForm.priority}
              onChange={e => onGoalFormChange({ ...goalForm, priority: e.target.value as Priority })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="goalActive"
              checked={goalForm.active}
              onChange={e => onGoalFormChange({ ...goalForm, active: e.target.checked })}
              className="w-5 h-5 rounded border-[#c3c6d7] text-[#0051d5] focus:ring-[#0051d5]"
            />
            <label htmlFor="goalActive" className="text-sm font-bold text-[#4d556a]">Active Goal</label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#e2e7ff] text-[#4d556a] font-bold rounded-xl hover:opacity-90"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !goalForm.title.trim()}
              className="flex-1 py-3 bg-[#0051d5] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              Add Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};