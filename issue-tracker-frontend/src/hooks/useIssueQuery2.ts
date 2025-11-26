import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { issueApi } from "../services/api-fetch";
import toast from "react-hot-toast";
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  IssueStatus,
} from "../types";

const QUERY_KEYS = {
  issues: (filters?: IssueFilters) => ["issues", filters] as const,
  issue: (id: number) => ["issues", id] as const,
};

export function useIssuesQuery(filters?: IssueFilters) {
  const queryClient = useQueryClient();

  // Fetch all issues
  const issuesQuery = useQuery({
    queryKey: QUERY_KEYS.issues(filters),
    queryFn: () => issueApi.getAll(filters),
  });

  // Create issue mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateIssueDTO) => issueApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast.success("Issue created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create issue");
    },
  });

  // Update issue mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateIssueDTO }) =>
      issueApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["issues"] });

      const previousIssues = queryClient.getQueryData<Issue[]>(
        QUERY_KEYS.issues(filters)
      );

      if (previousIssues) {
        queryClient.setQueryData<Issue[]>(
          QUERY_KEYS.issues(filters),
          previousIssues.map((issue) =>
            issue.id === id ? { ...issue, ...data } : issue
          )
        );
      }

      return { previousIssues };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousIssues) {
        queryClient.setQueryData(
          QUERY_KEYS.issues(filters),
          context.previousIssues
        );
      }
      toast.error(error.message || "Failed to update issue");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast.success("Issue updated successfully");
    },
  });

  // Delete issue mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => issueApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["issues"] });

      const previousIssues = queryClient.getQueryData<Issue[]>(
        QUERY_KEYS.issues(filters)
      );

      if (previousIssues) {
        queryClient.setQueryData<Issue[]>(
          QUERY_KEYS.issues(filters),
          previousIssues.filter((issue) => issue.id !== id)
        );
      }

      return { previousIssues };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(
          QUERY_KEYS.issues(filters),
          context.previousIssues
        );
      }
      toast.error(error.message || "Failed to delete issue");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast.success("Issue deleted successfully");
    },
  });

  // Helper function for quick status update
  const updateStatus = (id: number, status: IssueStatus) => {
    const progress =
      status === "completed" ? 100 : status === "not-started" ? 0 : 50;
    return updateMutation.mutateAsync({ id, data: { status, progress } });
  };

  return {
    issues: issuesQuery.data ?? [],
    isLoading: issuesQuery.isLoading,
    error: issuesQuery.error?.message ?? null,
    refetch: issuesQuery.refetch,
    createIssue: createMutation.mutateAsync,
    updateIssue: (id: number, data: UpdateIssueDTO) =>
      updateMutation.mutateAsync({ id, data }),
    deleteIssue: deleteMutation.mutateAsync,
    updateStatus,
  };
}

// Fetch single issue
export function useIssueQuery(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.issue(id),
    queryFn: () => issueApi.getById(id),
    enabled: !!id,
  });
}
