import React, { useState, useEffect, useCallback } from 'react';
import { NEXTSTEP_ENDPOINT } from '../../config';
import { Goal, Priority, ProjectStatus, Project, NextAction, ActionContext, ActionStatus, DashboardData, WeeklyReviewData, ActionCreateRequest, ActionPatchRequest, GoalPatchRequest, ProjectPatchRequest } from '../../types/nextstep';

type View = 'execution' | 'weeklyReview' | 'goals' | 'projects' | 'archive';

const contextLabels: Record<ActionContext, string> = {
  DEEP_WORK: 'Deep Work',
  QUICK: 'Quick',
  PHONE: 'Phone',
  ERRANDS: 'Errands',
};

const contextColors: Record<ActionContext, string> = {
  DEEP_WORK: 'bg-[#0051d5] text-white',
  QUICK: 'bg-[#e2e7ff] text-[#4d556a]',
  PHONE: 'bg-[#e2e7ff] text-[#4d556a]',
  ERRANDS: 'bg-[#e2e7ff] text-[#4d556a]',
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  } catch {
    return dateString;
  }
};

const NextStepPage: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('execution');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [_weeklyReview, setWeeklyReview] = useState<WeeklyReviewData | null>(null);
  const [quickInput, setQuickInput] = useState('');
  const [activeProjectCount, setActiveProjectCount] = useState(0);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ goalId: '', title: '', outcome: '', status: 'BACKLOG' as 'ACTIVE' | 'BACKLOG' });
  const [actionForm, setActionForm] = useState({ description: '', context: 'QUICK' as ActionContext, energy: 'LOW' as 'HIGH' | 'LOW', status: 'QUEUED' as ActionStatus });
  const [editingAction, setEditingAction] = useState<NextAction | null>(null);
  const [editActionForm, setEditActionForm] = useState({ description: '', context: 'QUICK' as ActionContext, energy: 'LOW' as 'HIGH' | 'LOW', status: 'QUEUED' as ActionStatus });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', priority: 'MEDIUM' as Priority, active: true });
  const [queuedActions, setQueuedActions] = useState<NextAction[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedProjectIdForActions, setSelectedProjectIdForActions] = useState<string | null>(null);
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Confetti component
  const Confetti = () => {
    const particles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: ['#0051d5', '#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'][Math.floor(Math.random() * 6)],
    }));

    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              left: `${p.x}%`,
              top: '-20px',
              backgroundColor: p.color,
              animation: `confetti-fall ${p.duration}s ease-out ${p.delay}s forwards`,
            }}
          />
        ))}
        <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </div>
    );
  };

  // Fetch goals
  const fetchGoals = useCallback(async () => {
    try {
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/goals`);
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
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/actions${queryString ? `?${queryString}` : ''}`);
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
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      const data: DashboardData = await response.json();
      setDashboardData(data);
      
      // Count active projects
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
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/projects${params}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data: Project[] = await response.json();
      setProjects(data);
      setActiveProjectCount(data.filter(p => p.status === 'ACTIVE').length);
    } catch (e) {
      console.error('Projects fetch error:', e);
    }
  }, []);

  // Fetch weekly review
  const fetchWeeklyReview = useCallback(async () => {
    try {
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/weekly-review`);
      if (!response.ok) throw new Error('Failed to fetch weekly review');
      const data: WeeklyReviewData = await response.json();
      setWeeklyReview(data);
    } catch (e) {
      console.error('Weekly review fetch error:', e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboard();
    fetchProjects();
    fetchGoals();
    fetchActions({ status: 'QUEUED' }).then(setQueuedActions);
  }, [fetchDashboard, fetchProjects, fetchGoals, fetchActions]);

  // Toggle action completion
  const completeAction = async (actionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/actions/${actionId}/complete`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to complete action');
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 10000);
      
      // Refresh data after completion
      await fetchDashboard();
      if (activeView === 'weeklyReview') {
        await fetchWeeklyReview();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick capture
  const handleQuickCapture = async () => {
    if (!quickInput.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quickInput }),
      });
      if (!response.ok) throw new Error('Failed to capture');
      
      setQuickInput('');
      await fetchDashboard();
      await fetchProjects();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Promote project (BACKLOG -> ACTIVE)
  const promoteProject = async (projectId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/projects/${projectId}/promote`, {
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

  // Create action
  const createAction = async (data: ActionCreateRequest) => {
    try {
      setLoading(true);
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/actions`, {
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Update action
  const updateAction = async (id: string, data: ActionPatchRequest) => {
    try {
      setLoading(true);
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/actions/${id}`, {
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
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Create project
  const createProject = async (goalId: string, title: string, outcome: string, status: 'ACTIVE' | 'BACKLOG') => {
    try {
      setLoading(true);
      const body: Record<string, string> = { goalId, title, outcome, status };
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/projects`, {
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

  // Create goal
  const createGoal = async (title: string, priority: Priority, active: boolean) => {
    try {
      setLoading(true);
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/goals`, {
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

  // Delete goal (cascading)
  const deleteGoal = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/goals/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete goal');
      }
      // If viewing this goal's projects, clear filter
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

  // Delete project (cascading)
  const deleteProject = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/projects/${id}`, { method: 'DELETE' });
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

  // Delete action
  const deleteAction = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/actions/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete action');
      }
      if (selectedProjectIdForActions) {
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

  // Update goal
  const updateGoal = async (id: string, data: GoalPatchRequest) => {
    try {
      setLoading(true);
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/goals/${id}`, {
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

  // Update project
  const updateProject = async (id: string, data: ProjectPatchRequest) => {
    try {
      setLoading(true);
      const response = await fetch(`${NEXTSTEP_ENDPOINT}/projects/${id}`, {
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

  // Load weekly review when view changes
  useEffect(() => {
    if (activeView === 'weeklyReview') {
      fetchWeeklyReview();
    }
  }, [activeView, fetchWeeklyReview]);

  const getContextBadge = (context: ActionContext) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight uppercase ${contextColors[context]}`}>
      {contextLabels[context]}
    </span>
  );

  const renderSidebar = () => (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - fixed on desktop, slide-out on mobile */}
      <aside className={`
        fixed top-0 h-screen bg-[#f2f3ff] border-r border-[#c3c6d7] z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        w-64 left-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tighter">NextStep</h1>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="text-sm font-medium tracking-tight uppercase text-[#4d556a]/60 mt-1 hidden sm:block">Deep Work Mode</p>
        </div>
        
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          <button 
            onClick={() => { setActiveView('execution'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium tracking-tight uppercase text-sm transition-all ${activeView === 'execution' ? 'text-[#0051d5] border-l-4 border-[#0051d5] bg-white' : 'text-[#434655] hover:bg-[#dae2fd]'}`}
          >
            <span className="material-symbols-outlined text-lg">bolt</span>
            <span className="hidden sm:inline">Execution</span>
          </button>
          <button 
            onClick={() => { setActiveView('weeklyReview'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium tracking-tight uppercase text-sm transition-all ${activeView === 'weeklyReview' ? 'text-[#0051d5] border-l-4 border-[#0051d5] bg-white' : 'text-[#434655] hover:bg-[#dae2fd]'}`}
          >
            <span className="material-symbols-outlined text-lg">calendar_view_week</span>
            <span className="hidden sm:inline">Weekly Review</span>
          </button>
          <button 
            onClick={() => { setActiveView('projects'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium tracking-tight uppercase text-sm transition-all ${activeView === 'projects' ? 'text-[#0051d5] border-l-4 border-[#0051d5] bg-white' : 'text-[#434655] hover:bg-[#dae2fd]'}`}
          >
            <span className="material-symbols-outlined text-lg">account_tree</span>
            <span className="hidden sm:inline">Projects</span>
          </button>
          <button 
            onClick={() => { setActiveView('goals'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium tracking-tight uppercase text-sm transition-all ${activeView === 'goals' ? 'text-[#0051d5] border-l-4 border-[#0051d5] bg-white' : 'text-[#434655] hover:bg-[#dae2fd]'}`}
          >
            <span className="material-symbols-outlined text-lg">flag</span>
            <span className="hidden sm:inline">Goals</span>
          </button>
          <button 
            onClick={() => { setActiveView('archive'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium tracking-tight uppercase text-sm transition-all ${activeView === 'archive' ? 'text-[#0051d5] border-l-4 border-[#0051d5] bg-white' : 'text-[#434655] hover:bg-[#dae2fd]'}`}
          >
            <span className="material-symbols-outlined text-lg">inventory_2</span>
            <span className="hidden sm:inline">Archive</span>
          </button>
        </nav>

        <div className="px-4 py-6 border-t border-[#c3c6d7]/10">
          <button 
            onClick={() => { setShowNewModal(true); setMobileMenuOpen(false); }}
            className="w-full py-3 bg-[#0051d5] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span className="hidden sm:inline">New</span>
          </button>
        </div>

        <div className="px-2 pb-8">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-[#434655] hover:bg-[#dae2fd] transition-colors font-medium tracking-tight uppercase text-sm">
            <span className="material-symbols-outlined text-lg">settings</span>
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </aside>
    </>
  );

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-[#faf8ff] z-40 flex justify-between items-center px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-2"
        >
          <span className="material-symbols-outlined text-[#4d556a]">menu</span>
        </button>
        <h2 className="text-lg lg:text-xl font-bold text-[#131b2e] capitalize">{activeView.replace(/([A-Z])/g, ' $1').trim()}</h2>
      </div>
      <div className="flex items-center gap-2 lg:gap-6">
        <div className="relative hidden sm:flex items-center bg-[#f2f3ff] px-4 py-2 rounded-xl">
          <span className="material-symbols-outlined text-[#737686]">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-32 lg:w-64 ml-2" 
            placeholder="Search..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-1 lg:gap-3">
          <span className="material-symbols-outlined text-[#4d556a] cursor-pointer hover:text-[#0051d5] p-2">add_circle</span>
          <span className="material-symbols-outlined text-[#4d556a] cursor-pointer hover:text-[#0051d5] p-2 hidden sm:inline">notifications</span>
          <div className="w-8 h-8 rounded-full bg-[#dae2fd] overflow-hidden ml-1">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZWAiJsPgH1QjIu-6IoZB38y7x32EPdJadYUSj0zsedJ6pHXXD1nUVZlc8wrHfenGWTOc_j2Z5D-zEN1E2PdcKfsRXUV-LuIUZfrGn2EAs-xeEfFa7Urfz1x_LYpLkfSls1Pg2KtC0WeSSEk_TNZQN19AtqUXG1x-Mw2tfCwW73FtcwSbbO5SL_iv9hRAttel2VcQd31utQZm7PCzqW8SZVdoqCWmKa6C2SyGAvF_-h8BDE4Fx7Q4aZkoSLN7hzPPxPY-QKYzQqJ9m" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );

  const renderExecutionView = () => {
    const allActions: NextAction[] = dashboardData?.nextActions || [];
    const currentActions = allActions.filter(a => a.status === 'CURRENT');

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
                <button 
                  onClick={() => setActionFilter('ALL')}
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight uppercase transition-colors ${actionFilter === 'ALL' ? 'bg-[#0051d5] text-white' : 'bg-[#e2e7ff] text-[#4d556a] hover:bg-[#0051d5] hover:text-white'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActionFilter('DEEP_WORK')}
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight uppercase transition-colors ${actionFilter === 'DEEP_WORK' ? 'bg-[#0051d5] text-white' : 'bg-[#e2e7ff] text-[#4d556a] hover:bg-[#0051d5] hover:text-white'}`}
                >
                  Deep Work
                </button>
                <button 
                  onClick={() => setActionFilter('QUICK')}
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight uppercase transition-colors ${actionFilter === 'QUICK' ? 'bg-[#0051d5] text-white' : 'bg-[#e2e7ff] text-[#4d556a] hover:bg-[#0051d5] hover:text-white'}`}
                >
                  Quick
                </button>
              </div>
            </div>

              <div className="space-y-4">
                {(actionFilter === 'ALL' ? currentActions : currentActions.filter(a => a.context === actionFilter)).length === 0 ? (
                  <div className="p-5 bg-white rounded-xl text-[#434655]">
                    No current actions. Add tasks via quick capture or check your backlog.
                  </div>
                ) : (
                  (actionFilter === 'ALL' ? currentActions : currentActions.filter(a => a.context === actionFilter)).map(action => (
                    <div 
                      key={action.id}
                      className="group flex items-center gap-4 p-5 bg-white rounded-xl hover:bg-white transition-all border-l-4 border-[#0051d5]"
                    >
                      <button 
                        onClick={() => completeAction(action.id)}
                        className="px-3 py-1.5 bg-[#0051d5] text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:opacity-90"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Done
                      </button>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#131b2e]">{action.description}</h3>
                        <p className="text-sm text-[#434655]">{projects.find(p => p.id === action.projectId)?.title || action.projectId}</p>
                      </div>
                      {getContextBadge(action.context)}
                      <button 
                        onClick={() => {
                          setEditingAction(action);
                          setEditActionForm({
                            description: action.description,
                            context: action.context,
                            energy: action.energy,
                            status: action.status,
                          });
                        }}
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
                      <p className="text-[10px] text-[#434655] uppercase">{contextLabels[action.context]}</p>
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

  const renderWeeklyReviewView = () => {
    const backlogProjects = projects.filter(p => p.status === 'BACKLOG');
    
    return (
      <main className="pt-20 p-4 lg:p-12 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-2">Weekly Review</h2>
              <p className="text-[#434655] font-medium">Step 2 of 4: Backlog Audit</p>
            </div>
            <div className="flex gap-2">
              <div className="h-1.5 w-12 rounded-full bg-[#0051d5]"></div>
              <div className="h-1.5 w-12 rounded-full bg-[#0051d5]"></div>
              <div className="h-1.5 w-12 rounded-full bg-[#e2e7ff]"></div>
              <div className="h-1.5 w-12 rounded-full bg-[#e2e7ff]"></div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 bg-[#f2f3ff] rounded-xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-[#4d556a] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0051d5]">delete_sweep</span>
                  Backlog Cleanup
                </h3>
                <p className="text-[#434655] mb-8 max-w-[90vw] lg:max-w-lg">Be ruthless. If it hasn't been touched in two weeks, archive it or promote it to ACTIVE.</p>
                
                {backlogProjects.length === 0 ? (
                  <p className="text-[#434655]">No backlog projects. Great job!</p>
                ) : (
                  <div className="space-y-4">
                    {backlogProjects.map(project => (
                      <div 
                        key={project.id}
                        className="flex items-center justify-between p-4 bg-white rounded-xl group hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-6 h-6 rounded-full border-2 border-[#c3c6d7] flex items-center justify-center hover:border-[#0051d5] cursor-pointer"
                            onClick={() => promoteProject(project.id)}
                          ></div>
                          <div>
                            <p className="font-semibold text-[#131b2e]">{project.title}</p>
                            <p className="text-xs text-[#737686] uppercase tracking-widest font-bold mt-0.5">Backlog</p>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {activeProjectCount < 3 ? (
                            <button 
                              onClick={() => promoteProject(project.id)}
                              className="p-2 text-[#434655] hover:text-[#0051d5]"
                            >
                              <span className="material-symbols-outlined">upload</span>
                            </button>
                          ) : (
                            <span className="text-xs text-[#737686] px-2 py-1" title="Max 3 active projects">Max reached</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#0051d5]/5 rounded-full blur-3xl"></div>
            </div>

            <div className="col-span-4 space-y-6">
              <div className="bg-[#e2e7ff] rounded-xl p-6">
                <h4 className="text-sm font-bold text-[#4d556a] uppercase tracking-widest mb-4">Review Insight</h4>
                <p className="text-sm text-[#434655] leading-relaxed italic">"Your backlog is a list of things you aren't doing. If it's not a 'hell yes', it's a 'no' for this week."</p>
                <div className="mt-6 pt-6 border-t border-[#c3c6d7]/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#4d556a] uppercase">Active Projects</span>
                    <span className="text-xs font-bold text-[#0051d5]">{activeProjectCount}/3</span>
                  </div>
                  <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-[#0051d5] transition-all" style={{ width: `${(activeProjectCount / 3) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 flex justify-between items-center mt-4">
              <button className="px-6 py-3 text-[#0051d5] font-bold flex items-center gap-2 hover:bg-[#e2e7ff] rounded-xl transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
                Previous Step
              </button>
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-[#dae2fd] text-[#131b2e] font-bold rounded-xl hover:opacity-90">
                  Save for Later
                </button>
                <button className="px-10 py-3 bg-gradient-to-r from-[#0051d5] to-[#316bf3] text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#0051d5]/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Next: Prioritize
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  };

  const renderProjectsView = () => {
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
                    onClick={() => {
                      setSelectedGoalId(null);
                      fetchProjects();
                    }}
                    className="ml-2 text-[#737686] hover:text-[#131b2e]"
                  >
                    (clear)
                  </button>
                </p>
              )}
            </div>
            <button 
              onClick={() => setShowAddProjectModal(true)}
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
                  onClick={() => {
                    setSelectedGoalId(goal.id);
                    fetchProjects(goal.id);
                  }}
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
                  onClick={() => {
                    setSelectedProjectIdForActions(project.id);
                    fetchActions({ projectId: project.id }).then(setProjectActions);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-[#0051d5]/10 text-[#0051d5] rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined">rocket_launch</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                          setEditProjectForm({ goalId: project.goalId, title: project.title, outcome: project.outcome, status: project.status });
                        }}
                        className="text-[#737686] hover:text-[#0051d5]"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ type: 'project', id: project.id, name: project.title });
                        }}
                        className="text-[#737686] hover:text-red-500"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectId(project.id);
                          setShowAddActionModal(true);
                        }}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-[#e2e7ff] text-[#4d556a] hover:bg-[#0051d5] hover:text-white transition-colors"
                      >
                        + Action
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
                <div key={project.id} className="bg-[#f2f3ff] p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-[#c3c6d7]/30 text-[#737686] rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setShowAddActionModal(true);
                        }}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4d556a] hover:bg-[#0051d5] hover:text-white transition-colors"
                      >
                        + Action
                      </button>
                      <button 
                        onClick={() => promoteProject(project.id)}
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

  const renderArchiveView = () => (
    <main className="mt-16 p-4 lg:p-10 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-6 lg:mb-8">Archive</h2>
        <p className="text-[#434655]">Completed or archived projects will appear here.</p>
      </div>
    </main>
  );

  const renderFloatingInput = () => (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
      <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20">
        <div className="flex-1 flex items-center gap-3 px-4 py-2">
          <span className="material-symbols-outlined text-[#0051d5]">chat_bubble</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-[#131b2e] w-full font-medium" 
            placeholder="Add a task, idea, or reference..." 
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuickCapture()}
          />
        </div>
        <div className="flex items-center gap-2 p-1">
          <button className="p-2 text-[#737686] hover:text-[#4d556a] transition-colors">
            <span className="material-symbols-outlined">calendar_month</span>
          </button>
          <button className="p-2 text-[#737686] hover:text-[#4d556a] transition-colors">
            <span className="material-symbols-outlined">tag</span>
          </button>
          <button 
            onClick={handleQuickCapture}
            disabled={loading || !quickInput.trim()}
            className="bg-[#0051d5] text-white w-10 h-10 rounded-xl flex items-center justify-center hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined">north</span>
          </button>
        </div>
      </div>
    </div>
  );

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

  const renderAddActionModal = () => {
    if (!showAddActionModal) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProjectId || !actionForm.description.trim()) return;
      createAction({
        projectId: selectedProjectId,
        description: actionForm.description.trim(),
        context: actionForm.context,
        energy: actionForm.energy,
        status: actionForm.status,
      });
      setActionForm({ description: '', context: 'QUICK', energy: 'LOW', status: 'QUEUED' });
      setShowAddActionModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddActionModal(false)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#131b2e]">Add Action</h3>
            <button onClick={() => setShowAddActionModal(false)} className="text-[#737686] hover:text-[#131b2e]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#4d556a] mb-2">Project</label>
              <select
                value={selectedProjectId || ''}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
              >
                <option value="">Select a project...</option>
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
                onChange={e => setActionForm({ ...actionForm, description: e.target.value })}
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
                  onChange={e => setActionForm({ ...actionForm, context: e.target.value as ActionContext })}
                  className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
                >
                  <option value="DEEP_WORK">Deep Work</option>
                  <option value="QUICK">Quick</option>
                  <option value="ERRANDS">Errands</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#4d556a] mb-2">Energy</label>
                <select
                  value={actionForm.energy}
                  onChange={e => setActionForm({ ...actionForm, energy: e.target.value as 'HIGH' | 'LOW' })}
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
                onChange={e => setActionForm({ ...actionForm, status: e.target.value as 'CURRENT' | 'QUEUED' })}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
              >
                <option value="QUEUED">Queued</option>
                <option value="CURRENT">Current (only 1 allowed per project)</option>
              </select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddActionModal(false)}
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

  const renderAddProjectModal = () => {
    if (!showAddProjectModal) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!projectForm.title.trim() || !projectForm.goalId) return;
      createProject(projectForm.goalId, projectForm.title.trim(), projectForm.outcome.trim(), projectForm.status);
      setProjectForm({ goalId: '', title: '', outcome: '', status: 'BACKLOG' });
      setShowAddProjectModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddProjectModal(false)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#131b2e]">Add Project</h3>
            <button onClick={() => setShowAddProjectModal(false)} className="text-[#737686] hover:text-[#131b2e]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#4d556a] mb-2">Goal</label>
              <select
                value={projectForm.goalId}
                onChange={e => setProjectForm({ ...projectForm, goalId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
              >
                <option value="">Select a goal...</option>
                {goals.filter(g => g.active).map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
              {goals.filter(g => g.active).length === 0 && (
                <p className="text-xs text-[#737686] mt-1">No active goals. Create one first.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#4d556a] mb-2">Title</label>
              <input
                type="text"
                value={projectForm.title}
                onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
                placeholder="What do you want to accomplish?"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#4d556a] mb-2">Outcome</label>
              <textarea
                value={projectForm.outcome}
                onChange={e => setProjectForm({ ...projectForm, outcome: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0 resize-none"
                placeholder="What does success look like?"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#4d556a] mb-2">Status</label>
              <select
                value={projectForm.status}
                onChange={e => setProjectForm({ ...projectForm, status: e.target.value as 'ACTIVE' | 'BACKLOG' })}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
                disabled={activeProjectCount >= 3}
              >
                <option value="BACKLOG">Backlog</option>
                <option value="ACTIVE" disabled={activeProjectCount >= 3}>Active ({projects.filter(p => p.status === 'ACTIVE').length}/3)</option>
              </select>
              {activeProjectCount >= 3 && (
                <p className="text-xs text-[#737686] mt-1">Max 3 active projects reached</p>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="flex-1 py-3 bg-[#e2e7ff] text-[#4d556a] font-bold rounded-xl hover:opacity-90"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !projectForm.title.trim()}
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

  const renderGoalsView = () => {
    const activeGoals = goals.filter(g => g.active);
    const inactiveGoals = goals.filter(g => !g.active);

    return (
      <main className="mt-16 p-4 lg:p-10 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Goals</h2>
            <button 
              onClick={() => setShowAddGoalModal(true)}
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
                  onClick={() => {
                    setSelectedGoalId(goal.id);
                    fetchProjects(goal.id);
                    setActiveView('projects');
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-[#0051d5]/10 text-[#0051d5] rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined">flag</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingGoal(goal);
                          setEditGoalForm({ title: goal.title, priority: goal.priority, active: goal.active });
                        }}
                        className="text-[#737686] hover:text-[#0051d5]"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ type: 'goal', id: goal.id, name: goal.title })}
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

  const renderAddGoalModal = () => {
    if (!showAddGoalModal) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!goalForm.title.trim()) return;
      createGoal(goalForm.title.trim(), goalForm.priority, goalForm.active);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddGoalModal(false)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#131b2e]">Add Goal</h3>
            <button onClick={() => setShowAddGoalModal(false)} className="text-[#737686] hover:text-[#131b2e]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#4d556a] mb-2">Title</label>
              <input
                type="text"
                value={goalForm.title}
                onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
                placeholder="What do you want to achieve?"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#4d556a] mb-2">Priority</label>
              <select
                value={goalForm.priority}
                onChange={e => setGoalForm({ ...goalForm, priority: e.target.value as Priority })}
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
                id="goalActive"
                checked={goalForm.active}
                onChange={e => setGoalForm({ ...goalForm, active: e.target.checked })}
                className="w-5 h-5 rounded border-[#c3c6d7] text-[#0051d5] focus:ring-[#0051d5]"
              />
              <label htmlFor="goalActive" className="text-sm font-bold text-[#4d556a]">Active Goal</label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddGoalModal(false)}
                className="flex-1 py-3 bg-[#e2e7ff] text-[#4d556a] font-bold rounded-xl hover:opacity-90"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !goalForm.title.trim()}
                className="flex-1 py-3 bg-[#0051d5] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                Add Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderProjectActionsModal = () => {
    const currentActions = projectActions.filter(a => a.status === 'CURRENT');
    const queuedActions = projectActions.filter(a => a.status === 'QUEUED').sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    const doneActions = projectActions.filter(a => a.status === 'DONE');
    const project = projects.find(p => p.id === selectedProjectIdForActions);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedProjectIdForActions(null)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] lg:max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#131b2e]">{project?.title || 'Project'}</h3>
              <p className="text-sm text-[#434655]">{project?.outcome || 'No outcome set'}</p>
              {project?.updatedAt && (
                <p className="text-xs text-[#737686] mt-1">Updated: {formatDate(project.updatedAt)}</p>
              )}
            </div>
            <button onClick={() => setSelectedProjectIdForActions(null)} className="text-[#737686] hover:text-[#131b2e]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-6">
            {currentActions.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-[#0051d5] uppercase tracking-widest mb-3">Current</h4>
                <div className="space-y-2">
                  {currentActions.map(action => (
                    <div key={action.id} className="flex items-center gap-3 p-3 bg-[#0051d5]/10 rounded-lg border-l-4 border-[#0051d5]">
                      <button 
                        onClick={() => completeAction(action.id)}
                        className="px-3 py-1.5 bg-[#0051d5] text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:opacity-90"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Done
                      </button>
                      <div className="flex-1">
                        <span className="text-[#131b2e]">{action.description}</span>
                        {action.updatedAt && <span className="block text-[10px] text-[#737686]">{formatDate(action.updatedAt)}</span>}
                      </div>
                      <button 
                        onClick={() => {
                          setEditingAction(action);
                          setEditActionForm({
                            description: action.description,
                            context: action.context,
                            energy: action.energy,
                            status: action.status,
                          });
                        }}
                        className="text-[#737686] hover:text-[#0051d5]"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ type: 'action', id: action.id, name: action.description })}
                        className="text-[#737686] hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {queuedActions.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-[#4d556a] uppercase tracking-widest mb-3">Queued (drag to reorder)</h4>
                <div className="space-y-2">
                  {queuedActions.map((action) => (
                    <div 
                      key={action.id} 
                      draggable
                      onDragStart={() => setDraggedAction(action.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault();
                        if (draggedAction && draggedAction !== action.id) {
                          const targetCreatedAt = action.createdAt ? new Date(action.createdAt).getTime() : Date.now();
                          const newCreatedAt = new Date(targetCreatedAt + 1000).toISOString();
                          const projectId = selectedProjectIdForActions;
                          await updateAction(draggedAction, { createdAt: newCreatedAt } as any);
                          await fetchDashboard();
                          const queued = await fetchActions({ status: 'QUEUED' });
                          setQueuedActions([...queued]);
                          if (projectId) {
                            setSelectedProjectIdForActions(null);
                            const newActions = await fetchActions({ projectId });
                            setProjectActions(newActions);
                            setSelectedProjectIdForActions(projectId);
                          }
                        }
                        setDraggedAction(null);
                      }}
                      className={`flex items-center gap-3 p-3 bg-[#f2f3ff] rounded-lg cursor-move ${draggedAction === action.id ? 'opacity-50' : ''}`}
                    >
                      <span className="material-symbols-outlined text-[#c3c6d7] text-sm">drag_indicator</span>
                      <div className="flex-1">
                        <span className="text-[#131b2e]">{action.description}</span>
                        <span className="block text-[10px] text-[#737686]">{action.updatedAt ? formatDate(action.updatedAt) : action.context}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingAction(action);
                          setEditActionForm({
                            description: action.description,
                            context: action.context,
                            energy: action.energy,
                            status: action.status,
                          });
                        }}
                        className="text-[#737686] hover:text-[#0051d5]"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ type: 'action', id: action.id, name: action.description })}
                        className="text-[#737686] hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doneActions.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-[#737686] uppercase tracking-widest mb-3">Completed</h4>
                <div className="space-y-2">
                  {doneActions.map(action => (
                    <div key={action.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                      <span className="material-symbols-outlined text-[#737686] text-sm">check_circle</span>
                      <span className="flex-1 text-[#737686] line-through">{action.description}</span>
                      <button 
                        onClick={() => {
                          setEditingAction(action);
                          setEditActionForm({
                            description: action.description,
                            context: action.context,
                            energy: action.energy,
                            status: action.status,
                          });
                        }}
                        className="text-[#737686] hover:text-[#0051d5]"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ type: 'action', id: action.id, name: action.description })}
                        className="text-[#737686] hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projectActions.length === 0 && (
              <p className="text-center text-[#434655] py-4">No actions yet. Add one!</p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#c3c6d7]">
            <button 
              onClick={() => {
                setSelectedProjectId(selectedProjectIdForActions);
                setShowAddActionModal(true);
              }}
              className="w-full py-3 bg-[#0051d5] text-white font-bold rounded-xl hover:opacity-90"
            >
              + Add Action
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] font-sans">
      {showConfetti && <Confetti />}
      {renderSidebar()}
      {renderHeader()}
      {activeView === 'execution' && renderExecutionView()}
      {activeView === 'weeklyReview' && renderWeeklyReviewView()}
      {activeView === 'goals' && renderGoalsView()}
      {activeView === 'projects' && renderProjectsView()}
      {activeView === 'archive' && renderArchiveView()}
      {renderFloatingInput()}
      {renderAddActionModal()}
      {renderAddProjectModal()}
      {renderAddGoalModal()}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#131b2e]">Create New</h3>
              <button onClick={() => setShowNewModal(false)} className="text-[#737686] hover:text-[#131b2e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setShowAddGoalModal(true);
                }}
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
                onClick={() => {
                  setShowNewModal(false);
                  setShowAddProjectModal(true);
                }}
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
                  onClick={() => {
                    setShowNewModal(false);
                    setSelectedProjectId(projects[0].id);
                    setShowAddActionModal(true);
                  }}
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
      )}
      {selectedProjectIdForActions && renderProjectActionsModal()}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
              <h3 className="text-xl font-bold text-[#131b2e]">Confirm Delete</h3>
            </div>
            <p className="text-[#434655] mb-6">
              {deleteConfirm.type === 'goal' && (
                <>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This will also delete all projects and actions under this goal.</>
              )}
              {deleteConfirm.type === 'project' && (
                <>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This will also delete all actions under this project.</>
              )}
              {deleteConfirm.type === 'action' && (
                <>Are you sure you want to delete this action?</>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-[#e2e7ff] text-[#4d556a] font-bold rounded-xl hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteConfirm.type === 'goal') await deleteGoal(deleteConfirm.id);
                  else if (deleteConfirm.type === 'project') await deleteProject(deleteConfirm.id);
                  else if (deleteConfirm.type === 'action') await deleteAction(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingGoal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#131b2e]">Edit Goal</h3>
              <button onClick={() => setEditingGoal(null)} className="text-[#737686] hover:text-[#131b2e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#4d556a] mb-2">Title</label>
                <input
                  type="text"
                  value={editGoalForm.title}
                  onChange={e => setEditGoalForm({ ...editGoalForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4d556a] mb-2">Priority</label>
                <select
                  value={editGoalForm.priority}
                  onChange={e => setEditGoalForm({ ...editGoalForm, priority: e.target.value as Priority })}
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
                  checked={editGoalForm.active}
                  onChange={e => setEditGoalForm({ ...editGoalForm, active: e.target.checked })}
                  className="w-5 h-5 rounded border-[#c3c6d7] text-[#0051d5] focus:ring-[#0051d5]"
                />
                <label htmlFor="editGoalActive" className="text-sm font-bold text-[#4d556a]">Active Goal</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingGoal(null)}
                  className="flex-1 py-3 bg-[#e2e7ff] text-[#4d556a] font-bold rounded-xl hover:opacity-90"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateGoal(editingGoal.id, { title: editGoalForm.title, priority: editGoalForm.priority, active: editGoalForm.active });
                    setEditingGoal(null);
                  }}
                  disabled={loading || !editGoalForm.title.trim()}
                  className="flex-1 py-3 bg-[#0051d5] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingProject(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#131b2e]">Edit Project</h3>
              <button onClick={() => setEditingProject(null)} className="text-[#737686] hover:text-[#131b2e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#4d556a] mb-2">Goal</label>
                <select
                  value={editProjectForm.goalId}
                  onChange={e => setEditProjectForm({ ...editProjectForm, goalId: e.target.value })}
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
                  value={editProjectForm.title}
                  onChange={e => setEditProjectForm({ ...editProjectForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4d556a] mb-2">Outcome</label>
                <textarea
                  value={editProjectForm.outcome}
                  onChange={e => setEditProjectForm({ ...editProjectForm, outcome: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4d556a] mb-2">Status</label>
                <select
                  value={editProjectForm.status}
                  onChange={e => setEditProjectForm({ ...editProjectForm, status: e.target.value as ProjectStatus })}
                  className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
                  disabled={activeProjectCount >= 3 && editProjectForm.status !== 'ACTIVE'}
                >
                  <option value="BACKLOG">Backlog</option>
                  <option value="ACTIVE" disabled={activeProjectCount >= 3 && editProjectForm.status !== 'ACTIVE'}>Active ({projects.filter(p => p.status === 'ACTIVE').length}/3)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingProject(null)}
                  className="flex-1 py-3 bg-[#e2e7ff] text-[#4d556a] font-bold rounded-xl hover:opacity-90"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateProject(editingProject.id, { goalId: editProjectForm.goalId, title: editProjectForm.title, outcome: editProjectForm.outcome, status: editProjectForm.status });
                    setEditingProject(null);
                  }}
                  disabled={loading || !editProjectForm.title.trim() || !editProjectForm.goalId}
                  className="flex-1 py-3 bg-[#0051d5] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editingAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingAction(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-[90vw] md:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#131b2e]">Edit Action</h3>
              <button onClick={() => setEditingAction(null)} className="text-[#737686] hover:text-[#131b2e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#4d556a] mb-2">Project</label>
                <div className="px-4 py-3 bg-[#f2f3ff] rounded-xl text-[#131b2e] font-medium">
                  {projects.find(p => p.id === editingAction?.projectId)?.title || editingAction?.projectId}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#4d556a] mb-2">Description</label>
                <input
                  type="text"
                  value={editActionForm.description}
                  onChange={e => setEditActionForm({ ...editActionForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#4d556a] mb-2">Context</label>
                  <select
                    value={editActionForm.context}
                    onChange={e => setEditActionForm({ ...editActionForm, context: e.target.value as ActionContext })}
                    className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
                  >
                    <option value="DEEP_WORK">Deep Work</option>
                    <option value="QUICK">Quick</option>
                    <option value="ERRANDS">Errands</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#4d556a] mb-2">Energy</label>
                  <select
                    value={editActionForm.energy}
                    onChange={e => setEditActionForm({ ...editActionForm, energy: e.target.value as 'HIGH' | 'LOW' })}
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
                  value={editActionForm.status}
                  onChange={e => setEditActionForm({ ...editActionForm, status: e.target.value as ActionStatus })}
                  className="w-full px-4 py-3 rounded-xl border border-[#c3c6d7] focus:border-[#0051d5] focus:ring-0"
                >
                  <option value="QUEUED">Queued</option>
                  <option value="CURRENT">Current</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingAction(null)}
                  className="flex-1 py-3 bg-[#e2e7ff] text-[#4d556a] font-bold rounded-xl hover:opacity-90"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateAction(editingAction.id, {
                      description: editActionForm.description,
                      context: editActionForm.context,
                      energy: editActionForm.energy,
                      status: editActionForm.status,
                    });
                    setEditingAction(null);
                  }}
                  disabled={loading || !editActionForm.description.trim()}
                  className="flex-1 py-3 bg-[#0051d5] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextStepPage;