import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENTS = 8;

interface ToolsState {
  favoriteIds: string[];
  recentIds: string[];
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  addRecent: (toolId: string) => void;
}

export const useToolsStore = create<ToolsState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      recentIds: [],
      toggleFavorite: (toolId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(toolId)
            ? state.favoriteIds.filter((id) => id !== toolId)
            : [...state.favoriteIds, toolId],
        })),
      isFavorite: (toolId) => get().favoriteIds.includes(toolId),
      addRecent: (toolId) =>
        set((state) => ({
          recentIds: [
            toolId,
            ...state.recentIds.filter((id) => id !== toolId),
          ].slice(0, MAX_RECENTS),
        })),
    }),
    {
      name: "devtools-tools-store",
    }
  )
);
