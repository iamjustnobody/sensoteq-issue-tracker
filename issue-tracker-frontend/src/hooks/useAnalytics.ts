import { useEffect } from "react";
import { useAnalyticsStore } from "../stores/useAnalyticsStore";

export function useAnalytics() {
  const data = useAnalyticsStore((state) => state.data);
  const isLoading = useAnalyticsStore((state) => state.isLoading);
  const error = useAnalyticsStore((state) => state.error);
  const fetchAnalytics = useAnalyticsStore((state) => state.fetchAnalytics);
  const refetch = useAnalyticsStore((state) => state.refetch);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
