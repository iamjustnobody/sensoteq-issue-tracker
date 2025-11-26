import { useEffect } from "react";
import { useIssuesQuery } from "./useIssueQuery";

/**
 * Global hook to fetch and cache issues data once at app level
 * This prevents duplicate fetches across multiple components
 */
export function useGlobalIssuesLoader() {
  const { issues, isLoading, error } = useIssuesQuery();

  // This hook just triggers the initial fetch and syncs with Zustand
  // Other components can then read from the Zustand store
  useEffect(() => {
    // Log when data is loaded for debugging
    if (!isLoading && issues.length > 0) {
      console.log(`[Global Issues Loader] Loaded ${issues.length} issues`);
    }
  }, [isLoading, issues.length]);

  return { isLoading, error };
}
