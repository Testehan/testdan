import React from 'react';
import { Project } from '../types';

interface NewSelectionModalProps {
  show: boolean;
  onClose: () => void;
  projects: Project[];
  onAddGoal: () => void;
  onAddProject: () => void;
  onAddAction: () => void;
}

export const NewSelectionModal: React.FC<NewSelectionModalProps> = ({
  show,
  onClose,
  projects,
  onAddGoal,
  onAddProject,
  onAddAction,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#131b2e]">Create New</h3>
          <button onClick={onClose} className="text-[#737686] hover:text-[#131b2e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="space-y-3">
          <button
            onClick={onAddGoal}
            className="w-full p-4 bg-[#f2f3ff] rounded-xl flex items-center gap-4 hover:bg-[#e2e7ff] transition-colors"
          >
            <div className="w-10 h-10 bg-[#0051d5]/10 text-[#0051d5] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">flag</span>
            </div>
            <div className="text-left">
              <h4 className="font-bold text-[#131b2e]">Goal</h4>
              <p className="text-xs text-[#737686]">Create a new goal</p>
            </div>
          </button>
          <button
            onClick={onAddProject}
            className="w-full p-4 bg-[#f2f3ff] rounded-xl flex items-center gap-4 hover:bg-[#e2e7ff] transition-colors"
          >
            <div className="w-10 h-10 bg-[#0051d5]/10 text-[#0051d5] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">account_tree</span>
            </div>
            <div className="text-left">
              <h4 className="font-bold text-[#131b2e]">Project</h4>
              <p className="text-xs text-[#737686]">Create a new project</p>
            </div>
          </button>
          {projects.length > 0 ? (
            <button
              onClick={onAddAction}
              className="w-full p-4 bg-[#f2f3ff] rounded-xl flex items-center gap-4 hover:bg-[#e2e7ff] transition-colors"
            >
              <div className="w-10 h-10 bg-[#0051d5]/10 text-[#0051d5] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[#131b2e]">Action</h4>
                <p className="text-xs text-[#737686]">Add a new action</p>
              </div>
            </button>
          ) : (
            <div className="w-full p-4 bg-gray-100 rounded-xl flex items-center gap-4 opacity-50">
              <div className="w-10 h-10 bg-gray-200 text-gray-400 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-400">Action</h4>
                <p className="text-xs text-gray-400">Create a project first</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};