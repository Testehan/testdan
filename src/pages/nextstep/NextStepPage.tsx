import React from 'react';
import { useNextStep } from './hooks/useNextStep';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ExecutionView } from './components/ExecutionView';
import { ActionsView } from './components/ActionsView';
import { ProjectsView } from './components/ProjectsView';
import { GoalsView } from './components/GoalsView';
import { ArchiveView } from './components/ArchiveView';
import { FloatingInput } from './components/FloatingInput';
import { Confetti } from './components/Confetti';
import { AddActionModal } from './components/AddActionModal';
import { AddProjectModal } from './components/AddProjectModal';
import { AddGoalModal } from './components/AddGoalModal';
import { EditGoalModal, EditProjectModal, EditActionModal } from './components/EditModals';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { NewSelectionModal } from './components/NewSelectionModal';

const NextStepPage: React.FC = () => {
  const { user, signOutUser } = useAuth();
  const {
    activeView, setActiveView,
    loading, error, setError,
    dashboardData, projects, quickInput, setQuickInput,
    activeProjectCount, showAddActionModal, setShowAddActionModal,
    selectedProjectId, setSelectedProjectId,
    showAddProjectModal, setShowAddProjectModal,
    projectForm, setProjectForm,
    actionForm, setActionForm,
    editingAction, setEditingAction,
    editActionForm, setEditActionForm,
    goals, showAddGoalModal, setShowAddGoalModal,
    goalForm, setGoalForm,
    queuedActions, selectedGoalId, setSelectedGoalId,
    selectedProjectIdForActions, setSelectedProjectIdForActions,
    projectActions, setProjectActions,
    actionFilter, setActionFilter,
    deleteConfirm, setDeleteConfirm,
    editingGoal, setEditingGoal,
    editingProject, setEditingProject,
    editGoalForm, setEditGoalForm,
    editProjectForm, setEditProjectForm,
    showConfetti,
    showNewModal, setShowNewModal,
    draggedAction, setDraggedAction,
    refreshKey, setRefreshKey,
    mobileMenuOpen, setMobileMenuOpen,
    
    // Actions
    fetchActions, fetchProjects,
    completeAction, handleQuickCapture, promoteProject,
    createAction, updateAction, deleteAction,
    createProject, updateProject, deleteProject,
    createGoal, updateGoal, deleteGoal
  } = useNextStep();

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf8ff] p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          Error: {error}
          <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] font-sans">
      {showConfetti && <Confetti />}
      
      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => {
          if (view === 'actions') {
            setSelectedProjectIdForActions('no-project');
            fetchActions({}).then(allActions => {
              const noProjectActions = allActions.filter(a => !a.projectId);
              setProjectActions(noProjectActions);
            });
          }
          setActiveView(view);
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onNewClick={() => setShowNewModal(true)}
      />

      <Header 
        activeView={activeView} 
        setMobileMenuOpen={setMobileMenuOpen} 
        user={user}
        onSignOut={signOutUser}
      />

      {activeView === 'execution' && (
        <ExecutionView 
          dashboardData={dashboardData}
          projects={projects}
          queuedActions={queuedActions}
          actionFilter={actionFilter}
          onActionFilterChange={setActionFilter}
          onCompleteAction={completeAction}
          onEditAction={(action) => {
            setEditingAction(action);
            setEditActionForm({
              description: action.description,
              context: action.context,
              energy: action.energy,
              status: action.status,
              projectId: action.projectId || '',
            });
          }}
        />
      )}

      {activeView === 'actions' && (
        <ActionsView 
          refreshKey={refreshKey}
          selectedProjectIdForActions={selectedProjectIdForActions}
          projectActions={projectActions}
          dashboardData={dashboardData}
          projects={projects}
          draggedAction={draggedAction}
          onProjectChange={async (projectId) => {
            setSelectedProjectIdForActions(projectId);
            if (projectId === 'no-project') {
              const allActions = await fetchActions({});
              const noProjectActions = allActions.filter(a => !a.projectId);
              setProjectActions(noProjectActions);
            } else {
              const actions = await fetchActions({ projectId });
              setProjectActions(actions);
            }
          }}
          onAddAction={() => {
            if (selectedProjectIdForActions === 'no-project') {
              setSelectedProjectId('');
            } else {
              setSelectedProjectId(selectedProjectIdForActions);
            }
            setShowAddActionModal(true);
          }}
          onCompleteAction={completeAction}
          onEditAction={(action) => {
            setEditingAction(action);
            setEditActionForm({
              description: action.description,
              context: action.context,
              energy: action.energy,
              status: action.status,
              projectId: action.projectId || '',
            });
          }}
          onDeleteAction={(id, name) => setDeleteConfirm({ type: 'action', id, name })}
          onDraggedActionChange={setDraggedAction}
          onUpdateAction={updateAction}
          onRefresh={() => setRefreshKey(k => k + 1)}
        />
      )}

      {activeView === 'projects' && (
        <ProjectsView 
          projects={projects}
          goals={goals}
          selectedGoalId={selectedGoalId}
          activeProjectCount={activeProjectCount}
          onGoalChange={(goalId) => {
            setSelectedGoalId(goalId);
            fetchProjects(goalId || undefined);
          }}
          onAddProject={() => setShowAddProjectModal(true)}
          onEditProject={(project) => {
            setEditingProject(project);
            setEditProjectForm({ goalId: project.goalId, title: project.title, outcome: project.outcome, status: project.status });
          }}
          onDeleteProject={(id, name) => setDeleteConfirm({ type: 'project', id, name })}
          onPromoteProject={promoteProject}
          onProjectClick={(projectId) => {
            setSelectedProjectIdForActions(projectId);
            fetchActions({ projectId }).then(setProjectActions);
            setActiveView('actions');
          }}
        />
      )}

      {activeView === 'goals' && (
        <GoalsView 
          goals={goals}
          projects={projects}
          onAddGoal={() => setShowAddGoalModal(true)}
          onEditGoal={(goal) => {
            setEditingGoal(goal);
            setEditGoalForm({ title: goal.title, priority: goal.priority, active: goal.active });
          }}
          onDeleteGoal={(id, name) => setDeleteConfirm({ type: 'goal', id, name })}
          onGoalClick={(goalId) => {
            setSelectedGoalId(goalId);
            fetchProjects(goalId);
            setActiveView('projects');
          }}
        />
      )}

      {activeView === 'archive' && <ArchiveView />}

      <FloatingInput 
        quickInput={quickInput}
        setQuickInput={setQuickInput}
        onQuickCapture={handleQuickCapture}
        loading={loading}
      />

      <AddActionModal 
        show={showAddActionModal}
        onClose={() => setShowAddActionModal(false)}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectedProjectIdChange={setSelectedProjectId}
        actionForm={actionForm}
        onActionFormChange={setActionForm}
        onCreateAction={createAction}
        loading={loading}
      />

      <AddProjectModal 
        show={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        goals={goals}
        projectForm={projectForm}
        onProjectFormChange={setProjectForm}
        onCreateProject={createProject}
        loading={loading}
        activeProjectCount={activeProjectCount}
      />

      <AddGoalModal 
        show={showAddGoalModal}
        onClose={() => setShowAddGoalModal(false)}
        goalForm={goalForm}
        onGoalFormChange={setGoalForm}
        onCreateGoal={createGoal}
        loading={loading}
      />

      <EditGoalModal 
        goal={editingGoal}
        form={editGoalForm}
        onFormChange={setEditGoalForm}
        onClose={() => setEditingGoal(null)}
        onSave={async () => {
          if (editingGoal) {
            await updateGoal(editingGoal.id, editGoalForm);
            setEditingGoal(null);
          }
        }}
        loading={loading}
      />

      <EditProjectModal 
        project={editingProject}
        goals={goals}
        form={editProjectForm}
        onFormChange={setEditProjectForm}
        onClose={() => setEditingProject(null)}
        onSave={async () => {
          if (editingProject) {
            await updateProject(editingProject.id, editProjectForm);
            setEditingProject(null);
          }
        }}
        loading={loading}
        activeProjectCount={activeProjectCount}
      />

      <EditActionModal 
        action={editingAction}
        projects={projects}
        form={editActionForm}
        onFormChange={setEditActionForm}
        onClose={() => setEditingAction(null)}
        onSave={async () => {
          if (editingAction) {
            await updateAction(editingAction.id, editActionForm);
            setEditingAction(null);
          }
        }}
        loading={loading}
      />

      <DeleteConfirmModal 
        confirm={deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (deleteConfirm) {
            if (deleteConfirm.type === 'goal') await deleteGoal(deleteConfirm.id);
            else if (deleteConfirm.type === 'project') await deleteProject(deleteConfirm.id);
            else if (deleteConfirm.type === 'action') await deleteAction(deleteConfirm.id);
            setDeleteConfirm(null);
          }
        }}
      />

      <NewSelectionModal 
        show={showNewModal}
        onClose={() => setShowNewModal(false)}
        projects={projects}
        onAddGoal={() => { setShowNewModal(false); setShowAddGoalModal(true); }}
        onAddProject={() => { setShowNewModal(false); setShowAddProjectModal(true); }}
        onAddAction={() => { 
          setShowNewModal(false); 
          if (projects.length > 0) {
            setSelectedProjectId(projects[0].id);
            setShowAddActionModal(true);
          }
        }}
      />
    </div>
  );
};

export default NextStepPage;