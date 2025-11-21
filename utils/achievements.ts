import { Stats, Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    nameKey: 'firstGameName',
    descKey: 'firstGameDesc',
    icon: '🎮',
    unlocked: false,
    progress: 0,
    target: 1
  },
  {
    id: 'pro_liar',
    nameKey: 'proLiarName',
    descKey: 'proLiarDesc',
    icon: '🎭',
    unlocked: false,
    progress: 0,
    target: 5
  },
  {
    id: 'impostor_hunter',
    nameKey: 'impostorHunterName',
    descKey: 'impostorHunterDesc',
    icon: '🔍',
    unlocked: false,
    progress: 0,
    target: 10
  },
  {
    id: 'veteran',
    nameKey: 'veteranName',
    descKey: 'veteranDesc',
    icon: '⭐',
    unlocked: false,
    progress: 0,
    target: 50
  },
  {
    id: 'master_detective',
    nameKey: 'masterDetectiveName',
    descKey: 'masterDetectiveDesc',
    icon: '🕵️',
    unlocked: false,
    progress: 0,
    target: 25
  },
  {
    id: 'perfect_impostor',
    nameKey: 'perfectImpostorName',
    descKey: 'perfectImpostorDesc',
    icon: '👑',
    unlocked: false,
    progress: 0,
    target: 10
  }
];

export const checkAchievements = (stats: Stats): string[] => {
  const newAchievements: string[] = [];

  if (stats.gamesPlayed >= 1 && !stats.achievements.includes('first_game')) {
    newAchievements.push('first_game');
  }

  if (stats.impostorWins >= 5 && !stats.achievements.includes('pro_liar')) {
    newAchievements.push('pro_liar');
  }

  if (stats.civilWins >= 10 && !stats.achievements.includes('impostor_hunter')) {
    newAchievements.push('impostor_hunter');
  }

  if (stats.gamesPlayed >= 50 && !stats.achievements.includes('veteran')) {
    newAchievements.push('veteran');
  }

  if (stats.civilWins >= 25 && !stats.achievements.includes('master_detective')) {
    newAchievements.push('master_detective');
  }

  if (stats.impostorWins >= 10 && !stats.achievements.includes('perfect_impostor')) {
    newAchievements.push('perfect_impostor');
  }

  return newAchievements;
};

export const getAchievementProgress = (id: string, stats: Stats): { progress: number; target: number } => {
  const achievement = ACHIEVEMENTS.find(a => a.id === id);
  if (!achievement) return { progress: 0, target: 1 };

  switch (id) {
    case 'first_game':
      return { progress: Math.min(stats.gamesPlayed, 1), target: 1 };
    case 'pro_liar':
      return { progress: stats.impostorWins, target: 5 };
    case 'impostor_hunter':
      return { progress: stats.civilWins, target: 10 };
    case 'veteran':
      return { progress: stats.gamesPlayed, target: 50 };
    case 'master_detective':
      return { progress: stats.civilWins, target: 25 };
    case 'perfect_impostor':
      return { progress: stats.impostorWins, target: 10 };
    default:
      return { progress: 0, target: 1 };
  }
};
