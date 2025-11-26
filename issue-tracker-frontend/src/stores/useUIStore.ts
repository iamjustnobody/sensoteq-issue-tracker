import { create } from "zustand";
import { persist } from "zustand/middleware";

type ViewMode = "card" | "table" | "virtual";

interface UIStore {
  // UI State
  viewMode: ViewMode;
  sidebarOpen: boolean;
  searchQuery: string;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // State
      viewMode: "card",
      sidebarOpen: false,
      searchQuery: "",

      // Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        viewMode: state.viewMode, // Persist only viewMode
      }),
    }
  )
);
