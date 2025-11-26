import { useState, useEffect } from "react";
import { analyticsApi } from "../services/api";
import type { AnalyticsData } from "../types";
import toast from "react-hot-toast";

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalytics_custom(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const analytics = await analyticsApi.getData();
      setData(analytics);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
