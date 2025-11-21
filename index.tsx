import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Users, Eye, EyeOff, Play, RotateCcw, MapPin, HelpCircle,
  Utensils, PawPrint, Briefcase, Package, Clock, Film, Tv,
  Gamepad2, Zap, Star, Lock, Infinity, Timer, Volume2, VolumeX,
  Bell, BellOff, X, TrendingUp, Trophy, Settings as SettingsIcon,
  CheckCircle, Circle, AlertCircle, ChevronRight, Award, Sparkles
} from 'lucide-react';

import { GameState, Language, CategoryKey, Player, GameConfig, GameData, Stats, GameMode, Difficulty } from './types';
import { CATEGORIES_PT, CATEGORIES_EN, INITIAL_LOCKED } from './data/categories';
import { UI_TEXT } from './data/translations';
import { playSoundEffect, SoundType } from './utils/audio';
import { loadStats, saveStats, loadUnlockedCategories, saveUnlockedCategories, loadSettings, saveSettings } from './utils/storage';
import { checkAchievements, getAchievementProgress, ACHIEVEMENTS } from './utils/achievements';

const CATEGORY_ICONS: Record<CategoryKey, React.ReactNode> = {
  'Lugares': <MapPin />,
  'Comidas': <Utensils />,
  'Animais': <PawPrint />,
  'Objetos': <Package />,
  'Profissões': <Briefcase />,
  'Filmes': <Film />,
  'Séries': <Tv />,
  'Disney': <Star />,
  'Heróis': <Zap />,
  'Videogames': <Gamepad2 />
};

const FUNNY_NAMES = [
  "Shadow", "Ninja", "Master", "Legend", "Ghost", "Phoenix", "Dragon", "Wolf",
  "Eagle", "Tiger", "Lion", "Bear", "Hawk", "Falcon", "Raven", "Storm",
  "Blaze", "Thunder", "Lightning", "Viper", "Cobra", "Python", "Raptor"
];

const App = () => {
  const settings = loadSettings();
  const [language, setLanguage] = useState<Language>(settings.language || 'pt');
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled !== false);
  const [gameState, setGameState] = useState<GameState>('setup');
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const [config, setConfig] = useState<GameConfig>({
    numPlayers: 4,
    category: 'Lugares',
    timeLimit: 4,
    isTimedMode: false,
    alarmEnabled: true,
    gameMode: 'circle',
    difficulty: 'normal',
    maxRounds: 2
  });

  const [gameData, setGameData] = useState<GameData>({
    word: '',
    players: [],
    impostorId: '',
    currentRound: 1,
    votes: {},
    startTime: 0
  });

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [autoHideTimer, setAutoHideTimer] = useState<number | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [lockedCategories, setLockedCategories] = useState<CategoryKey[]>(() => {
    const unlocked = loadUnlockedCategories();
    return INITIAL_LOCKED.filter(cat => !unlocked.includes(cat));
  });
  const [unlockClicks, setUnlockClicks] = useState<Record<string, number>>({});

  const [stats, setStats] = useState<Stats>(loadStats());

  const t = UI_TEXT[language];
  const currentCategories = language === 'pt' ? CATEGORIES_PT : CATEGORIES_EN;

  const play = useCallback((type: SoundType) => {
    playSoundEffect(type, soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    saveSettings({ soundEnabled, language });
  }, [soundEnabled, language]);

  useEffect(() => {
    let interval: any;
    if (gameState === 'playing' && config.isTimedMode && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (config.alarmEnabled) {
              playSoundEffect('alarm', true);
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([500, 200, 500, 200, 500]);
              }
            }
            setTimeout(() => {
              setGameState('voting');
            }, 1500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft, config.isTimedMode, config.alarmEnabled]);

  useEffect(() => {
    if (autoHideTimer !== null && autoHideTimer > 0) {
      const timer = setTimeout(() => {
        setAutoHideTimer(prev => prev !== null ? prev - 1 : null);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoHideTimer === 0) {
      setIsRevealed(false);
      setAutoHideTimer(null);
    }
  }, [autoHideTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCategoryClick = (cat: CategoryKey) => {
    if (lockedCategories.includes(cat)) {
      const newClicks = (unlockClicks[cat] || 0) + 1;
      setUnlockClicks(prev => ({ ...prev, [cat]: newClicks }));

      if (newClicks >= 3) {
        const newUnlocked = [...loadUnlockedCategories(), cat];
        saveUnlockedCategories(newUnlocked);
        setLockedCategories(prev => prev.filter(c => c !== cat));
        setConfig(prev => ({ ...prev, category: cat }));
        play('success');
      } else {
        play('lock');
      }
    } else {
      setConfig(prev => ({ ...prev, category: cat }));
      play('click');
    }
  };

  const generatePlayerNames = () => {
    const names: string[] = [];
    for (let i = 0; i < config.numPlayers; i++) {
      const randomName = FUNNY_NAMES[Math.floor(Math.random() * FUNNY_NAMES.length)] + (i + 1);
      names.push(randomName);
    }
    return names;
  };

  const startNameEntry = () => {
    play('click');
    const names = generatePlayerNames();
    const players: Player[] = names.map((name, i) => ({
      id: `player_${i}`,
      name,
      isImpostor: false,
      hasRevealed: false
    }));
    setGameData(prev => ({ ...prev, players }));
    setGameState('playerNames');
  };

  const startGame = () => {
    play('click');
    const categoryWords = currentCategories[config.category];
    let wordPool = [...categoryWords];

    if (config.difficulty === 'hard') {
      wordPool = categoryWords.slice(0, 10);
    } else if (config.difficulty === 'easy') {
      wordPool = categoryWords.slice(0, 15);
    }

    const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    const randomImpostorIndex = Math.floor(Math.random() * gameData.players.length);

    const updatedPlayers = gameData.players.map((p, i) => ({
      ...p,
      isImpostor: i === randomImpostorIndex,
      hasRevealed: false
    }));

    setGameData(prev => ({
      ...prev,
      word: randomWord,
      players: updatedPlayers,
      impostorId: updatedPlayers[randomImpostorIndex].id,
      currentRound: 1,
      votes: {},
      startTime: Date.now()
    }));

    setCurrentPlayerIndex(0);
    setIsRevealed(false);
    setHintUsed(false);
    setShowHint(false);

    if (config.isTimedMode) {
      setTimeLeft(config.timeLimit * 60);
    }

    setGameState('revealing');
  };

  const handleReveal = () => {
    if (!isRevealed) {
      play('reveal');
      setIsRevealed(true);
      setAutoHideTimer(5);

      const updatedPlayers = [...gameData.players];
      updatedPlayers[currentPlayerIndex].hasRevealed = true;
      setGameData(prev => ({ ...prev, players: updatedPlayers }));
    } else {
      play('pop');
      setIsRevealed(false);
      setAutoHideTimer(null);
    }
  };

  const handleNextPlayer = () => {
    play('click');
    setAutoHideTimer(null);

    if (currentPlayerIndex < gameData.players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
      setIsRevealed(false);
    } else {
      setGameState('playing');
    }
  };

  const handleVote = (voterId: string, votedForId: string) => {
    play('pop');
    setGameData(prev => ({
      ...prev,
      votes: { ...prev.votes, [voterId]: votedForId }
    }));
  };

  const submitVotes = () => {
    play('click');
    setGameState('results');

    const voteCounts: Record<string, number> = {};
    Object.values(gameData.votes).forEach(votedId => {
      voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
    });

    const mostVoted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0];
    const guessedCorrectly = mostVoted && mostVoted[0] === gameData.impostorId;

    const newStats = { ...stats };
    newStats.gamesPlayed += 1;

    if (guessedCorrectly) {
      newStats.civilWins += gameData.players.length - 1;
      newStats.totalCivilGames += gameData.players.length - 1;
      play('win');
    } else {
      newStats.impostorWins += 1;
      newStats.totalImpostorGames += 1;
      play('lose');
    }

    const newAchievementIds = checkAchievements(newStats);
    if (newAchievementIds.length > 0) {
      newStats.achievements = [...new Set([...newStats.achievements, ...newAchievementIds])];
      setNewAchievements(newAchievementIds);
      setTimeout(() => play('achievement'), 500);
    }

    setStats(newStats);
    saveStats(newStats);
  };

  const resetGame = () => {
    play('click');
    setGameState('setup');
    setGameData({
      word: '',
      players: [],
      impostorId: '',
      currentRound: 1,
      votes: {},
      startTime: 0
    });
    setCurrentPlayerIndex(0);
    setIsRevealed(false);
    setTimeLeft(0);
    setNewAchievements([]);
  };

  const requestHint = () => {
    if (!hintUsed) {
      play('success');
      setHintUsed(true);
      setShowHint(true);
    }
  };

  const getHintText = () => {
    const category = t.categories[config.category];
    return `${t.hint}: ${category}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md mx-auto min-h-screen flex flex-col p-4 sm:p-6">

        <header className="mb-6 text-center relative flex justify-center items-center pt-2">
          <button
            onClick={() => setShowHelp(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
            aria-label="Help"
          >
            <HelpCircle size={20} />
          </button>

          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-600 bg-clip-text text-transparent mb-1">
              IMPOSTOR 2.0
            </h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest">{t.subtitle}</p>
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              onClick={() => setShowStats(true)}
              className="p-3 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
              aria-label="Stats"
            >
              <TrendingUp size={20} />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-full border transition-all active:scale-95 ${soundEnabled
                  ? 'bg-slate-800 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-900/20'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-600'
                }`}
              aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </header>

        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-slate-800/95 backdrop-blur p-4 border-b border-slate-700 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                  <HelpCircle size={20} />
                  {t.howToPlay}
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-6 text-sm text-slate-300 leading-relaxed">
                <p className="text-base font-medium text-white border-l-4 border-emerald-500 pl-3">
                  {t.instructions.intro}
                </p>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-white font-bold mb-2 text-base">{t.instructions.mode1Title}</h3>
                  <p>{t.instructions.mode1Desc}</p>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-white font-bold mb-2 text-base">{t.instructions.mode2Title}</h3>
                  <p>{t.instructions.mode2Desc}</p>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-white font-bold mb-2 text-base">{t.voting}</h3>
                  <p>{t.instructions.voting}</p>
                </div>

                <div className="text-xs text-slate-500 italic text-center">
                  {t.instructions.endGame}
                </div>

                <button
                  onClick={() => setShowHelp(false)}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold uppercase tracking-wide transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {showStats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-slate-800/95 backdrop-blur p-4 border-b border-slate-700 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                  <TrendingUp size={20} />
                  {t.stats}
                </h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="text-3xl font-black text-white mb-1">{stats.gamesPlayed}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">{t.gamesPlayed}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="text-3xl font-black text-emerald-400 mb-1">{stats.civilWins}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">{t.civilWins}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="text-3xl font-black text-red-400 mb-1">{stats.impostorWins}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">{t.impostorWinsStats}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="text-3xl font-black text-cyan-400 mb-1">
                      {stats.gamesPlayed > 0 ? Math.round(((stats.civilWins + stats.impostorWins) / stats.gamesPlayed) * 100) : 0}%
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">{t.winRate}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowStats(false);
                    setShowAchievements(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2"
                >
                  <Trophy size={20} />
                  {t.achievements}
                </button>

                <button
                  onClick={() => setShowStats(false)}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold uppercase tracking-wide transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAchievements && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-slate-800/95 backdrop-blur p-4 border-b border-slate-700 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                  <Trophy size={20} />
                  {t.achievements}
                </h2>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-3">
                {ACHIEVEMENTS.map(achievement => {
                  const isUnlocked = stats.achievements.includes(achievement.id);
                  const { progress, target } = getAchievementProgress(achievement.id, stats);
                  const progressPercent = Math.min((progress / target) * 100, 100);

                  return (
                    <div
                      key={achievement.id}
                      className={`bg-slate-900/50 rounded-xl p-4 border transition-all ${isUnlocked
                          ? 'border-emerald-500/50 shadow-lg shadow-emerald-900/20'
                          : 'border-slate-700/50'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-3xl ${isUnlocked ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                              {(t.achievementTexts as any)[achievement.nameKey]}
                            </h3>
                            {isUnlocked && <CheckCircle size={16} className="text-emerald-400" />}
                          </div>
                          <p className="text-xs text-slate-500 mb-2">
                            {(t.achievementTexts as any)[achievement.descKey]}
                          </p>
                          {!isUnlocked && (
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          )}
                          {!isUnlocked && (
                            <p className="text-xs text-slate-600 mt-1">{progress} / {target}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => setShowAchievements(false)}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold uppercase tracking-wide transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {newAchievements.length > 0 && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
            <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-4 shadow-2xl border-2 border-white/20 flex items-center gap-3 max-w-sm">
              <Sparkles size={24} className="text-yellow-300 animate-pulse" />
              <div>
                <p className="text-white font-bold text-sm">Nova Conquista!</p>
                <p className="text-white/90 text-xs">
                  {(t.achievementTexts as any)[ACHIEVEMENTS.find(a => a.id === newAchievements[0])?.nameKey || '']}
                </p>
              </div>
              <button
                onClick={() => setNewAchievements([])}
                className="ml-auto p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <main className="flex-grow flex flex-col justify-center">

          {gameState === 'setup' && (
            <div className="space-y-6 animate-fadeIn pb-6">

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
                <label className="block text-slate-300 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-400" />
                  {t.chooseCategory}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(CATEGORIES_PT) as CategoryKey[]).map((cat) => {
                    const isLocked = lockedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`relative p-3 rounded-xl text-sm font-bold transition-all border flex items-center justify-between gap-2 overflow-hidden ${isLocked
                            ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-pointer active:scale-95'
                            : config.category === cat
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20 scale-[1.02]'
                              : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                          }`}
                      >
                        <div className={`flex items-center gap-2 truncate flex-1 ${isLocked ? 'opacity-60' : ''}`}>
                          <span className="scale-90">{CATEGORY_ICONS[cat]}</span>
                          <span className="truncate">{t.categories[cat]}</span>
                        </div>

                        {isLocked && (
                          <div className="flex items-center justify-center pl-1">
                            <Lock size={14} className={unlockClicks[cat] > 0 ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
                            {unlockClicks[cat] > 0 && (
                              <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-300" style={{ width: `${(unlockClicks[cat] / 3) * 100}%` }} />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {lockedCategories.length > 0 && (
                  <p className="text-xs text-slate-500 mt-3 text-center italic">{t.unlockHint}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
                  <label className="block text-slate-300 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Users size={16} className="text-emerald-400" />
                    {t.players}
                  </label>
                  <div className="flex items-center justify-between bg-slate-900/50 rounded-xl p-2 border border-slate-700">
                    <button
                      onClick={() => {
                        setConfig(prev => ({ ...prev, numPlayers: Math.max(3, prev.numPlayers - 1) }));
                        play('pop');
                      }}
                      className="w-12 h-12 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-xl font-bold transition-colors active:scale-95"
                    >
                      -
                    </button>
                    <span className="text-3xl font-bold text-white tabular-nums">
                      {config.numPlayers}
                    </span>
                    <button
                      onClick={() => {
                        setConfig(prev => ({ ...prev, numPlayers: Math.min(20, prev.numPlayers + 1) }));
                        play('pop');
                      }}
                      className="w-12 h-12 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-xl font-bold transition-colors active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
                  <label className="block text-slate-300 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Gamepad2 size={16} className="text-emerald-400" />
                    {t.gameMode}
                  </label>
                  <div className="flex gap-2">
                    {(['circle', 'interrogation'] as GameMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setConfig(prev => ({ ...prev, gameMode: mode }));
                          play('pop');
                        }}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all border text-sm ${config.gameMode === mode
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                            : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                          }`}
                      >
                        {(t.gameModes as any)[mode]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 shadow-xl backdrop-blur-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-slate-300 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      {config.isTimedMode ? <Timer size={16} className="text-emerald-400" /> : <Infinity size={16} className="text-emerald-400" />}
                      {t.timeMode}
                    </label>

                    <button
                      onClick={() => {
                        setConfig(prev => ({ ...prev, isTimedMode: !prev.isTimedMode }));
                        play('pop');
                      }}
                      className="relative flex items-center bg-slate-900 rounded-full w-48 h-10 p-1 cursor-pointer border border-slate-700"
                    >
                      <div className={`absolute w-1/2 h-8 rounded-full bg-emerald-600 shadow-sm transition-all duration-300 ${config.isTimedMode ? 'translate-x-full left-[-4px]' : 'translate-x-0 left-1'}`}></div>
                      <span className={`flex-1 text-[10px] font-bold text-center z-10 transition-colors uppercase ${!config.isTimedMode ? 'text-white' : 'text-slate-500'}`}>
                        {t.free}
                      </span>
                      <span className={`flex-1 text-[10px] font-bold text-center z-10 transition-colors uppercase ${config.isTimedMode ? 'text-white' : 'text-slate-500'}`}>
                        {t.timed}
                      </span>
                    </button>
                  </div>

                  <div className={`flex gap-2 transition-all duration-300 ${!config.isTimedMode ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                    {[4, 6, 8].map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setConfig(prev => ({ ...prev, timeLimit: time }));
                          play('pop');
                        }}
                        disabled={!config.isTimedMode}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all border ${config.timeLimit === time
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                            : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                          }`}
                      >
                        {time}m
                      </button>
                    ))}
                  </div>

                  {config.isTimedMode && (
                    <div className="mt-4 flex justify-center animate-fadeIn border-t border-slate-700/50 pt-4">
                      <button
                        onClick={() => {
                          setConfig(prev => ({ ...prev, alarmEnabled: !prev.alarmEnabled }));
                          play('pop');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${config.alarmEnabled
                            ? 'bg-slate-900 border-emerald-500/50 text-emerald-400'
                            : 'bg-slate-900/50 border-slate-700 text-slate-500'
                          }`}
                      >
                        {config.alarmEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                        {t.alarm}
                        <div className={`w-2 h-2 rounded-full ml-1 ${config.alarmEnabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={startNameEntry}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide transform hover:-translate-y-1"
              >
                <Play size={24} fill="currentColor" />
                {t.start}
              </button>

              <div className="flex justify-center items-center mt-4">
                <button
                  onClick={() => {
                    setLanguage(prev => prev === 'pt' ? 'en' : 'pt');
                    play('pop');
                  }}
                  className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all active:scale-95"
                >
                  <span className={`text-xl ${language === 'pt' ? 'opacity-100 scale-110' : 'opacity-40 grayscale scale-90'} transition-all duration-300`}>🇧🇷</span>
                  <span className="text-slate-500 font-bold text-xs">|</span>
                  <span className={`text-xl ${language === 'en' ? 'opacity-100 scale-110' : 'opacity-40 grayscale scale-90'} transition-all duration-300`}>🇺🇸</span>
                  <span className="text-xs font-bold text-slate-300 ml-1 uppercase tracking-widest">
                    {language === 'pt' ? 'PT' : 'EN'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {gameState === 'playerNames' && (
            <div className="space-y-6 animate-fadeIn pb-6">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">{t.playerNames}</h2>
                <p className="text-slate-400 text-sm">{t.enterName}</p>
              </div>

              <div className="space-y-3">
                {gameData.players.map((player, index) => (
                  <div key={player.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => {
                        const newPlayers = [...gameData.players];
                        newPlayers[index].name = e.target.value;
                        setGameData(prev => ({ ...prev, players: newPlayers }));
                      }}
                      className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder={`${t.player} ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const names = generatePlayerNames();
                  const newPlayers = gameData.players.map((p, i) => ({ ...p, name: names[i] }));
                  setGameData(prev => ({ ...prev, players: newPlayers }));
                  play('pop');
                }}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                {t.generateNames}
              </button>

              <button
                onClick={startGame}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <Play size={24} fill="currentColor" />
                {t.continue}
              </button>
            </div>
          )}

          {gameState === 'revealing' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-4">
                <span className="px-4 py-2 bg-slate-800 rounded-full text-sm font-bold text-emerald-400 border border-slate-700 shadow-lg">
                  {gameData.players[currentPlayerIndex]?.name} ({currentPlayerIndex + 1} {t.of} {gameData.players.length})
                </span>
              </div>

              <div className="relative group perspective-1000">
                <div
                  onClick={handleReveal}
                  className={`cursor-pointer w-full h-96 transition-all duration-500 transform-style-3d rounded-3xl shadow-2xl border-2 relative ${isRevealed ? 'bg-slate-800 border-emerald-500 shadow-emerald-500/20' : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-emerald-500/50'
                    }`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">

                    {!isRevealed ? (
                      <>
                        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                          <HelpCircle size={48} className="text-slate-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3">{gameData.players[currentPlayerIndex]?.name}</h3>
                        <p className="text-slate-400 font-medium">{t.tapReveal}</p>
                        <div className="mt-8 px-4 py-2 bg-slate-700/50 rounded-lg text-sm text-emerald-300 font-bold flex items-center gap-2 border border-slate-600">
                          <Eye size={16} />
                          {t.revealBtn}
                        </div>
                      </>
                    ) : (
                      <div className="animate-fadeIn flex flex-col items-center w-full">
                        {gameData.players[currentPlayerIndex]?.isImpostor ? (
                          <>
                            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border-2 border-red-500/50">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M8 10l4 4 4-4" />
                              </svg>
                            </div>

                            <div className="mb-4 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                              <span className="text-emerald-400 scale-75">{CATEGORY_ICONS[config.category]}</span>
                              {t.categories[config.category]}
                            </div>

                            <h2 className="text-4xl font-black text-red-500 mb-3 uppercase tracking-widest">{t.impostor}</h2>
                            <p className="text-red-200/80 font-medium bg-red-500/10 px-4 py-2 rounded-lg text-sm">
                              {t.impostorDesc}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-500/50">
                              <span className="text-3xl">{CATEGORY_ICONS[config.category]}</span>
                            </div>

                            <div className="mb-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                              {t.categories[config.category]}
                            </div>

                            <p className="text-emerald-400 uppercase tracking-widest text-xs font-bold mb-2">{t.secretIs}</p>
                            <h2 className="text-3xl font-black text-white break-words w-full leading-tight">{gameData.word}</h2>
                          </>
                        )}
                        <div className="mt-12 text-slate-500 text-xs flex items-center gap-2 font-medium uppercase tracking-wide">
                          <EyeOff size={14} />
                          {t.tapHide}
                          {autoHideTimer !== null && autoHideTimer > 0 && (
                            <span className="ml-2 text-emerald-400">({autoHideTimer}s)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isRevealed && gameData.players[currentPlayerIndex]?.hasRevealed && (
                <button
                  onClick={handleNextPlayer}
                  className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-xl"
                >
                  {currentPlayerIndex < gameData.players.length - 1 ? t.nextPlayer : t.startRound}
                </button>
              )}
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-6 animate-fadeIn pb-8">
              <div className={`border rounded-2xl p-6 text-center shadow-xl transition-colors duration-500 ${config.isTimedMode && timeLeft === 0 ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-800/50 border-slate-700'
                }`}>
                <div className="flex items-center justify-center gap-2 mb-2 text-slate-400 text-xs uppercase tracking-widest font-bold">
                  {config.isTimedMode ? <Clock size={14} /> : <Infinity size={14} />}
                  {config.isTimedMode ? t.timeLeft : t.freeTime}
                </div>

                {config.isTimedMode ? (
                  <div className={`text-6xl font-black tabular-nums tracking-tight ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white'
                    }`}>
                    {formatTime(timeLeft)}
                  </div>
                ) : (
                  <div className="text-6xl font-black text-white flex justify-center py-2">
                    <Infinity size={64} className="text-emerald-400/50" />
                  </div>
                )}

                {config.isTimedMode && timeLeft === 0 && (
                  <div className="mt-2 text-red-400 font-bold uppercase text-sm">{t.timesUp}</div>
                )}
                {!config.isTimedMode && (
                  <div className="mt-2 text-slate-500 font-medium text-sm">{t.discuss}</div>
                )}
              </div>

              {config.difficulty === 'hard' && !hintUsed && (
                <button
                  onClick={requestHint}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <AlertCircle size={20} />
                  {t.askHint}
                </button>
              )}

              {showHint && (
                <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 text-center animate-fadeIn">
                  <p className="text-amber-400 font-bold">{getHintText()}</p>
                </div>
              )}

              <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-emerald-400">{CATEGORY_ICONS[config.category]}</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">{t.possible} {t.categories[config.category]}</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                  {currentCategories[config.category].map(word => (
                    <div key={word} className="p-2 rounded bg-slate-900/50 border border-slate-800 text-center font-medium truncate">
                      {word}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setGameState('voting')}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ChevronRight size={24} />
                {t.voting}
              </button>
            </div>
          )}

          {gameState === 'voting' && (
            <div className="space-y-6 animate-fadeIn pb-8">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">{t.voting}</h2>
                <p className="text-slate-400 text-sm">{t.voteFor}</p>
              </div>

              <div className="space-y-3">
                {gameData.players.map((voter) => (
                  <div key={voter.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="font-bold text-white mb-3 flex items-center gap-2">
                      <Users size={16} className="text-emerald-400" />
                      {voter.name}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {gameData.players.map((candidate) => (
                        <button
                          key={candidate.id}
                          onClick={() => handleVote(voter.id, candidate.id)}
                          className={`py-2 px-3 rounded-lg font-medium transition-all border text-sm ${gameData.votes[voter.id] === candidate.id
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                              : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                          {candidate.name === voter.name ? `${candidate.name} (?)` : candidate.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={submitVotes}
                disabled={Object.keys(gameData.votes).length !== gameData.players.length}
                className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wide ${Object.keys(gameData.votes).length === gameData.players.length
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-900/30 active:scale-[0.98]'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
              >
                <CheckCircle size={24} />
                {t.confirm}
              </button>
            </div>
          )}

          {gameState === 'results' && (
            <div className="space-y-6 animate-fadeIn pb-8">
              <div className="text-center mb-4">
                {(() => {
                  const voteCounts: Record<string, number> = {};
                  Object.values(gameData.votes).forEach(votedId => {
                    voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
                  });
                  const mostVoted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0];
                  const guessedCorrectly = mostVoted && mostVoted[0] === gameData.impostorId;
                  const impostorPlayer = gameData.players.find(p => p.id === gameData.impostorId);

                  return (
                    <>
                      <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 border-4 ${guessedCorrectly
                          ? 'bg-emerald-500/10 border-emerald-500/50'
                          : 'bg-red-500/10 border-red-500/50'
                        }`}>
                        {guessedCorrectly ? (
                          <CheckCircle size={64} className="text-emerald-500" />
                        ) : (
                          <X size={64} className="text-red-500" />
                        )}
                      </div>

                      <h2 className={`text-3xl font-black mb-2 ${guessedCorrectly ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        {guessedCorrectly ? t.civilsWin : t.impostorWins}
                      </h2>

                      <p className="text-slate-400 text-sm mb-4">
                        {guessedCorrectly ? t.correctGuess : t.wrongGuess}
                      </p>

                      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-4">
                        <p className="text-slate-400 text-sm mb-2">{t.theImpostorWas}</p>
                        <p className="text-2xl font-black text-white">{impostorPlayer?.name}</p>
                        <p className="text-slate-500 text-sm mt-2">{t.secretIs}: <span className="text-emerald-400 font-bold">{gameData.word}</span></p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <button
                onClick={resetGame}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <RotateCcw size={24} />
                {t.playAgain}
              </button>
            </div>
          )}

        </main>

        <footer className="mt-auto pt-6 text-center text-slate-700 text-[10px] uppercase tracking-widest font-bold">
          Desenvolvido por UP Games - Impostor 2.0 Supremacy
        </footer>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
