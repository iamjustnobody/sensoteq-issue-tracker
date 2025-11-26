import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Issue } from "../types";

interface IssuesStore {
  // Derived/computed state
  issues: Issue[];

  // Actions
  setIssues: (issues: Issue[]) => void;

  // Computed getters
  get totalCount(): number;
  get completedCount(): number;
  get completionRate(): number;
  get groupedByStatus(): Record<string, Issue[]>;
}

export const useIssuesStore = create<IssuesStore>()(
  devtools(
    (set, get) => ({
      // State
      issues: [],

      // Actions
      setIssues: (issues) => set({ issues }),

      // Computed properties (memoized)
      get totalCount() {
        return get().issues.length;
      },

      get completedCount() {
        return get().issues.filter((i) => i.status === "completed").length;
      },

      get completionRate() {
        const total = get().totalCount;
        const completed = get().completedCount;
        return total > 0 ? Math.round((completed / total) * 100) : 0;
      },

      get groupedByStatus() {
        const issues = get().issues;
        return {
          "not-started": issues.filter((i) => i.status === "not-started"),
          "in-progress": issues.filter((i) => i.status === "in-progress"),
          completed: issues.filter((i) => i.status === "completed"),
        };
      },
    }),
    { name: "IssuesStore" }
  )
);

// Selectors for performance
export const selectTotalCount = (state: IssuesStore) => state.totalCount;
export const selectCompletionRate = (state: IssuesStore) =>
  state.completionRate;
export const selectGroupedByStatus = (state: IssuesStore) =>
  state.groupedByStatus;
