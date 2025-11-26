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
  description?: string | undefined;
  status?: IssueStatus | undefined;
  progress?: number | undefined;
}

export interface UpdateIssueDTO {
  title?: string | undefined;
  description?: string | undefined;
  status?: IssueStatus | undefined;
  progress?: number | undefined;
}

export interface IssueFilters {
  status?: IssueStatus | undefined;
  search?: string | undefined;
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
  error?: string;
}
