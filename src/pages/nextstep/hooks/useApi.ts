import { useCallback } from 'react';
import { NEXTSTEP_ENDPOINT, nextstepFetch } from '../../../config';
import { Goal, Project, NextAction, DashboardData, GoalPatchRequest } from '../types';

export const useFetchGoals = (setGoals: (goals: Goal[]) => void) => {
  return useCallback(async () => {
    const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/goals`);
    if (!response.ok) throw new Error('Failed to fetch goals');
    const data: Goal[] = await response.json();
    setGoals(data);
    return data;
  }, [setGoals]);
};

export const useFetchActions = () => {
  return useCallback(async (filters?: { status?: string; projectId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.projectId) params.append('projectId', filters.projectId);
    const queryString = params.toString();
    const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/actions${queryString ? `?${queryString}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch actions');
    const data: NextAction[] = await response.json();
    return data;
  }, []);
};

export const useFetchDashboard = (setDashboardData: (data: DashboardData | null) => void, setActiveProjectCount: (count: number) => void) => {
  return useCallback(async () => {
    const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard');
    const data: DashboardData = await response.json();
    setDashboardData(data);
    const activeCount = data.projectSummaries?.filter(p => p.project.status === 'ACTIVE').length || 0;
    setActiveProjectCount(activeCount);
  }, [setDashboardData, setActiveProjectCount]);
};

export const useFetchProjects = (setProjects: (projects: Project[]) => void, setActiveProjectCount: (count: number) => void) => {
  return useCallback(async (goalId?: string) => {
    const params = goalId ? `?goalId=${goalId}` : '';
    const response = await nextstepFetch(`${NEXTSTEP_ENDPOINT}/projects${params}`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    const data: Project[] = await response.json();
    setProjects(data);
    setActiveProjectCount(data.filter(p => p.status === 'ACTIVE').length);
    return data;
  }, [setProjects, setActiveProjectCount]);
};

export const useCompleteAction = (fetchDashboard: () => Promise<void>) => {
  return useCallback(async (actionId: string) => {
    await nextstepFetch(`${NEXTSTEP_ENDPOINT}/actions/${actionId}/complete`, { method: 'POST' });
    await fetchDashboard();
  }, [fetchDashboard]);
};

export const useDeleteAction = (
  fetchActions: () => Promise<NextAction[]>,
  setProjectActions: (actions: NextAction[]) => void
) => {
  return useCallback(async (id: string) => {
    await nextstepFetch(`${NEXTSTEP_ENDPOINT}/actions/${id}`, { method: 'DELETE' });
    const actions = await fetchActions();
    setProjectActions(actions);
  }, [fetchActions, setProjectActions]);
};

export const useDeleteProject = (
  fetchProjects: () => Promise<void>,
  fetchDashboard: () => Promise<void>,
  fetchGoals: () => Promise<void>
) => {
  return useCallback(async (id: string) => {
    await nextstepFetch(`${NEXTSTEP_ENDPOINT}/projects/${id}`, { method: 'DELETE' });
    await fetchProjects();
    await fetchDashboard();
    await fetchGoals();
  }, [fetchProjects, fetchDashboard, fetchGoals]);
};

export const usePromoteProject = (fetchProjects: () => Promise<void>, fetchDashboard: () => Promise<void>) => {
  return useCallback(async (projectId: string) => {
    await nextstepFetch(`${NEXTSTEP_ENDPOINT}/projects/${projectId}/promote`, { method: 'POST' });
    await fetchDashboard();
    await fetchProjects();
  }, [fetchProjects, fetchDashboard]);
};

export const useUpdateGoal = (fetchGoals: () => Promise<void>) => {
  return useCallback(async (id: string, data: GoalPatchRequest) => {
    await nextstepFetch(`${NEXTSTEP_ENDPOINT}/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchGoals();
  }, [fetchGoals]);
};

export const useDeleteGoal = (fetchGoals: () => Promise<void>) => {
  return useCallback(async (id: string) => {
    await nextstepFetch(`${NEXTSTEP_ENDPOINT}/goals/${id}`, { method: 'DELETE' });
    await fetchGoals();
  }, [fetchGoals]);
};