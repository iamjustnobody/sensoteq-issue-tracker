import api from "../lib/axios";
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  AnalyticsData,
  ApiResponse,
} from "../types";

// ============================================
// ISSUE API METHODS
// ============================================

export const issueApi = {
  // Get all issues with optional filters
  getAll: async (filters?: IssueFilters): Promise<Issue[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);

    const { data } = await api.get<ApiResponse<Issue[]>>(
      `/issues?${params.toString()}`
    );
    return data.data;
  },

  // Get single issue by ID
  getById: async (id: number): Promise<Issue> => {
    const { data } = await api.get<ApiResponse<Issue>>(`/issues/${id}`);
    return data.data;
  },

  // Create new issue
  create: async (issue: CreateIssueDTO): Promise<Issue> => {
    const { data } = await api.post<ApiResponse<Issue>>("/issues", issue);
    return data.data;
  },

  // Update issue
  update: async (id: number, issue: UpdateIssueDTO): Promise<Issue> => {
    const { data } = await api.put<ApiResponse<Issue>>(`/issues/${id}`, issue);
    return data.data;
  },

  // Delete issue
  delete: async (id: number): Promise<void> => {
    await api.delete(`/issues/${id}`);
  },
};

// ============================================
// ANALYTICS API METHODS
// ============================================

export const analyticsApi = {
  // Get analytics data
  getData: async (): Promise<AnalyticsData> => {
    const { data } = await api.get<ApiResponse<AnalyticsData>>(
      "/issues/analytics"
    );
    return data.data;
  },
};
