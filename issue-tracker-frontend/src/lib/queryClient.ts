import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../services/api-fetch";
import toast from "react-hot-toast";

/**
 * Global error handler for React Query
 */
function handleQueryError(error: Error) {
  if (error instanceof ApiError) {
    // Handle specific error types
    if (error.isUnauthorized()) {
      toast.error("Session expired. Please log in again.");
      // Optionally redirect to login
      // window.location.href = '/login';
      return;
    }

    if (error.isForbidden()) {
      toast.error("You do not have permission to perform this action.");
      return;
    }

    if (error.isNotFound()) {
      // Don't show toast for 404s, let components handle it
      return;
    }

    if (error.isNetworkError()) {
      toast.error("Network error. Please check your connection.");
      return;
    }

    // Show generic API error
    toast.error(error.message);
  } else {
    // Unknown error
    console.error("Unexpected error:", error);
    toast.error("An unexpected error occurred");
  }
}

/**
 * Create and configure React Query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query options
      staleTime: 30 * 1000, // Data is fresh for 30 seconds
      gcTime: 5 * 60 * 1000, // Cache for 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when reconnecting
      retry: (failureCount, error) => {
        // Don't retry on client errors (4xx)
        if (error instanceof ApiError && error.isClientError()) {
          return false;
        }
        // Retry network errors up to 2 times
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Global mutation options
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        if (error instanceof ApiError && error.isClientError()) {
          return false;
        }
        // Retry once for network errors
        return failureCount < 1;
      },
      // Global error handler for mutations
      onError: handleQueryError,
    },
  },
});

/**
 * Query keys factory for type-safe and consistent query keys
 * This pattern helps avoid typos and makes refactoring easier
 */
export const queryKeys = {
  // Base key
  all: ["issues"] as const,

  // Issues keys
  issues: {
    all: () => [...queryKeys.all] as const,
    lists: () => [...queryKeys.issues.all(), "list"] as const,
    list: (filters?: any) => [...queryKeys.issues.lists(), filters] as const,
    details: () => [...queryKeys.issues.all(), "detail"] as const,
    detail: (id: number) => [...queryKeys.issues.details(), id] as const,
  },

  // Analytics keys
  analytics: {
    all: () => ["analytics"] as const,
    data: () => [...queryKeys.analytics.all(), "data"] as const,
  },
} as const;

/**
 * Helper function to invalidate all issues-related queries
 */
export function invalidateIssuesQueries() {
  queryClient.invalidateQueries({ queryKey: queryKeys.issues.all() });
}

/**
 * Helper function to invalidate analytics queries
 */
export function invalidateAnalyticsQueries() {
  queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all() });
}

/**
 * Helper function to prefetch issues
 */
export async function prefetchIssues(filters?: any) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.issues.list(filters),
    queryFn: async () => {
      const { issueApi } = await import("../services/api-fetch");
      return issueApi.getAll(filters);
    },
  });
}

/**
 * Helper function to set issue data in cache
 */
export function setIssueInCache(issue: any) {
  queryClient.setQueryData(queryKeys.issues.detail(issue.id), issue);

  // Also update the issue in the list cache
  queryClient.setQueryData(queryKeys.issues.lists(), (old: any[] = []) => {
    const index = old.findIndex((i) => i.id === issue.id);
    if (index !== -1) {
      const newData = [...old];
      newData[index] = issue;
      return newData;
    }
    return old;
  });
}

/**
 * Helper function to remove issue from cache
 */
export function removeIssueFromCache(id: number) {
  queryClient.removeQueries({ queryKey: queryKeys.issues.detail(id) });

  // Also remove from list cache
  queryClient.setQueryData(queryKeys.issues.lists(), (old: any[] = []) =>
    old.filter((i) => i.id !== id)
  );
}
