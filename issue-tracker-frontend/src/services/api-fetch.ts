import { API_BASE_URL, API_ENDPOINTS } from "../config/api";
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  AnalyticsData,
  ApiResponse,
} from "../types";

/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
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

  /**
   * Check if error is network-related
   */
  isNetworkError(): boolean {
    return this.status === 0 || this.status >= 500;
  }

  /**
   * Check if error is client-related (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if unauthorized
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Check if forbidden
   */
  isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Check if not found
   */
  isNotFound(): boolean {
    return this.status === 404;
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = "Request failed";
      let errorDetails: unknown = undefined;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(response.status, errorMessage, {
        details: errorDetails,
      });
    }

    // Parse and return response
    return response.json();
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError(0, "Network error. Please check your connection.", {
        cause: error as Error,
      });
    }

    // Handle other errors
    throw new ApiError(500, "An unexpected error occurred", {
      cause: error as Error,
    });
  }
}

// ============================================
// ISSUE API
// ============================================

export const issueApi = {
  /**
   * Get all issues with optional filters
   */
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

  /**
   * Get single issue by ID
   */
  getById: async (id: number): Promise<Issue> => {
    const data = await fetchApi<ApiResponse<Issue>>(
      API_ENDPOINTS.ISSUE_BY_ID(id)
    );
    return data.data;
  },

  /**
   * Create new issue
   */
  create: async (issue: CreateIssueDTO): Promise<Issue> => {
    const data = await fetchApi<ApiResponse<Issue>>(API_ENDPOINTS.ISSUES, {
      method: "POST",
      body: JSON.stringify(issue),
    });
    return data.data;
  },

  /**
   * Update existing issue
   */
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

  /**
   * Delete issue
   */
  delete: async (id: number): Promise<void> => {
    await fetchApi(API_ENDPOINTS.ISSUE_BY_ID(id), {
      method: "DELETE",
    });
  },
};

// ============================================
// ANALYTICS API
// ============================================

export const analyticsApi = {
  /**
   * Get analytics data
   */
  getData: async (): Promise<AnalyticsData> => {
    const data = await fetchApi<ApiResponse<AnalyticsData>>(
      API_ENDPOINTS.ISSUES_ANALYTICS
    );
    return data.data;
  },
};
