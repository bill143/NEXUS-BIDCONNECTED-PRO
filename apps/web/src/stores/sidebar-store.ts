import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  recentlyViewed: RecentItem[];
  isRecentlyViewedOpen: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  addRecentlyViewed: (item: RecentItem) => void;
  toggleRecentlyViewed: () => void;
}

export interface RecentItem {
  id: string;
  name: string;
  href: string;
  timestamp: number;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      recentlyViewed: [],
      isRecentlyViewedOpen: true,

      toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

      setCollapsed: (value: boolean) => set({ isCollapsed: value }),

      addRecentlyViewed: (item: RecentItem) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter(
            (r) => r.id !== item.id
          );
          return {
            recentlyViewed: [item, ...filtered].slice(0, 5),
          };
        }),

      toggleRecentlyViewed: () =>
        set((state) => ({
          isRecentlyViewedOpen: !state.isRecentlyViewedOpen,
        })),
    }),
    {
      name: "bidconnect-sidebar",
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        recentlyViewed: state.recentlyViewed,
        isRecentlyViewedOpen: state.isRecentlyViewedOpen,
      }),
    }
  )
);
