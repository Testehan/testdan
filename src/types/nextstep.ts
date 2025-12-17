export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ProjectStatus = 'ACTIVE' | 'BACKLOG' | 'DONE';
export type ActionContext = 'DEEP_WORK' | 'QUICK' | 'PHONE' | 'ERRANDS';
export type ActionEnergy = 'HIGH' | 'LOW';
export type ActionStatus = 'CURRENT' | 'QUEUED' | 'DONE';

export interface Goal {
  id: string;
  title: string;
  priority: Priority;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalCreateRequest {
  title: string;
  priority: Priority;
  active: boolean;
}

export interface Project {
  id: string;
  goalId: string;
  title: string;
  outcome: string;
  status: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface NextAction {
  id: string;
  projectId: string;
  description: string;
  context: ActionContext;
  energy: ActionEnergy;
  status: ActionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardData {
  nextActions: NextAction[];
  projectSummaries: Array<{
    project: Project;
    nextAction: NextAction | null;
  }>;
}

export interface WeeklyReviewData {
  stuckProjects: Project[];
  completedActionsThisWeek: NextAction[];
  backlogProjects: Project[];
}

export interface CaptureRequest {
  text: string;
}

export interface CreateProjectRequest {
  goalId: string;
  title: string;
  outcome: string;
  status: ProjectStatus;
}

export interface ActionCreateRequest {
  projectId: string;
  description: string;
  context?: ActionContext;
  energy?: ActionEnergy;
  status?: ActionStatus;
}

export interface ActionPatchRequest {
  description?: string;
  status?: ActionStatus;
  context?: ActionContext;
  energy?: ActionEnergy;
}

export interface GoalPatchRequest {
  title?: string;
  priority?: Priority;
  active?: boolean;
}

export interface ProjectPatchRequest {
  goalId?: string;
  title?: string;
  outcome?: string;
  status?: ProjectStatus;
}