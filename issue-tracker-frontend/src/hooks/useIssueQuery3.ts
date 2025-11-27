import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { issueApi, ApiError } from "../services/api-fetch";
import { queryKeys } from "../lib/queryClient";
import toast from "react-hot-toast";
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  IssueStatus,
} from "../types";
import { useIssuesStore } from "../stores/useIssuesStore";

/**
 * React Query hook for managing issues with optimistic updates & Zustand store sync
 *
 * @param filters - Optional filters for fetching issues. If not provided, hook only provides mutations
 * @param options - Optional configuration
 * @param options.skipFetch - If true, skip the query and only provide mutations (useful when reading from store)
 */
export function useIssuesQuery(
  filters?: IssueFilters,
  options?: { skipFetch?: boolean }
) {
  const queryClient = useQueryClient();

  // Determine if we should fetch
  // Skip fetch if explicitly requested OR if no filters provided (mutation-only mode)
  const shouldFetch = !options?.skipFetch;

  // ============================================
  // QUERY: Fetch all issues
  // ============================================
  const {
    data: issues = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.issues.list(filters),
    queryFn: () => issueApi.getAll(filters),
    enabled: shouldFetch, // Only fetch if not skipped
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.isClientError()) {
        return false;
      }
      // Retry up to 2 times for network errors
      return failureCount < 2;
    },
  });

  // ============================================
  // SYNC: Update Zustand store when data changes
  // ============================================
  // Zustand store actions
  // const { setIssues, setLoading, setError } = useIssuesStore();
  // useEffect(() => {
  //   if (!shouldFetch) return;
  //   setIssues(issues);
  //   setLoading(isLoading);
  //   setError(
  //     error instanceof ApiError ? error.message : error?.toString() || null
  //   );
  // }, [issues, isLoading, error, setIssues, setLoading, setError, shouldFetch]);
  // ============================================
  // MUTATION: Create issue
  // ============================================
  const createMutation = useMutation({
    mutationFn: (data: CreateIssueDTO) => issueApi.create(data),
    onMutate: async (newIssue) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.issues.lists() });

      // Snapshot previous value for rollback
      const previousIssues = queryClient.getQueryData<Issue[]>(
        queryKeys.issues.list(filters)
      );

      // Optimistically update with temporary issue
      const tempIssue: Issue = {
        id: Date.now(), //Temporary ID
        ...newIssue,
        status: newIssue.status || "not-started",
        progress: newIssue.progress || 0,
        description: newIssue.description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Issue[]>(
        queryKeys.issues.list(filters),
        (old = []) => [tempIssue as Issue, ...old]
      );

      // Update Zustand store optimistically
      useIssuesStore.getState().addIssue(tempIssue);

      return { previousIssues };
    },
    onError: (error, _newIssue, context) => {
      // Rollback on error
      if (context?.previousIssues) {
        queryClient.setQueryData(
          queryKeys.issues.list(filters),
          context.previousIssues
        );

        // Restore Zustand store
        useIssuesStore.getState().setIssues(context.previousIssues);
      }

      // Show user-friendly error message
      const message =
        error instanceof ApiError ? error.message : "Failed to create issue";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Issue created successfully");
    },
    onSettled: () => {
      // Always refetch to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all() });
    },
  });

  // ============================================
  // MUTATION: Update issue
  // ============================================
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateIssueDTO }) =>
      issueApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.issues.lists() });

      const previousIssues = queryClient.getQueryData<Issue[]>(
        queryKeys.issues.list(filters)
      );

      // Optimistic update
      queryClient.setQueryData<Issue[]>(
        queryKeys.issues.list(filters),
        (old = []) =>
          old.map((issue) =>
            issue.id === id
              ? { ...issue, ...data, updated_at: new Date().toISOString() }
              : issue
          )
      );

      // Update Zustand store optimistically
      useIssuesStore.getState().updateIssue(id, data);

      return { previousIssues };
    },
    onError: (error, _variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(
          queryKeys.issues.list(filters),
          context.previousIssues
        );

        // Restore Zustand store
        useIssuesStore.getState().setIssues(context.previousIssues);
      }

      const message =
        error instanceof ApiError ? error.message : "Failed to update issue";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Issue updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all() });
    },
  });

  // ============================================
  // MUTATION: Delete issue
  // ============================================
  const deleteMutation = useMutation({
    mutationFn: (id: number) => issueApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.issues.lists() });

      const previousIssues = queryClient.getQueryData<Issue[]>(
        queryKeys.issues.list(filters)
      );

      // Optimistic delete
      queryClient.setQueryData<Issue[]>(
        queryKeys.issues.list(filters),
        (old = []) => old.filter((issue) => issue.id !== id)
      );

      // Update Zustand store optimistically
      useIssuesStore.getState().removeIssue(id);

      return { previousIssues };
    },
    onError: (error, _id, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(
          queryKeys.issues.list(filters),
          context.previousIssues
        );

        // Restore Zustand store
        useIssuesStore.getState().setIssues(context.previousIssues);
      }

      const message =
        error instanceof ApiError ? error.message : "Failed to delete issue";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Issue deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all() });
    },
  });

  // ============================================
  // Helper functions
  // ============================================
  const createIssue = async (data: CreateIssueDTO) => {
    return createMutation.mutateAsync(data);
  };

  const updateIssue = async (id: number, data: UpdateIssueDTO) => {
    return updateMutation.mutateAsync({ id, data });
  };

  const deleteIssue = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  const updateStatus = async (id: number, status: IssueStatus) => {
    const progress =
      status === "completed" ? 100 : status === "not-started" ? 0 : 50;
    return updateMutation.mutateAsync({ id, data: { status, progress } });
  };

  // ============================================
  // Return values
  // ============================================
  return {
    issues,
    isLoading,
    error:
      error instanceof ApiError ? error.message : error?.toString() || null,
    createIssue,
    updateIssue,
    deleteIssue,
    updateStatus,
    refetch,
    // Expose mutation states for advanced usage
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook specifically for mutations only (no fetching)
 * Use this when only needing create/update/delete and read from Zustand store
 */
export function useIssuesMutations() {
  return useIssuesQuery(undefined, { skipFetch: true });
}

// ============================================
// Hook for fetching single issue
// ============================================
export function useIssueQuery(id: number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.issues.detail(id!),
    queryFn: () => issueApi.getById(id!),
    enabled: id != null, // Only fetch if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if issue not found
      if (error instanceof ApiError && error.isNotFound()) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
