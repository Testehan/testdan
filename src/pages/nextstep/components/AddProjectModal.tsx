import React from 'react';
import { Goal, ProjectStatus } from '../types';

interface AddProjectModalProps {
  show: boolean;
  onClose: () => void;
  goals: Goal[];
  projectForm: { goalId: string; title: string; outcome: string; status: 'ACTIVE' | 'BACKLOG' };
  onProjectFormChange: (form: any) => void;
  onCreateProject: (goalId: string, title: string, outcome: string, status: 'ACTIVE' | 'BACKLOG') => void;
  loading: boolean;
  activeProjectCount: number;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  show,
  onClose,
  goals,
  projectForm,
  onProjectFormChange,
  onCreateProject,
  loading,
  activeProjectCount,
}) => {
  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim() || !projectForm.goalId) return;
    onCreateProject(projectForm.goalId, projectForm.title.trim(), projectForm.outcome.trim(), projectForm.status);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#131b2e]">Add Project</h3>
          <button onClick={onClose} className="text-[#737686] hover:text-[#131b2e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Goal</label>
            <select
              value={projectForm.goalId}
              onChange={e => onProjectFormChange({ ...projectForm, goalId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
            >
              <option value="">Select a goal...</option>
              {goals.filter(g => g.active).map(goal => (
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Title</label>
            <input
              type="text"
              value={projectForm.title}
              onChange={e => onProjectFormChange({ ...projectForm, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
              placeholder="What do you want to accomplish?"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Outcome</label>
            <textarea
              value={projectForm.outcome}
              onChange={e => onProjectFormChange({ ...projectForm, outcome: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0 resize-none"
              placeholder="What does success look like?"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Status</label>
            <select
              value={projectForm.status}
              onChange={e => onProjectFormChange({ ...projectForm, status: e.target.value as 'ACTIVE' | 'BACKLOG' })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
              disabled={activeProjectCount >= 3}
            >
              <option value="BACKLOG">Backlog</option>
              <option value="ACTIVE" disabled={activeProjectCount >= 3}>Active ({activeProjectCount}/3)</option>
            </select>
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
              disabled={loading || !projectForm.title.trim() || !projectForm.goalId}
              className="flex-1 py-3 bg-[#0051d5] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};