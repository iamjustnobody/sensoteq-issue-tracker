// API base URL
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// API endpoints as constants
export const API_ENDPOINTS = {
  // Issues
  ISSUES: "/issues",
  ISSUE_BY_ID: (id: number) => `/issues/${id}`,
  ISSUES_ANALYTICS: "/issues/analytics",

  // Health
  HEALTH: "/health",
} as const;
