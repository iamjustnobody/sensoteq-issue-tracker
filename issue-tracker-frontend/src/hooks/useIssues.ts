import { useEffect } from "react";
import {
  useIssuesStore,
  selectFilteredIssues,
  selectGroupedIssues,
  selectAllIssues,
} from "../stores/useIssuesStore";

export function useIssues() {
  const allIssues = useIssuesStore(selectAllIssues);
  //   const filteredIssues = useIssuesStore(selectFilteredIssues);
  //   const groupedIssues = useIssuesStore(selectGroupedIssues);
  const isLoading = useIssuesStore((state) => state.isLoading);
  const error = useIssuesStore((state) => state.error);
  const filters = useIssuesStore((state) => state.filters);

  const fetchIssues = useIssuesStore((state) => state.fetchIssues);
  const setFilters = useIssuesStore((state) => state.setFilters);
  const createIssue = useIssuesStore((state) => state.createIssue);
  const updateIssue = useIssuesStore((state) => state.updateIssue);
  const deleteIssue = useIssuesStore((state) => state.deleteIssue);
  const updateStatus = useIssuesStore((state) => state.updateStatus);
  const refetch = useIssuesStore((state) => state.refetch);

  // Auto-fetch on mount if empty
  useEffect(() => {
    if (allIssues.length === 0 && !isLoading) {
      fetchIssues();
    }
  }, []);

  return {
    issues: allIssues,
    // filteredIssues,
    // groupedIssues,
    isLoading,
    error,
    filters,
    setFilters,
    createIssue,
    updateIssue,
    deleteIssue,
    updateStatus,
    refetch,
  };
}
