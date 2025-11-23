export type IssueStatus = "not-started" | "in-progress" | "completed";

export interface Issue {
  id: number;
  title: string;
  description: string | null;
  status: IssueStatus;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface CreateIssueDTO {
  title: string;
  description?: string;
  status?: IssueStatus;
  progress?: number;
}

export interface UpdateIssueDTO {
  title?: string;
  description?: string;
  status?: IssueStatus;
  progress?: number;
}

export interface IssueFilters {
  status?: IssueStatus;
  search?: string;
}

export interface AnalyticsData {
  statusDistribution: { status: string; count: number }[];
  averageProgress: number;
  recentActivity: { date: string; count: number }[];
  completionRate: number;
  totalIssues: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}
