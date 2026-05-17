const FAVORITES_KEY = "gimWorkbench:favorites";
const RECENT_MODULES_KEY = "gimWorkbench:recentModules";
const CHECKLIST_PREFIX = "gimWorkbench:checklist:";
const RECENT_LIMIT = 8;

type ChecklistState = Record<string, boolean>;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is intentionally best-effort for this personal tool.
  }
}

export function getFavorites(): string[] {
  return readJson<string[]>(FAVORITES_KEY, []);
}

export function setFavorites(moduleIds: string[]): void {
  writeJson(FAVORITES_KEY, Array.from(new Set(moduleIds)));
}

export function toggleFavorite(moduleId: string): string[] {
  const favorites = getFavorites();
  const next = favorites.includes(moduleId)
    ? favorites.filter((id) => id !== moduleId)
    : [moduleId, ...favorites];

  setFavorites(next);
  return next;
}

export function getRecentModules(): string[] {
  return readJson<string[]>(RECENT_MODULES_KEY, []);
}

export function addRecentModule(moduleId: string): string[] {
  const next = [moduleId, ...getRecentModules().filter((id) => id !== moduleId)].slice(
    0,
    RECENT_LIMIT,
  );

  writeJson(RECENT_MODULES_KEY, next);
  return next;
}

export function getChecklistState(storageKey: string): ChecklistState {
  return readJson<ChecklistState>(`${CHECKLIST_PREFIX}${storageKey}`, {});
}

export function setChecklistState(storageKey: string, state: ChecklistState): void {
  writeJson(`${CHECKLIST_PREFIX}${storageKey}`, state);
}

export function clearChecklistState(storageKey: string): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(`${CHECKLIST_PREFIX}${storageKey}`);
  } catch {
    // Ignore storage cleanup failures.
  }
}
