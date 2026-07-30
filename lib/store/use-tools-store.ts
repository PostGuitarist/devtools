import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_HISTORY = 500;

export interface HistoryEntry {
  toolId: string;
  visitedAt: number;
}

export interface Transfer {
  fromToolId: string;
  value: string;
  createdAt: number;
}

interface ToolsState {
  favoriteIds: string[];
  history: HistoryEntry[];
  transfer: Transfer | null;
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  addRecent: (toolId: string) => void;
  getRecentIds: (limit?: number) => string[];
  clearHistory: () => void;
  setTransfer: (fromToolId: string, value: string) => void;
  clearTransfer: () => void;
}

interface PersistedStateV0 {
  favoriteIds?: string[];
  recentIds?: string[];
}

/**
 * Pure so callers (e.g. a Zustand selector) can memoize on `history`'s
 * reference instead of getting a fresh array every call, which would
 * otherwise defeat useSyncExternalStore's equality check and loop forever.
 */
export function deriveRecentIds(history: HistoryEntry[], limit = 8): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const entry of history) {
    if (seen.has(entry.toolId)) continue;
    seen.add(entry.toolId);
    ids.push(entry.toolId);
    if (ids.length >= limit) break;
  }
  return ids;
}

export const useToolsStore = create<ToolsState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      history: [],
      transfer: null,
      toggleFavorite: (toolId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(toolId)
            ? state.favoriteIds.filter((id) => id !== toolId)
            : [...state.favoriteIds, toolId],
        })),
      isFavorite: (toolId) => get().favoriteIds.includes(toolId),
      addRecent: (toolId) =>
        set((state) => ({
          history: [{ toolId, visitedAt: Date.now() }, ...state.history].slice(
            0,
            MAX_HISTORY
          ),
        })),
      getRecentIds: (limit = 8) => deriveRecentIds(get().history, limit),
      clearHistory: () => set({ history: [] }),
      setTransfer: (fromToolId, value) =>
        set({ transfer: { fromToolId, value, createdAt: Date.now() } }),
      clearTransfer: () => set({ transfer: null }),
    }),
    {
      name: "devtools-tools-store",
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as PersistedStateV0;
        if (version < 2) {
          const now = Date.now();
          const recentIds = state.recentIds ?? [];
          return {
            favoriteIds: state.favoriteIds ?? [],
            history: recentIds.map((toolId, index) => ({
              toolId,
              // Oldest-looking recent gets the earliest synthetic timestamp,
              // preserving relative order without claiming false precision.
              visitedAt: now - index,
            })),
            transfer: null,
          };
        }
        return persistedState as ToolsState;
      },
    }
  )
);
