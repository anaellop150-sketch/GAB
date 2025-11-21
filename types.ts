export type CategoryKey = 'Lugares' | 'Comidas' | 'Animais' | 'Objetos' | 'Profissões' | 'Filmes' | 'Séries' | 'Disney' | 'Heróis' | 'Videogames';
export type Language = 'pt' | 'en';
export type GameState = 'setup' | 'playerNames' | 'revealing' | 'playing' | 'voting' | 'results';
export type GameMode = 'circle' | 'interrogation';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Player {
  id: string;
  name: string;
  isImpostor: boolean;
  hasRevealed: boolean;
}

export interface GameConfig {
  numPlayers: number;
  category: CategoryKey;
  timeLimit: number;
  isTimedMode: boolean;
  alarmEnabled: boolean;
  gameMode: GameMode;
  difficulty: Difficulty;
  maxRounds: number;
}

export interface GameData {
  word: string;
  players: Player[];
  impostorId: string;
  currentRound: number;
  votes: Record<string, string>;
  startTime: number;
}

export interface Stats {
  gamesPlayed: number;
  civilWins: number;
  impostorWins: number;
  totalImpostorGames: number;
  totalCivilGames: number;
  achievements: string[];
}

export interface Achievement {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}
