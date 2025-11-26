import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Issue } from "../types";

interface IssuesState {
  // State
  issues: Issue[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  setIssues: (issues: Issue[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: number, updates: Partial<Issue>) => void;
  removeIssue: (id: number) => void;
  reset: () => void;

  // Computed values
  getTotalIssues: () => number;
  getCompletedCount: () => number;
  getCompletionRate: () => number;
  getIssuesByStatus: (status: Issue["status"]) => Issue[];
}

const initialState = {
  issues: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

export const useIssuesStore = create<IssuesState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Actions
      setIssues: (issues) =>
        set(
          { issues, lastFetched: Date.now(), error: null },
          false,
          "setIssues"
        ),

      setLoading: (isLoading) => set({ isLoading }, false, "setLoading"),

      setError: (error) => set({ error, isLoading: false }, false, "setError"),

      addIssue: (issue) =>
        set(
          (state) => ({
            issues: [issue, ...state.issues],
          }),
          false,
          "addIssue"
        ),

      updateIssue: (id, updates) =>
        set(
          (state) => ({
            issues: state.issues.map((issue) =>
              issue.id === id
                ? { ...issue, ...updates, updated_at: new Date().toISOString() }
                : issue
            ),
          }),
          false,
          "updateIssue"
        ),

      removeIssue: (id) =>
        set(
          (state) => ({
            issues: state.issues.filter((issue) => issue.id !== id),
          }),
          false,
          "removeIssue"
        ),

      reset: () => set(initialState, false, "reset"),

      // Computed values
      getTotalIssues: () => get().issues.length,

      getCompletedCount: () =>
        get().issues.filter((i) => i.status === "completed").length,

      getCompletionRate: () => {
        const total = get().getTotalIssues();
        if (total === 0) return 0;
        const completed = get().getCompletedCount();
        return Math.round((completed / total) * 100);
      },

      getIssuesByStatus: (status) =>
        get().issues.filter((i) => i.status === status),
    }),
    {
      name: "issues-store",
    }
  )
);

// Selectors for better performance
export const selectIssues = (state: IssuesState) => state.issues;
export const selectTotalIssues = (state: IssuesState) => state.getTotalIssues();
export const selectCompletionRate = (state: IssuesState) =>
  state.getCompletionRate();
export const selectIsLoading = (state: IssuesState) => state.isLoading;
export const selectError = (state: IssuesState) => state.error;
