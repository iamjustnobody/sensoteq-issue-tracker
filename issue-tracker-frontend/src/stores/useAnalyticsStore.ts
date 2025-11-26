import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { analyticsApi } from "../services/api";
import toast from "react-hot-toast";
import type { AnalyticsData } from "../types";

interface AnalyticsState {
  // State
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Cache settings
  cacheTime: number; // ms

  // Actions
  fetchAnalytics: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;

  // Helpers
  isCacheValid: () => boolean;
}

const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      data: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      cacheTime: DEFAULT_CACHE_TIME,

      // Check if cache is still valid
      isCacheValid: () => {
        const { lastFetched, cacheTime } = get();
        if (!lastFetched) return false;
        return Date.now() - lastFetched < cacheTime;
      },

      // Fetch analytics data
      fetchAnalytics: async () => {
        // Use cache if valid
        if (get().isCacheValid()) {
          console.log("Using cached analytics data");
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const data = await analyticsApi.getData();

          set({
            data,
            isLoading: false,
            lastFetched: Date.now(),
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch analytics";
          set({ error: message, isLoading: false });
          toast.error(message);
        }
      },

      // Force refetch (bypass cache)
      refetch: async () => {
        set({ lastFetched: null }); // Invalidate cache
        await get().fetchAnalytics();
      },

      // Reset state
      reset: () => {
        set({
          data: null,
          isLoading: false,
          error: null,
          lastFetched: null,
        });
      },
    }),
    { name: "AnalyticsStore" }
  )
);

// Selectors
export const selectAnalyticsData = (state: AnalyticsState) => state.data;
export const selectIsLoading = (state: AnalyticsState) => state.isLoading;
export const selectStatusDistribution = (state: AnalyticsState) =>
  state.data?.statusDistribution || [];
export const selectCompletionRate = (state: AnalyticsState) =>
  state.data?.completionRate || 0;
