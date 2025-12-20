import React from 'react';
import { Goal, Priority, Project, ProjectStatus, NextAction, ActionContext, ActionStatus } from '../types';

interface EditGoalModalProps {
  goal: Goal | null;
  form: { title: string; priority: Priority; active: boolean };
  onFormChange: (form: any) => void;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
}

export const EditGoalModal: React.FC<EditGoalModalProps> = ({ goal, form, onFormChange, onClose, onSave, loading }) => {
  if (!goal) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#131b2e]">Edit Goal</h3>
          <button onClick={onClose} className="text-[#737686] hover:text-[#131b2e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => onFormChange({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Priority</label>
            <select
              value={form.priority}
              onChange={e => onFormChange({ ...form, priority: e.target.value as Priority })}
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
              id="editGoalActive"
              checked={form.active}
              onChange={e => onFormChange({ ...form, active: e.target.checked })}
              className="w-5 h-5 rounded border-[#c3c6d7] text-[#0051d5] focus:ring-[#0051d5]"
            />
            <label htmlFor="editGoalActive" className="text-sm font-bold text-[#4d556a]">Active Goal</label>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 py-3 bg-[#e2e7ff] text-[#4d556a] font-bold rounded-xl hover:opacity-90">Cancel</button>
            <button
              onClick={onSave}
              disabled={loading || !form.title.trim()}
              className="flex-1 py-3 bg-[#0051d5] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditProjectModalProps {
  project: Project | null;
  goals: Goal[];
  form: { goalId: string; title: string; outcome: string; status: ProjectStatus };
  onFormChange: (form: any) => void;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
  activeProjectCount: number;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, goals, form, onFormChange, onClose, onSave, loading, activeProjectCount }) => {
  if (!project) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#131b2e]">Edit Project</h3>
          <button onClick={onClose} className="text-[#737686] hover:text-[#131b2e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Goal</label>
            <select
              value={form.goalId}
              onChange={e => onFormChange({ ...form, goalId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
            >
              <option value="">Select a goal...</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => onFormChange({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Outcome</label>
            <textarea
              value={form.outcome}
              onChange={e => onFormChange({ ...form, outcome: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0 resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Status</label>
            <select
              value={form.status}
              onChange={e => onFormChange({ ...form, status: e.target.value as ProjectStatus })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
              disabled={activeProjectCount >= 3 && form.status !== 'ACTIVE'}
            >
              <option value="BACKLOG">Backlog</option>
              <option value="ACTIVE" disabled={activeProjectCount >= 3 && form.status !== 'ACTIVE'}>Active ({activeProjectCount}/3)</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 py-3 bg-[#e2e7ff] text-[#4d556a] font-bold rounded-xl hover:opacity-90">Cancel</button>
            <button
              onClick={onSave}
              disabled={loading || !form.title.trim() || !form.goalId}
              className="flex-1 py-3 bg-[#0051d5] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditActionModalProps {
  action: NextAction | null;
  projects: Project[];
  form: { description: string; context: ActionContext; energy: 'HIGH' | 'LOW'; status: ActionStatus; projectId: string };
  onFormChange: (form: any) => void;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
}

export const EditActionModal: React.FC<EditActionModalProps> = ({ action, projects, form, onFormChange, onClose, onSave, loading }) => {
  if (!action) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#131b2e]">Edit Action</h3>
          <button onClick={onClose} className="text-[#737686] hover:text-[#131b2e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Project</label>
            <select
              value={form.projectId}
              onChange={e => onFormChange({ ...form, projectId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
            >
              <option value="">No project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#4d556a] mb-2">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => onFormChange({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#4d556a] mb-2">Context</label>
              <select
                value={form.context}
                onChange={e => onFormChange({ ...form, context: e.target.value as ActionContext })}
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
                value={form.energy}
                onChange={e => onFormChange({ ...form, energy: e.target.value as 'HIGH' | 'LOW' })}
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
              value={form.status}
              onChange={e => onFormChange({ ...form, status: e.target.value as ActionStatus })}
              className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
            >
              <option value="QUEUED">Queued</option>
              <option value="CURRENT">Current</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 py-3 bg-[#e2e7ff] text-[#4d556a] font-bold rounded-xl hover:opacity-90">Cancel</button>
            <button
              onClick={onSave}
              disabled={loading || !form.description.trim()}
              className="flex-1 py-3 bg-[#0051d5] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};