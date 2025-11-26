import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { issueApi } from "../services/api";
import toast from "react-hot-toast";
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  IssueStatus,
} from "../types";

interface IssuesState {
  // State
  issues: Issue[];
  isLoading: boolean;
  error: string | null;
  filters: IssueFilters;

  // Computed/derived state
  filteredIssues: Issue[];
  groupedIssues: Record<IssueStatus, Issue[]>;
  totalCount: number;

  // Actions
  fetchIssues: () => Promise<void>;
  setFilters: (filters: IssueFilters) => void;
  createIssue: (data: CreateIssueDTO) => Promise<Issue | null>;
  updateIssue: (id: number, data: UpdateIssueDTO) => Promise<Issue | null>;
  deleteIssue: (id: number) => Promise<boolean>;
  updateStatus: (id: number, status: IssueStatus) => Promise<void>;

  // Optimistic updates
  optimisticUpdate: (id: number, data: Partial<Issue>) => void;
  optimisticDelete: (id: number) => void;
  rollback: () => void;

  // Utility
  reset: () => void;
  refetch: () => Promise<void>;
}

// Snapshot for rollback
let previousState: Issue[] = [];

export const useIssuesStore = create<IssuesState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        issues: [],
        isLoading: false,
        error: null,
        filters: {},

        // Computed state (getters)
        get filteredIssues() {
          const { issues, filters } = get();
          let filtered = [...issues];

          if (filters.status) {
            filtered = filtered.filter((i) => i.status === filters.status);
          }

          if (filters.search) {
            const query = filters.search.toLowerCase();
            filtered = filtered.filter(
              (i) =>
                i.title.toLowerCase().includes(query) ||
                i.description?.toLowerCase().includes(query)
            );
          }

          return filtered;
        },

        get groupedIssues() {
          const filtered = get().filteredIssues;
          return {
            "not-started": filtered.filter((i) => i.status === "not-started"),
            "in-progress": filtered.filter((i) => i.status === "in-progress"),
            completed: filtered.filter((i) => i.status === "completed"),
          };
        },

        get totalCount() {
          return get().issues.length;
        },

        // Actions
        fetchIssues: async () => {
          set({ isLoading: true, error: null });

          try {
            const { filters } = get();
            const issues = await issueApi.getAll(filters);

            set({ issues, isLoading: false });
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to fetch issues";
            set({ error: message, isLoading: false });
            toast.error(message);
          }
        },

        setFilters: (filters) => {
          set({ filters });
          get().fetchIssues(); // Auto-refetch on filter change
        },

        createIssue: async (data) => {
          try {
            const newIssue = await issueApi.create(data);

            set((state) => {
              state.issues.unshift(newIssue); // Add to beginning
            });

            toast.success("Issue created successfully");
            return newIssue;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to create issue";
            toast.error(message);
            return null;
          }
        },

        updateIssue: async (id, data) => {
          // Store previous state for rollback
          previousState = [...get().issues];

          // Optimistic update
          set((state) => {
            const index = state.issues.findIndex((i) => i.id === id);
            if (index !== -1) {
              state.issues[index] = { ...state.issues[index], ...data };
            }
          });

          try {
            const updated = await issueApi.update(id, data);

            // Update with server response
            set((state) => {
              const index = state.issues.findIndex((i) => i.id === id);
              if (index !== -1) {
                state.issues[index] = updated;
              }
            });

            toast.success("Issue updated successfully");
            return updated;
          } catch (error) {
            // Rollback on error
            set({ issues: previousState });
            const message =
              error instanceof Error ? error.message : "Failed to update issue";
            toast.error(message);
            return null;
          }
        },

        deleteIssue: async (id) => {
          // Store previous state for rollback
          previousState = [...get().issues];

          // Optimistic delete
          set((state) => {
            state.issues = state.issues.filter((i) => i.id !== id);
          });

          try {
            await issueApi.delete(id);
            toast.success("Issue deleted successfully");
            return true;
          } catch (error) {
            // Rollback on error
            set({ issues: previousState });
            const message =
              error instanceof Error ? error.message : "Failed to delete issue";
            toast.error(message);
            return false;
          }
        },

        updateStatus: async (id, status) => {
          const progress =
            status === "completed" ? 100 : status === "not-started" ? 0 : 50;
          await get().updateIssue(id, { status, progress });
        },

        // Optimistic update helpers
        optimisticUpdate: (id, data) => {
          set((state) => {
            const index = state.issues.findIndex((i) => i.id === id);
            if (index !== -1) {
              state.issues[index] = { ...state.issues[index], ...data };
            }
          });
        },

        optimisticDelete: (id) => {
          set((state) => {
            state.issues = state.issues.filter((i) => i.id !== id);
          });
        },

        rollback: () => {
          if (previousState.length > 0) {
            set({ issues: previousState });
          }
        },

        // Utility
        reset: () => {
          set({
            issues: [],
            isLoading: false,
            error: null,
            filters: {},
          });
        },

        refetch: async () => {
          await get().fetchIssues();
        },
      })),
      {
        name: "issues-storage",
        partialize: (state) => ({
          filters: state.filters, // Only persist filters
        }),
      }
    ),
    { name: "IssuesStore" }
  )
);

// Selectors for better performance
export const selectAllIssues = (state: IssuesState) => state.issues;
export const selectFilteredIssues = (state: IssuesState) =>
  state.filteredIssues;
export const selectGroupedIssues = (state: IssuesState) => state.groupedIssues;
export const selectIssueById = (id: number) => (state: IssuesState) =>
  state.issues.find((i) => i.id === id);
export const selectIsLoading = (state: IssuesState) => state.isLoading;
