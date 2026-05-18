import type { GameMode } from '@/lib/gameEngine';

export interface SessionHistoryEntry {
  id: string;
  mode: GameMode;
  score: number;
  accuracy: number;
  avgReaction: number;
  duration: number;
  timestamp: string;
  hits: number;
  misses: number;
}

const STORAGE_KEY = 'aimX_sessionHistory';
const MAX_ENTRIES = 50;

export function saveSession(entry: Omit<SessionHistoryEntry, 'id'>): void {
  try {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newEntry: SessionHistoryEntry = { id, ...entry };
    const history = loadSessionHistory();
    history.unshift(newEntry);

    // Keep only the most recent entries
    const trimmed = history.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function loadSessionHistory(): SessionHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: SessionHistoryEntry[] = JSON.parse(raw);
    // Sort newest first
    return parsed.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return [];
  }
}

export function getLastSession(mode: string): SessionHistoryEntry | null {
  try {
    const history = loadSessionHistory();
    const modeSessions = history.filter((entry) => entry.mode === mode);
    // Return the second most recent (excluding the very latest one)
    return modeSessions.length >= 2 ? modeSessions[1] : null;
  } catch {
    return null;
  }
}

export function getSessionCount(): number {
  try {
    return loadSessionHistory().length;
  } catch {
    return 0;
  }
}

export function getTotalPlayTime(): number {
  try {
    const history = loadSessionHistory();
    return history.reduce((sum, entry) => sum + entry.duration, 0);
  } catch {
    return 0;
  }
}
