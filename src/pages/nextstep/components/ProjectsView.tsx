import React from 'react';
import { Project, Goal } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  goals: Goal[];
  selectedGoalId: string | null;
  activeProjectCount: number;
  onGoalChange: (goalId: string | null) => void;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string, title: string) => void;
  onPromoteProject: (projectId: string) => void;
  onProjectClick: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  goals,
  selectedGoalId,
  activeProjectCount,
  onGoalChange,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onPromoteProject,
  onProjectClick,
}) => {
  const activeProjects = projects.filter(p => p.status === 'ACTIVE');
  const backlogProjects = projects.filter(p => p.status === 'BACKLOG');
  const currentGoal = selectedGoalId ? goals.find(g => g.id === selectedGoalId) : null;

  return (
    <main className="mt-16 p-4 lg:p-10 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Projects</h2>
            {currentGoal && (
              <p className="text-sm text-[#0051d5] font-medium mt-1">
                Filtered by goal: {currentGoal.title}
                <button 
                  onClick={() => onGoalChange(null)}
                  className="ml-2 text-[#737686] hover:text-[#131b2e]"
                >
                  (clear)
                </button>
              </p>
            )}
          </div>
          <button 
            onClick={onAddProject}
            className="px-4 py-2 bg-[#0051d5] text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90"
          >
            <span className="material-symbols-outlined">add</span>
            Add Project
          </button>
        </div>
        
        {!selectedGoalId && (
          <div className="mb-6 flex gap-2 flex-wrap">
            <span className="text-sm text-[#434655] font-medium py-2">Filter by goal:</span>
            {goals.filter(g => g.active).map(goal => (
              <button
                key={goal.id}
                onClick={() => onGoalChange(goal.id)}
                className="px-3 py-1 text-sm bg-[#f2f3ff] text-[#4d556a] rounded-full hover:bg-[#e2e7ff] transition-colors"
              >
                {goal.title}
              </button>
            ))}
          </div>
        )}
        
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#0051d5] mb-4">Active ({activeProjects.length}/3)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeProjects.map(project => (
              <div 
                key={project.id} 
                className="bg-white p-6 rounded-xl space-y-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onProjectClick(project.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-[#0051d5]/10 text-[#0051d5] rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">rocket_launch</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(project);
                      }}
                      className="text-[#737686] hover:text-[#0051d5]"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id, project.title);
                      }}
                      className="text-[#737686] hover:text-red-500"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#131b2e]">{project.title}</h3>
                  <p className="text-sm text-[#434655] mt-1">{project.outcome || 'No outcome set'}</p>
                </div>
              </div>
            ))}
            {activeProjects.length === 0 && (
              <div className="col-span-2 p-6 text-[#434655] text-center bg-[#f2f3ff] rounded-xl">
                No active projects
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#434655] mb-4">Backlog</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {backlogProjects.map(project => (
              <div 
                key={project.id} 
                className="bg-[#f2f3ff] p-6 rounded-xl space-y-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onProjectClick(project.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-[#c3c6d7]/30 text-[#737686] rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(project);
                      }}
                      className="text-[#737686] hover:text-[#0051d5]"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id, project.title);
                      }}
                      className="text-[#737686] hover:text-red-500"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onPromoteProject(project.id);
                      }}
                      disabled={activeProjectCount >= 3}
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        activeProjectCount >= 3 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#0051d5] text-white hover:opacity-90'
                      }`}
                    >
                      Promote
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#131b2e]">{project.title}</h3>
                  <p className="text-sm text-[#434655] mt-1">{project.outcome || 'No outcome set'}</p>
                </div>
              </div>
            ))}
            {backlogProjects.length === 0 && (
              <div className="col-span-2 p-6 text-[#434655] text-center">
                No backlog projects
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};