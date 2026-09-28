const SETTINGS_KEY = 'pong.settings';
const MATCHES_KEY = 'pong.matches';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type Settings = {
  ballColor: string;
  paddleColor: string;
  speed: 'slow' | 'normal' | 'fast';
  difficulty: Difficulty;   // ← новое
};

export type Match = {
  id: string;
  date: string;
  playerScore: number;
  aiScore: number;
  won: boolean;
};

export const defaultSettings: Settings = {
  ballColor: '#111827',
  paddleColor: '#111827',
  speed: 'normal',
  difficulty: 'normal',
};

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    // ...defaultSettings важно: если в старых сохранённых настройках
    // не было difficulty — подставится 'normal'
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadMatches(): Match[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MATCHES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addMatch(match: Omit<Match, 'id'>) {
  if (typeof window === 'undefined') return;
  const all = loadMatches();
  const newMatch: Match = { ...match, id: crypto.randomUUID() };
  all.push(newMatch);
  localStorage.setItem(MATCHES_KEY, JSON.stringify(all));
}