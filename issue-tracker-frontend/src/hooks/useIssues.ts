import { useState, useEffect, useCallback } from "react";
import { issueApi } from "../services/api";
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  IssueStatus,
} from "../types";

interface UseIssuesReturn {
  issues: Issue[];
  isLoading: boolean;
  error: string | null;
  filters: IssueFilters;
  setFilters: (filters: IssueFilters) => void;
  createIssue: (data: CreateIssueDTO) => Promise<void>;
  updateIssue: (id: number, data: UpdateIssueDTO) => Promise<void>;
  deleteIssue: (id: number) => Promise<void>;
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
  const updateIssue = async (id: number, data: UpdateIssueDTO) => {
    const updated = await issueApi.update(id, data);
    setIssues((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  // Delete issue
  const deleteIssue = async (id: number) => {
    await issueApi.delete(id);
    setIssues((prev) => prev.filter((i) => i.id !== id));
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
    updateIssue,
    deleteIssue,
    updateStatus,
    refetch: fetchIssues,
  };
}
