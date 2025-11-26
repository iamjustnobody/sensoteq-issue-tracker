//

import { useQuery } from "@tanstack/react-query";
import { analyticsApi, ApiError } from "../services/api-fetch";
import { queryKeys } from "../lib/queryClient";

/**
 * React Query hook for fetching analytics data
 */
export function useAnalyticsQuery() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.analytics.data(),
    queryFn: () => analyticsApi.getData(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error instanceof ApiError && error.isClientError()) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    data,
    isLoading,
    error:
      error instanceof ApiError ? error.message : error?.toString() || null,
    refetch,
  };
}
