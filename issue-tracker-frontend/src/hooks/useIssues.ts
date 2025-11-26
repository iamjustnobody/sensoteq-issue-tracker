import { useState, useEffect, useCallback } from "react";
import { issueApi } from "../services/api.js";
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  IssueStatus,
} from "../types/index.js";
import toast from "react-hot-toast";

interface UseIssuesReturn {
  issues: Issue[];
  isLoading: boolean;
  error: string | null;
  filters: IssueFilters;
  setFilters: (filters: IssueFilters) => void;
  createIssue: (data: CreateIssueDTO) => Promise<void>;
  updateIssue: (id: number, data: UpdateIssueDTO) => Promise<void>;
  deleteIssue: (id: number) => Promise<void>;
  handleIssueUpdate: (id: number, data: UpdateIssueDTO) => Promise<void>;
  handleIssueDelete: (id: number) => Promise<void>;
  updateStatus: (id: number, status: IssueStatus) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useIssues(): UseIssuesReturn {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IssueFilters>({});

  // Fetch issues
  const fetchIssues = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await issueApi.getAll(filters);
      setIssues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch issues");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Initial fetch and refetch on filter change
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Create issue
  const createIssue = async (data: CreateIssueDTO) => {
    const newIssue = await issueApi.create(data);
    setIssues((prev) => [newIssue, ...prev]);
  };

  // Update issue
  const handleIssueUpdate = async (id: number, data: UpdateIssueDTO) => {
    const updated = await issueApi.update(id, data);
    setIssues((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };
  // Update issue (optimistic update)
  const updateIssue = async (id: number, data: UpdateIssueDTO) => {
    // Store previous state for rollback
    const previousIssues = [...issues];

    // Optimistic update
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));

    try {
      const updated = await issueApi.update(id, data);
      // Update with server response
      setIssues((prev) => prev.map((i) => (i.id === id ? updated : i)));
      toast.success("Issue updated");
    } catch (err) {
      // Rollback on error
      setIssues(previousIssues);
      const message =
        err instanceof Error ? err.message : "Failed to update issue";
      toast.error(message);
      throw err;
    }
  };

  // Delete issue
  const handleIssueDelete = async (id: number) => {
    await issueApi.delete(id);
    setIssues((prev) => prev.filter((i) => i.id !== id));
  };
  const deleteIssue = async (id: number) => {
    const previousIssues = [...issues];

    // Optimistic delete
    setIssues((prev) => prev.filter((i) => i.id !== id));

    try {
      await issueApi.delete(id);
      toast.success("Issue deleted");
    } catch (err) {
      // Rollback on error
      setIssues(previousIssues);
      const message =
        err instanceof Error ? err.message : "Failed to delete issue";
      toast.error(message);
      throw err;
    }
  };

  // Quick status update
  const updateStatus = async (id: number, status: IssueStatus) => {
    const progress =
      status === "completed" ? 100 : status === "not-started" ? 0 : 50;
    await updateIssue(id, { status, progress });
  };

  return {
    issues,
    isLoading,
    error,
    filters,
    setFilters,
    createIssue,
    handleIssueUpdate,
    updateIssue,
    handleIssueDelete,
    deleteIssue,
    updateStatus,
    refetch: fetchIssues,
  };
}
