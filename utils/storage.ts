import { Stats, CategoryKey } from '../types';

const STORAGE_KEYS = {
  STATS: 'impostor_stats',
  UNLOCKED: 'impostor_unlocked',
  CUSTOM_CATS: 'impostor_custom_categories',
  SETTINGS: 'impostor_settings'
};

export const loadStats = (): Stats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STATS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  return {
    gamesPlayed: 0,
    civilWins: 0,
    impostorWins: 0,
    totalImpostorGames: 0,
    totalCivilGames: 0,
    achievements: []
  };
};

export const saveStats = (stats: Stats) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
};

export const loadUnlockedCategories = (): CategoryKey[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.UNLOCKED);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load unlocked:', e);
  }
  return [];
};

export const saveUnlockedCategories = (unlocked: CategoryKey[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.UNLOCKED, JSON.stringify(unlocked));
  } catch (e) {
    console.error('Failed to save unlocked:', e);
  }
};

export const loadCustomCategories = (): Record<string, string[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load custom categories:', e);
  }
  return {};
};

export const saveCustomCategories = (categories: Record<string, string[]>) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CATS, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save custom categories:', e);
  }
};

export const loadSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return {
    soundEnabled: true,
    language: 'pt'
  };
};

export const saveSettings = (settings: any) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};
