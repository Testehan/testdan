import { useState, useEffect, useCallback } from 'react';
import { NEXTSTEP_ENDPOINT, nextstepFetch } from '../../../config';
import { 
  Goal, Priority, ProjectStatus, Project, NextAction, ActionContext, ActionStatus, 
  DashboardData, ActionCreateRequest, ActionPatchRequest, GoalPatchRequest, 
  ProjectPatchRequest 
} from '../types';

export type View = 'execution' | 'actions' | 'projects' | 'goals' | 'archive';

export const useNextStep = () => {
  const [activeView, setActiveView] = useState<View>('execution');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [quickInput, setQuickInput] = useState('');
  const [activeProjectCount, setActiveProjectCount] = useState(0);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ goalId: '', title: '', outcome: '', status: 'BACKLOG' as 'ACTIVE' | 'BACKLOG' });
  const [actionForm, setActionForm] = useState({ description: '', context: 'QUICK' as ActionContext, energy: 'LOW' as 'HIGH' | 'LOW', status: 'QUEUED' as ActionStatus });
  const [editingAction, setEditingAction] = useState<NextAction | null>(null);
  const [editActionForm, setEditActionForm] = useState({ description: '', context: 'QUICK' as ActionContext, energy: 'LOW' as 'HIGH' | 'LOW', status: 'QUEUED' as ActionStatus, projectId: '' });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', priority: 'MEDIUM' as Priority, active: true });
  const [queuedActions, setQueuedActions] = useState<NextAction[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedProjectIdForActions, setSelectedProjectIdForActions] = useState<string>('no-project');
  const [projectActions, setProjectActions] = useState<NextAction[]>([]);
  const [actionFilter, setActionFilter] = useState<'ALL' | ActionContext>('ALL');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'goal' | 'project' | 'action'; id: string; name: string } | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editGoalForm, setEditGoalForm] = useState({ title: '', priority: 'MEDIUM' as Priority, active: true });
  const [editProjectForm, setEditProjectForm] = useState({ goalId: '', title: '', outcome: '', status: 'BACKLOG' as ProjectStatus });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [draggedAction, setDraggedAction] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch goals
  const fetchGoals = useCallback(async () => {
    try {
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/goals`);
      if (!response.ok) throw new Error('Failed to fetch goals');
      const data: Goal[] = await response.json();
      setGoals(data);
    } catch (e) {
      console.error('Goals fetch error:', e);
    }
  }, []);

  // Fetch actions with optional filters
  const fetchActions = useCallback(async (filters?: { status?: string; projectId?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.projectId) params.append('projectId', filters.projectId);
      const queryString = params.toString();
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/actions${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch actions');
      const data: NextAction[] = await response.json();
      return data;
    } catch (e) {
      console.error('Actions fetch error:', e);
      return [];
    }
  }, []);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      const data: DashboardData = await response.json();
      setDashboardData(data);
      
      const activeCount = data.projectSummaries?.filter(p => p.project.status === 'ACTIVE').length || 0;
      setActiveProjectCount(activeCount);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    }
  }, []);

  // Fetch projects
  const fetchProjects = useCallback(async (goalId?: string) => {
    try {
      const params = goalId ? `?goalId=${goalId}` : '';
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/projects${params}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data: Project[] = await response.json();
      setProjects(data);
      setActiveProjectCount(data.filter(p => p.status === 'ACTIVE').length);
    } catch (e) {
      console.error('Projects fetch error:', e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboard();
    fetchProjects();
    fetchGoals();
    fetchActions({ status: 'QUEUED' }).then(setQueuedActions);
    fetchActions({}).then((allActions) => {
      const noProjectActions = allActions.filter((a: NextAction) => !a.projectId);
      setProjectActions(noProjectActions);
    });
  }, [fetchDashboard, fetchProjects, fetchGoals, fetchActions]);

  // Load no-project actions when navigating to actions view
  useEffect(() => {
    if (activeView === 'actions') {
      fetchActions({}).then((allActions) => {
        const noProjectActions = allActions.filter((a: NextAction) => !a.projectId);
        setProjectActions(noProjectActions);
      });
    }
  }, [activeView, fetchActions]);

  const completeAction = async (actionId: string) => {
    try {
      setLoading(true);
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/actions/${actionId}/complete`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to complete action');
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 10000);
      
      await fetchDashboard();
      if (selectedProjectIdForActions === 'no-project') {
        const allActions = await fetchActions({});
        const noProjectActions = allActions.filter((a: NextAction) => !a.projectId);
        setProjectActions(noProjectActions);
      } else if (selectedProjectIdForActions) {
        const actions = await fetchActions({ projectId: selectedProjectIdForActions });
        setProjectActions(actions);
      }
      const queued = await fetchActions({ status: 'QUEUED' });
      setQueuedActions(queued);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCapture = async () => {
    if (!quickInput.trim()) return;
    
    try {
      setLoading(true);
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: quickInput,
          context: 'QUICK',
          energy: 'LOW',
          status: 'QUEUED'
        }),
      });
      if (!response.ok) throw new Error('Failed to capture');
      
      setQuickInput('');
      await fetchDashboard();
      const queued = await fetchActions({ status: 'QUEUED' });
      setQueuedActions(queued);
      if (selectedProjectIdForActions === 'no-project') {
        const allActions = await fetchActions({});
        const noProjectActions = allActions.filter((a: NextAction) => !a.projectId);
        setProjectActions(noProjectActions);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const promoteProject = async (projectId: string) => {
    try {
      setLoading(true);
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/projects/${projectId}/promote`, {
        method: 'POST',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to promote project');
      }
      
      await fetchDashboard();
      await fetchProjects();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const createAction = async (data: ActionCreateRequest) => {
    try {
      setLoading(true);
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const err = await response.json();
        if (response.status === 500 && err.message?.includes('max one')) {
          throw new Error('This project already has a current action. Complete it first or set the new action to Queued.');
        }
        throw new Error(err.message || 'Failed to create action');
      }
      
      setShowAddActionModal(false);
      setSelectedProjectId(null);
      await fetchDashboard();
      const queued = await fetchActions({ status: 'QUEUED' });
      setQueuedActions(queued);
      if (selectedProjectIdForActions === 'no-project') {
        const allActions = await fetchActions({});
        const noProjectActions = allActions.filter((a: NextAction) => !a.projectId);
        setProjectActions(noProjectActions);
      } else if (selectedProjectIdForActions) {
        const actions = await fetchActions({ projectId: selectedProjectIdForActions });
        setProjectActions(actions);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAction = async (id: string, data: ActionPatchRequest) => {
    try {
      setLoading(true);
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/actions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const err = await response.json();
        if (response.status === 500 && err.message?.includes('max one')) {
          throw new Error('You already have a current action for this project. Finish it first or demote it.');
        }
        throw new Error(err.message || 'Failed to update action');
      }
      
      await fetchDashboard();
      if (selectedProjectIdForActions === 'no-project') {
        const allActions = await fetchActions({});
        const noProjectActions = allActions.filter((a: NextAction) => !a.projectId);
        setProjectActions(noProjectActions);
      } else if (selectedProjectIdForActions) {
        const actions = await fetchActions({ projectId: selectedProjectIdForActions });
        setProjectActions(actions);
      }
      const queued = await fetchActions({ status: 'QUEUED' });
      setQueuedActions(queued);
      
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (goalId: string, title: string, outcome: string, status: 'ACTIVE' | 'BACKLOG') => {
    try {
      setLoading(true);
      const body = { goalId, title, outcome, status };
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const err = await response.json();
        if (response.status === 500 && err.message?.includes('active')) {
          throw new Error('Maximum 3 active projects allowed. Promote a project from backlog first.');
        }
        throw new Error(err.message || 'Failed to create project');
      }
      
      setShowAddProjectModal(false);
      await fetchProjects();
      await fetchDashboard();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (title: string, priority: Priority, active: boolean) => {
    try {
      setLoading(true);
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority, active }),
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create goal');
      }
      
      setShowAddGoalModal(false);
      setGoalForm({ title: '', priority: 'MEDIUM', active: true });
      await fetchGoals();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      setLoading(true);
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/goals/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete goal');
      }
      if (selectedGoalId === id) {
        setSelectedGoalId(null);
        fetchProjects();
      }
      await fetchGoals();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      setLoading(true);
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/projects/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete project');
      }
      await fetchProjects();
      await fetchDashboard();
      await fetchGoals();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAction = async (id: string) => {
    try {
      setLoading(true);
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/actions/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete action');
      }
      if (selectedProjectIdForActions === 'no-project') {
        const allActions = await fetchActions({});
        const noProjectActions = allActions.filter((a: NextAction) => !a.projectId);
        setProjectActions(noProjectActions);
      } else if (selectedProjectIdForActions) {
        const actions = await fetchActions({ projectId: selectedProjectIdForActions });
        setProjectActions(actions);
      }
      const queued = await fetchActions({ status: 'QUEUED' });
      setQueuedActions(queued);
      await fetchDashboard();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (id: string, data: GoalPatchRequest) => {
    try {
      setLoading(true);
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update goal');
      }
      
      await fetchGoals();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, data: ProjectPatchRequest) => {
    try {
      setLoading(true);
      const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const err = await response.json();
        if (response.status === 500 && err.message?.includes('active')) {
          throw new Error('Maximum 3 active projects allowed. Demote or complete an existing active project first.');
        }
        throw new Error(err.message || 'Failed to update project');
      }
      
      await fetchProjects();
      await fetchDashboard();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
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
    showConfetti, setShowConfetti,
    showNewModal, setShowNewModal,
    draggedAction, setDraggedAction,
    refreshKey, setRefreshKey,
    mobileMenuOpen, setMobileMenuOpen,
    
    // Actions
    fetchGoals, fetchActions, fetchDashboard, fetchProjects,
    completeAction, handleQuickCapture, promoteProject,
    createAction, updateAction, deleteAction,
    createProject, updateProject, deleteProject,
    createGoal, updateGoal, deleteGoal
  };
};