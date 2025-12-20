import React from 'react';
import { Project, ActionContext, ActionStatus } from '../types';

interface AddActionModalProps {
  show: boolean;
  onClose: () => void;
  projects: Project[];
  selectedProjectId: string | null;
  onSelectedProjectIdChange: (id: string) => void;
  actionForm: { description: string; context: ActionContext; energy: 'HIGH' | 'LOW'; status: ActionStatus };
  onActionFormChange: (form: any) => void;
  onCreateAction: (data: any) => void;
  loading: boolean;
}

export const AddActionModal: React.FC<AddActionModalProps> = ({
  show,
  onClose,
  projects,
  selectedProjectId,
  onSelectedProjectIdChange,
  actionForm,
  onActionFormChange,
  onCreateAction,
  loading,
}) => {
  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId && selectedProjectId !== '') return;
    if (!actionForm.description.trim()) return;
    
    onCreateAction({
      projectId: selectedProjectId || undefined,
      description: actionForm.description.trim(),
      context: actionForm.context,
      energy: actionForm.energy,
      status: actionForm.status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#131b2e]">Add Action</h3>
          <button onClick={onClose} className="text-[#737686] hover:text-[#131b2e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Project</label>
            <select
              value={selectedProjectId || ''}
              onChange={e => onSelectedProjectIdChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
            >
              <option value="">No project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Description</label>
            <input
              type="text"
              value={actionForm.description}
              onChange={e => onActionFormChange({ ...actionForm, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#4d556a] mb-2">Context</label>
              <select
                value={actionForm.context}
                onChange={e => onActionFormChange({ ...actionForm, context: e.target.value as ActionContext })}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
              >
                <option value="DEEP_WORK">Deep Work</option>
                <option value="QUICK">Quick</option>
                <option value="PHONE">Phone</option>
                <option value="ERRANDS">Errands</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#4d556a] mb-2">Energy</label>
              <select
                value={actionForm.energy}
                onChange={e => onActionFormChange({ ...actionForm, energy: e.target.value as 'HIGH' | 'LOW' })}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
              >
                <option value="HIGH">High</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Status</label>
            <select
              value={actionForm.status}
              onChange={e => onActionFormChange({ ...actionForm, status: e.target.value as ActionStatus })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
            >
              <option value="QUEUED">Queued</option>
              <option value="CURRENT">Current (only 1 allowed per project)</option>
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
              disabled={loading || !actionForm.description.trim()}
              className="flex-1 py-3 bg-[#0051d5] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              Add Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};