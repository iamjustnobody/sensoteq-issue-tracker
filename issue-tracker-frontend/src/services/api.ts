import { API_ENDPOINTS } from "../config/api.js";
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

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.ISSUES}?${queryString}`
      : API_ENDPOINTS.ISSUES;
    const { data } = await api.get<ApiResponse<Issue[]>>(url);
    return data.data;
  },

  // Get single issue by ID
  getById: async (id: number): Promise<Issue> => {
    const { data } = await api.get<ApiResponse<Issue>>(
      API_ENDPOINTS.ISSUE_BY_ID(id)
    );
    return data.data;
  },

  // Create new issue
  create: async (issue: CreateIssueDTO): Promise<Issue> => {
    const { data } = await api.post<ApiResponse<Issue>>(
      API_ENDPOINTS.ISSUES,
      issue
    );
    return data.data;
  },

  // Update issue
  update: async (id: number, issue: UpdateIssueDTO): Promise<Issue> => {
    const { data } = await api.put<ApiResponse<Issue>>(
      API_ENDPOINTS.ISSUE_BY_ID(id),
      issue
    );
    return data.data;
  },

  // Delete issue
  delete: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ISSUE_BY_ID(id));
  },
};

// ============================================
// ANALYTICS API METHODS
// ============================================

export const analyticsApi = {
  // Get analytics data
  getData: async (): Promise<AnalyticsData> => {
    const { data } = await api.get<ApiResponse<AnalyticsData>>(
      API_ENDPOINTS.ISSUES_ANALYTICS
    );
    return data.data;
  },
};
