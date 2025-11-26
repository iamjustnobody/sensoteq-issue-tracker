import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../services/api-fetch";

export function useAnalyticsQuery() {
  const query = useQuery({
    queryKey: ["analytics"],
    queryFn: () => analyticsApi.getData(),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
