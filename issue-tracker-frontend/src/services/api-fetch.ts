import { API_BASE_URL, API_ENDPOINTS } from "../config/api";
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  AnalyticsData,
  ApiResponse,
} from "../types";

class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;
  public cause?: Error;
  constructor(
    status: number,
    message: string,
    options?: {
      code?: string;
      details?: unknown;
      cause?: Error;
    }
  ) {
    super(message);
    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = status;
    this.name = "ApiError";

    if (options) {
      this.code = options.code;
      this.details = options.details;
      this.cause = options.cause;
    }
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "An error occurred",
    }));
    throw new ApiError(
      response.status,
      error.error || error.message || "Request failed"
    );
  }

  return response.json();
}

export const issueApi = {
  getAll: async (filters?: IssueFilters): Promise<Issue[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ISSUES}?${queryString}`
      : API_ENDPOINTS.ISSUES;

    const data = await fetchApi<ApiResponse<Issue[]>>(endpoint);
    return data.data;
  },

  getById: async (id: number): Promise<Issue> => {
    const data = await fetchApi<ApiResponse<Issue>>(
      API_ENDPOINTS.ISSUE_BY_ID(id)
    );
    return data.data;
  },

  create: async (issue: CreateIssueDTO): Promise<Issue> => {
    const data = await fetchApi<ApiResponse<Issue>>(API_ENDPOINTS.ISSUES, {
      method: "POST",
      body: JSON.stringify(issue),
    });
    return data.data;
  },

  update: async (id: number, issue: UpdateIssueDTO): Promise<Issue> => {
    const data = await fetchApi<ApiResponse<Issue>>(
      API_ENDPOINTS.ISSUE_BY_ID(id),
      {
        method: "PUT",
        body: JSON.stringify(issue),
      }
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await fetchApi(API_ENDPOINTS.ISSUE_BY_ID(id), {
      method: "DELETE",
    });
  },
};

export const analyticsApi = {
  getData: async (): Promise<AnalyticsData> => {
    const data = await fetchApi<ApiResponse<AnalyticsData>>(
      API_ENDPOINTS.ISSUES_ANALYTICS
    );
    return data.data;
  },
};
