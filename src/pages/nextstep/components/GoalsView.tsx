import React from 'react';
import { Goal, Project } from '../types';
import { formatDate } from '../constants';

interface GoalsViewProps {
  goals: Goal[];
  projects: Project[];
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string, title: string) => void;
  onGoalClick: (goalId: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  projects,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onGoalClick,
}) => {
  const activeGoals = goals.filter(g => g.active);
  const inactiveGoals = goals.filter(g => !g.active);

  return (
    <main className="mt-16 p-4 lg:p-10 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Goals</h2>
          <button 
            onClick={onAddGoal}
            className="px-3 lg:px-4 py-2 bg-[#0051d5] text-white rounded-xl font-bold flex items-center gap-1 lg:gap-2 hover:opacity-90 text-sm lg:text-base"
          >
            <span className="material-symbols-outlined">add</span>
            <span className="hidden sm:inline">Add Goal</span>
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#0051d5] mb-4">Active Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeGoals.map(goal => (
              <div 
                key={goal.id} 
                className="bg-white p-6 rounded-xl space-y-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onGoalClick(goal.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-[#0051d5]/10 text-[#0051d5] rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">flag</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditGoal(goal);
                      }}
                      className="text-[#737686] hover:text-[#0051d5]"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGoal(goal.id, goal.title);
                      }}
                      className="text-[#737686] hover:text-red-500"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      goal.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                      goal.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#131b2e]">{goal.title}</h3>
                  <p className="text-sm text-[#434655] mt-1">
                    {projects.filter(p => p.goalId === goal.id).length} projects
                  </p>
                  {goal.updatedAt && (
                    <p className="text-xs text-[#737686] mt-1">Updated: {formatDate(goal.updatedAt)}</p>
                  )}
                </div>
              </div>
            ))}
            {activeGoals.length === 0 && (
              <div className="col-span-2 p-6 text-[#434655] text-center bg-[#f2f3ff] rounded-xl">
                No active goals
              </div>
            )}
          </div>
        </div>

        {inactiveGoals.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-[#434655] mb-4">Inactive Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inactiveGoals.map(goal => (
                <div key={goal.id} className="bg-[#f2f3ff] p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-[#c3c6d7]/30 text-[#737686] rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined">flag</span>
                    </div>
                    <span className="text-xs font-bold text-[#737686]">Inactive</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#131b2e]">{goal.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};