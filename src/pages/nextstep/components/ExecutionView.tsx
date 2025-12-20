import React from 'react';
import { DashboardData, Project, NextAction, ActionContext } from '../types';
import { CONTEXT_LABELS, CONTEXT_COLORS } from '../constants';

interface ExecutionViewProps {
  dashboardData: DashboardData | null;
  projects: Project[];
  queuedActions: NextAction[];
  actionFilter: 'ALL' | ActionContext;
  onActionFilterChange: (filter: 'ALL' | ActionContext) => void;
  onCompleteAction: (actionId: string) => void;
  onEditAction: (action: NextAction) => void;
}

export const ExecutionView: React.FC<ExecutionViewProps> = ({
  dashboardData,
  projects,
  queuedActions,
  actionFilter,
  onActionFilterChange,
  onCompleteAction,
  onEditAction,
}) => {
  const allActions: NextAction[] = dashboardData?.nextActions || [];
  const currentActions = allActions.filter(a => a.status === 'CURRENT');

  const getContextBadge = (context: ActionContext) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight uppercase ${CONTEXT_COLORS[context]}`}>
      {CONTEXT_LABELS[context]}
    </span>
  );

  const filteredActions = actionFilter === 'ALL' 
    ? currentActions 
    : currentActions.filter(a => a.context === actionFilter);

  return (
    <main className="mt-16 p-4 lg:p-10 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
        <section className="lg:col-span-8 space-y-6 lg:space-y-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Today Focus</h2>
              <p className="text-[#434655] font-medium uppercase text-xs tracking-widest mt-1">Current Actions</p>
            </div>
            <div className="flex gap-2">
              {['ALL', 'DEEP_WORK', 'QUICK'].map((f) => (
                <button 
                  key={f}
                  onClick={() => onActionFilterChange(f as 'ALL' | ActionContext)}
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight uppercase transition-colors ${
                    actionFilter === f 
                      ? 'bg-[#0051d5] text-white' 
                      : 'bg-[#e2e7ff] text-[#4d556a] hover:bg-[#0051d5] hover:text-white'
                  }`}
                >
                  {f === 'ALL' ? 'All' : CONTEXT_LABELS[f as ActionContext]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredActions.length === 0 ? (
              <div className="p-5 bg-white rounded-xl text-[#434655]">
                No current actions. Add tasks via quick capture or check your backlog.
              </div>
            ) : (
              filteredActions.map(action => (
                <div 
                  key={action.id}
                  className="group flex items-center gap-4 p-5 bg-white rounded-xl hover:bg-white transition-all border-l-4 border-[#0051d5]"
                >
                  <button 
                    onClick={() => onCompleteAction(action.id)}
                    className="px-3 py-1.5 bg-[#0051d5] text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    Done
                  </button>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#131b2e]">{action.description}</h3>
                    <p className="text-sm text-[#434655]">
                      {projects.find(p => p.id === action.projectId)?.title || 'No Project'}
                    </p>
                  </div>
                  {getContextBadge(action.context)}
                  <button 
                    onClick={() => onEditAction(action)}
                    className="material-symbols-outlined text-[#c3c6d7] opacity-0 group-hover:opacity-100 cursor-pointer hover:text-[#0051d5]"
                  >
                    edit
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="lg:col-span-4 space-y-8 mt-8 lg:mt-0">
          <div className="bg-[#f2f3ff] p-6 rounded-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#4d556a] mb-6">Queued Actions</h3>
            <div className="space-y-3">
              {queuedActions.slice(0, 5).map((action) => (
                <div key={action.id} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="material-symbols-outlined text-[#c3c6d7] text-sm mt-0.5">drag_indicator</span>
                  <div>
                    <p className="text-sm font-medium text-[#131b2e]">{action.description}</p>
                    <p className="text-[10px] text-[#434655] uppercase">{CONTEXT_LABELS[action.context]}</p>
                  </div>
                </div>
              ))}
              {queuedActions.length === 0 && (
                <p className="text-sm text-[#434655]">No queued actions</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};