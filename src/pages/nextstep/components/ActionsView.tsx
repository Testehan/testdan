import React from 'react';
import { NextAction, Project, ActionContext } from '../types';
import { CONTEXT_LABELS, CONTEXT_COLORS } from '../constants';

interface ActionsViewProps {
  refreshKey: number;
  selectedProjectIdForActions: string;
  projectActions: NextAction[];
  dashboardData: { nextActions: NextAction[] } | null;
  projects: Project[];
  draggedAction: string | null;
  onProjectChange: (projectId: string) => void;
  onAddAction: () => void;
  onCompleteAction: (actionId: string) => void;
  onEditAction: (action: NextAction) => void;
  onDeleteAction: (actionId: string, description: string) => void;
  onDraggedActionChange: (id: string | null) => void;
  onUpdateAction: (id: string, data: any) => Promise<any>;
  onRefresh: () => void;
}

export const ActionsView: React.FC<ActionsViewProps> = ({
  refreshKey,
  selectedProjectIdForActions,
  projectActions,
  projects,
  draggedAction,
  onProjectChange,
  onAddAction,
  onCompleteAction,
  onEditAction,
  onDeleteAction,
  onDraggedActionChange,
  onUpdateAction,
  onRefresh,
}) => {
  const allActions = projectActions;
  
  const currentActions = allActions.filter(a => a.status === 'CURRENT');
  const queuedActionsList = allActions.filter(a => a.status === 'QUEUED');
  const doneActions = allActions.filter(a => a.status === 'DONE');
  
  const selectedProject = projects.find(p => p.id === selectedProjectIdForActions);

  const getContextBadge = (context: ActionContext) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight uppercase ${CONTEXT_COLORS[context]}`}>
      {CONTEXT_LABELS[context]}
    </span>
  );

  return (
    <main key={refreshKey} className="mt-16 p-4 lg:p-10 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            {selectedProjectIdForActions === 'no-project' ? 'Actions: No project' : selectedProject ? `Actions: ${selectedProject.title}` : 'Actions'}
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={selectedProjectIdForActions || ''}
              onChange={(e) => onProjectChange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-[#c3c6d7] bg-white text-sm font-medium"
            >
              <option value="no-project">No project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <button 
              onClick={onAddAction}
              className="px-4 py-2 bg-[#0051d5] text-white rounded-xl font-bold flex items-center gap-1 hover:opacity-90"
            >
              <span className="material-symbols-outlined">add</span>
              Add Action
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current + Queued Column */}
          <div className="space-y-6">
            {selectedProject || selectedProjectIdForActions === 'no-project' ? (
              <>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async () => {
                    if (draggedAction) {
                      const actionToMove = [...currentActions, ...queuedActionsList].find(a => a.id === draggedAction);
                      if (actionToMove?.status === 'QUEUED') {
                        await onUpdateAction(draggedAction, { status: 'CURRENT' });
                        onDraggedActionChange(null);
                        onRefresh();
                      }
                    }
                  }}
                >
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#0051d5] mb-4">Current (drop queued here)</h3>
                  <div className="space-y-3">
                    {currentActions.length === 0 ? (
                      <p className="text-sm text-[#737686] italic">No current action</p>
                    ) : (
                      currentActions.map(action => (
                        <div 
                          key={action.id}
                          draggable
                          onDragStart={() => onDraggedActionChange(action.id)}
                          onDragEnd={() => onDraggedActionChange(null)}
                          className="flex items-center gap-3 p-4 bg-white rounded-xl border-l-4 border-[#0051d5] cursor-move"
                        >
                          <button 
                            onClick={() => onCompleteAction(action.id)}
                            className="px-3 py-1.5 bg-[#0051d5] text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:opacity-90"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                            Done
                          </button>
                          <div className="flex-1">
                            <p className="font-medium text-[#131b2e]">{action.description}</p>
                          </div>
                          {getContextBadge(action.context)}
                          <button onClick={() => onEditAction(action)} className="text-[#737686] hover:text-[#0051d5]">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => onDeleteAction(action.id, action.description)} className="text-[#737686] hover:text-red-500">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async () => {
                    if (draggedAction) {
                      const actionToMove = [...currentActions, ...queuedActionsList].find(a => a.id === draggedAction);
                      if (actionToMove?.status === 'CURRENT') {
                        await onUpdateAction(draggedAction, { status: 'QUEUED' });
                        onDraggedActionChange(null);
                        onRefresh();
                      }
                    }
                  }}
                >
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#4d556a] mb-4">Queued (drop from Current here)</h3>
                  <div className="space-y-3">
                    {queuedActionsList.length === 0 ? (
                      <p className="text-sm text-[#737686] italic">No queued actions</p>
                    ) : (
                      queuedActionsList.map((action, idx) => (
                        <div 
                          key={action.id}
                          draggable
                          onDragStart={() => onDraggedActionChange(action.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async () => {
                            if (draggedAction && draggedAction !== action.id) {
                              const newCreatedAt = new Date(Date.now() + (idx * 1000)).toISOString();
                              await onUpdateAction(draggedAction, { createdAt: newCreatedAt });
                              onDraggedActionChange(null);
                              onRefresh();
                            }
                          }}
                          onDragEnd={() => onDraggedActionChange(null)}
                          className={`flex items-center gap-3 p-4 bg-[#f2f3ff] rounded-xl cursor-move ${draggedAction === action.id ? 'opacity-50' : ''}`}
                        >
                          <span className="material-symbols-outlined text-[#c3c6d7] text-sm">drag_indicator</span>
                          <div className="flex-1">
                            <p className="font-medium text-[#131b2e]">{action.description}</p>
                          </div>
                          <span className="text-[10px] text-[#737686] uppercase">{CONTEXT_LABELS[action.context]}</span>
                          <button onClick={() => onEditAction(action)} className="text-[#737686] hover:text-[#0051d5]">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => onDeleteAction(action.id, action.description)} className="text-[#737686] hover:text-red-500">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#4d556a] mb-4">All Actions (drag queued to reorder)</h3>
                <div className="space-y-3">
                  {currentActions.length === 0 && queuedActionsList.length === 0 ? (
                    <p className="text-sm text-[#737686] italic">No actions</p>
                  ) : (
                    <>
                      {currentActions.map(action => (
                        <div key={action.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border-l-4 border-[#0051d5]">
                          <button 
                            onClick={() => onCompleteAction(action.id)}
                            className="px-3 py-1.5 bg-[#0051d5] text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:opacity-90"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                            Done
                          </button>
                          <div className="flex-1">
                            <p className="font-medium text-[#131b2e]">{action.description}</p>
                            <p className="text-xs text-[#737686]">{projects.find(p => p.id === action.projectId)?.title || action.projectId}</p>
                          </div>
                          {getContextBadge(action.context)}
                          <button onClick={() => onEditAction(action)} className="text-[#737686] hover:text-[#0051d5]">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => onDeleteAction(action.id, action.description)} className="text-[#737686] hover:text-red-500">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      ))}
                      {queuedActionsList.map((action, idx) => (
                        <div 
                          key={action.id}
                          draggable
                          onDragStart={() => onDraggedActionChange(action.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async () => {
                            if (draggedAction && draggedAction !== action.id) {
                              const newCreatedAt = new Date(Date.now() + (idx * 1000)).toISOString();
                              await onUpdateAction(draggedAction, { createdAt: newCreatedAt });
                              onDraggedActionChange(null);
                              onRefresh();
                            }
                          }}
                          onDragEnd={() => onDraggedActionChange(null)}
                          className={`flex items-center gap-3 p-4 bg-[#f2f3ff] rounded-xl cursor-move ${draggedAction === action.id ? 'opacity-50' : ''}`}
                        >
                          <span className="material-symbols-outlined text-[#c3c6d7] text-sm">drag_indicator</span>
                          <div className="flex-1">
                            <p className="font-medium text-[#131b2e]">{action.description}</p>
                            <p className="text-xs text-[#737686]">{projects.find(p => p.id === action.projectId)?.title || action.projectId}</p>
                          </div>
                          <span className="text-[10px] text-[#737686] uppercase">{CONTEXT_LABELS[action.context]}</span>
                          <button onClick={() => onEditAction(action)} className="text-[#737686] hover:text-[#0051d5]">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => onDeleteAction(action.id, action.description)} className="text-[#737686] hover:text-red-500">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Done Column */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#737686] mb-4">Done</h3>
            <div className="space-y-3">
              {doneActions.length === 0 ? (
                <p className="text-sm text-[#737686] italic">No completed actions</p>
              ) : (
                doneActions.map(action => (
                  <div key={action.id} className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
                    <span className="material-symbols-outlined text-[#737686]">check_circle</span>
                    <div className="flex-1">
                      <p className="font-medium text-[#737686] line-through">{action.description}</p>
                      <p className="text-xs text-[#a0a0a8]">{projects.find(p => p.id === action.projectId)?.title || 'No Project'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};