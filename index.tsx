import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Users, Eye, EyeOff, Play, RotateCcw, MapPin, HelpCircle, 
  Utensils, PawPrint, Briefcase, Package, Clock, Film, Tv,
  Gamepad2, Zap, Star, Lock, Infinity, Timer, Volume2, VolumeX, Bell, BellOff, X
} from 'lucide-react';

// Configuration constants
type CategoryKey = 'Lugares' | 'Comidas' | 'Animais' | 'Objetos' | 'Profissões' | 'Filmes' | 'Séries' | 'Disney' | 'Heróis' | 'Videogames';
type Language = 'pt' | 'en';

const CATEGORIES_PT: Record<CategoryKey, string[]> = {
  'Lugares': [
    "Floresta", "Restaurante Japonês", "Parque de Diversões", "Praia", "Escola",
    "Hospital", "Avião", "Submarino", "Estação Espacial", "Supermercado",
    "Banco", "Cruzeiro", "Circo", "Hotel", "Museu",
    "Estádio de Futebol", "Delegacia", "Cemitério", "Biblioteca", "Base Militar"
  ],
  'Comidas': [
    "Pizza", "Sushi", "Hambúrguer", "Churrasco", "Feijoada",
    "Lasanha", "Sorvete", "Chocolate", "Pipoca", "Batata Frita",
    "Salada", "Sopa", "Pão de Queijo", "Açaí", "Bolo de Cenoura",
    "Torta de Limão", "Pastel", "Coxinha", "Hot Dog", "Taco"
  ],
  'Animais': [
    "Leão", "Elefante", "Girafa", "Macaco", "Cachorro",
    "Gato", "Cavalo", "Tigre", "Tubarão", "Baleia",
    "Águia", "Papagaio", "Pinguim", "Cobra", "Jacaré",
    "Urso", "Canguru", "Panda", "Lobo", "Raposa"
  ],
  'Objetos': [
    "Celular", "Computador", "Caneta", "Cadeira", "Mesa",
    "Carro", "Bicicleta", "Livro", "Óculos", "Relógio",
    "Tênis", "Mochila", "Chave", "Escova de Dentes", "Garfo",
    "Faca", "Prato", "Copo", "Tesoura", "Guarda-chuva"
  ],
  'Profissões': [
    "Médico", "Professor", "Bombeiro", "Policial", "Engenheiro",
    "Advogado", "Cozinheiro", "Astronauta", "Piloto", "Cantor",
    "Ator", "Dentista", "Veterinário", "Arquiteto", "Mecânico",
    "Eletricista", "Padeiro", "Juiz", "Motorista", "Cientista"
  ],
  'Filmes': [
    "Titanic", "Avatar", "O Rei Leão", "Vingadores", "Harry Potter",
    "Star Wars", "Jurassic Park", "O Poderoso Chefão", "Matrix", "Homem-Aranha",
    "Frozen", "Toy Story", "O Senhor dos Anéis", "Piratas do Caribe", "Batman",
    "Tubarão", "Forrest Gump", "Shrek", "A Bela e a Fera", "De Volta para o Futuro"
  ],
  'Séries': [
    "Breaking Bad", "Game of Thrones", "Stranger Things", "Friends", "The Walking Dead",
    "Grey's Anatomy", "La Casa de Papel", "Black Mirror", "The Office", "Vikings",
    "The Crown", "Lost", "The Boys", "Round 6", "Dark",
    "Peaky Blinders", "House of Cards", "The Mandalorian", "Supernatural", "Prison Break"
  ],
  'Disney': [
    "Mickey Mouse", "Elsa", "Simba", "Woody", "Buzz Lightyear",
    "Cinderela", "Branca de Neve", "Ariel", "Aladdin", "Gênio",
    "Mulan", "Stitch", "Moana", "Ursinho Pooh", "Sininho",
    "Capitão Gancho", "Malévola", "Relâmpago McQueen", "Pato Donald", "Pateta"
  ],
  'Heróis': [
    "Batman", "Superman", "Homem-Aranha", "Homem de Ferro", "Capitão América",
    "Thor", "Hulk", "Mulher Maravilha", "Flash", "Aquaman",
    "Viúva Negra", "Pantera Negra", "Wolverine", "Deadpool", "Doutor Estranho",
    "Homem-Formiga", "Lanterna Verde", "Robin", "Supergirl", "Jean Grey"
  ],
  'Videogames': [
    "Super Mario", "Sonic", "Pikachu", "Link (Zelda)", "Steve (Minecraft)",
    "Kratos", "Master Chief", "Pac-Man", "Donkey Kong", "Lara Croft",
    "Crash Bandicoot", "Ryu", "Cloud Strife", "Scorpion", "Sub-Zero",
    "Kirby", "Mega Man", "Leon Kennedy", "Geralt", "Ellie (TLOU)"
  ]
};

const CATEGORIES_EN: Record<CategoryKey, string[]> = {
  'Lugares': [
    "Forest", "Sushi Restaurant", "Amusement Park", "Beach", "School",
    "Hospital", "Airplane", "Submarine", "Space Station", "Supermarket",
    "Bank", "Cruise Ship", "Circus", "Hotel", "Museum",
    "Soccer Stadium", "Police Station", "Cemetery", "Library", "Military Base"
  ],
  'Comidas': [
    "Pizza", "Sushi", "Burger", "BBQ", "Bean Stew",
    "Lasagna", "Ice Cream", "Chocolate", "Popcorn", "French Fries",
    "Salad", "Soup", "Cheese Bread", "Açaí", "Carrot Cake",
    "Lime Pie", "Pastry", "Chicken Croquette", "Hot Dog", "Taco"
  ],
  'Animais': [
    "Lion", "Elephant", "Giraffe", "Monkey", "Dog",
    "Cat", "Horse", "Tiger", "Shark", "Whale",
    "Eagle", "Parrot", "Penguin", "Snake", "Alligator",
    "Bear", "Kangaroo", "Panda", "Wolf", "Fox"
  ],
  'Objetos': [
    "Cellphone", "Computer", "Pen", "Chair", "Table",
    "Car", "Bicycle", "Book", "Glasses", "Watch",
    "Sneakers", "Backpack", "Key", "Toothbrush", "Fork",
    "Knife", "Plate", "Cup", "Scissors", "Umbrella"
  ],
  'Profissões': [
    "Doctor", "Teacher", "Firefighter", "Police Officer", "Engineer",
    "Lawyer", "Chef", "Astronaut", "Pilot", "Singer",
    "Actor", "Dentist", "Veterinarian", "Architect", "Mechanic",
    "Electrician", "Baker", "Judge", "Driver", "Scientist"
  ],
  'Filmes': [
    "Titanic", "Avatar", "The Lion King", "Avengers", "Harry Potter",
    "Star Wars", "Jurassic Park", "The Godfather", "The Matrix", "Spider-Man",
    "Frozen", "Toy Story", "Lord of the Rings", "Pirates of the Caribbean", "Batman",
    "Jaws", "Forrest Gump", "Shrek", "Beauty and the Beast", "Back to the Future"
  ],
  'Séries': [
    "Breaking Bad", "Game of Thrones", "Stranger Things", "Friends", "The Walking Dead",
    "Grey's Anatomy", "Money Heist", "Black Mirror", "The Office", "Vikings",
    "The Crown", "Lost", "The Boys", "Squid Game", "Dark",
    "Peaky Blinders", "House of Cards", "The Mandalorian", "Supernatural", "Prison Break"
  ],
  'Disney': [
    "Mickey Mouse", "Elsa", "Simba", "Woody", "Buzz Lightyear",
    "Cinderella", "Snow White", "Ariel", "Aladdin", "Genie",
    "Mulan", "Stitch", "Moana", "Winnie the Pooh", "Tinkerbell",
    "Captain Hook", "Maleficent", "Lightning McQueen", "Donald Duck", "Goofy"
  ],
  'Heróis': [
    "Batman", "Superman", "Spider-Man", "Iron Man", "Captain America",
    "Thor", "Hulk", "Wonder Woman", "Flash", "Aquaman",
    "Black Widow", "Black Panther", "Wolverine", "Deadpool", "Dr. Strange",
    "Ant-Man", "Green Lantern", "Robin", "Supergirl", "Jean Grey"
  ],
  'Videogames': [
    "Super Mario", "Sonic", "Pikachu", "Link (Zelda)", "Steve (Minecraft)",
    "Kratos", "Master Chief", "Pac-Man", "Donkey Kong", "Lara Croft",
    "Crash Bandicoot", "Ryu", "Cloud Strife", "Scorpion", "Sub-Zero",
    "Kirby", "Mega Man", "Leon Kennedy", "Geralt", "Ellie (TLOU)"
  ]
};

const UI_TEXT = {
  pt: {
    subtitle: "Descubra quem está mentindo",
    chooseCategory: "Escolha a Categoria",
    players: "Jogadores",
    timeMode: "Modo de Tempo",
    free: "Livre",
    timed: "Timer",
    alarm: "Alarme",
    start: "Iniciar Jogo",
    player: "Jogador",
    of: "de",
    tapReveal: "Toque no cartão para revelar sua função secreta",
    revealBtn: "Revelar Identidade",
    impostor: "IMPOSTOR",
    impostorDesc: "Esconda sua identidade! Tente descobrir qual é o segredo.",
    secretIs: "O Segredo é",
    tapHide: "Toque para esconder",
    nextPlayer: "Próximo Jogador",
    startRound: "Começar Rodada",
    timeLeft: "Tempo Restante",
    freeTime: "Tempo Livre",
    timesUp: "Tempo Esgotado!",
    discuss: "Discutam à vontade",
    possible: "Possíveis",
    playAgain: "Jogar Novamente",
    locked: "Bloqueado",
    howToPlay: "Como Jogar",
    close: "Fechar",
    instructions: {
      intro: "Um jogador é o Impostor, os outros são Civis. Os Civis sabem a palavra secreta, o Impostor não.",
      mode1Title: "Modo 1: Roda de Amigos",
      mode1Desc: "Todos veem a palavra (menos o impostor). Em ordem, cada um diz uma palavra ou frase curta sobre o segredo. O Impostor tenta se misturar. Se tiver mais de 5 pessoas, sugerimos apenas 2 rodadas de falas.",
      mode2Title: "Modo 2: Perguntas",
      mode2Desc: "Os jogadores fazem perguntas uns aos outros. Quem responde faz a próxima pergunta. Se suspeitarem de alguém, pressionem com mais perguntas!",
      endGame: "O jogo acaba quando o tempo esgota (se usar Timer) ou quando decidirem votar em quem é o Impostor."
    },
    categories: {
      'Lugares': "Lugares",
      'Comidas': "Comidas",
      'Animais': "Animais",
      'Objetos': "Objetos",
      'Profissões': "Profissões",
      'Filmes': "Filmes",
      'Séries': "Séries",
      'Disney': "Disney",
      'Heróis': "Heróis",
      'Videogames': "Videogames"
    }
  },
  en: {
    subtitle: "Find out who is lying",
    chooseCategory: "Choose Category",
    players: "Players",
    timeMode: "Time Mode",
    free: "Free",
    timed: "Timer",
    alarm: "Alarm",
    start: "Start Game",
    player: "Player",
    of: "of",
    tapReveal: "Tap the card to reveal your secret role",
    revealBtn: "Reveal Identity",
    impostor: "IMPOSTOR",
    impostorDesc: "Hide your identity! Try to figure out the secret.",
    secretIs: "The Secret is",
    tapHide: "Tap to hide",
    nextPlayer: "Next Player",
    startRound: "Start Round",
    timeLeft: "Time Remaining",
    freeTime: "Free Time",
    timesUp: "Time's Up!",
    discuss: "Discuss freely",
    possible: "Possible",
    playAgain: "Play Again",
    locked: "Locked",
    howToPlay: "How to Play",
    close: "Close",
    instructions: {
      intro: "One player is the Impostor, others are Civilians. Civilians know the secret word, the Impostor does not.",
      mode1Title: "Mode 1: The Circle",
      mode1Desc: "Everyone sees the word (except the impostor). In order, each person says one word or short phrase about the secret. The Impostor tries to blend in. For more than 5 players, we suggest just 2 rounds of talking.",
      mode2Title: "Mode 2: Questions",
      mode2Desc: "Players ask each other questions. The person answering asks the next question. If you suspect someone, drill them with more questions!",
      endGame: "The game ends when time runs out (if using Timer) or when you decide to vote on who the Impostor is."
    },
    categories: {
      'Lugares': "Places",
      'Comidas': "Food",
      'Animais': "Animals",
      'Objetos': "Objects",
      'Profissões': "Professions",
      'Filmes': "Movies",
      'Séries': "TV Shows",
      'Disney': "Disney",
      'Heróis': "Heroes",
      'Videogames': "Videogames"
    }
  }
};

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

// Initial locked categories
const INITIAL_LOCKED: CategoryKey[] = ['Disney', 'Heróis', 'Videogames'];

type GameState = 'setup' | 'revealing' | 'playing';

// --- Sound Manager ---
const createAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return AudioContext ? new AudioContext() : null;
};

let globalAudioCtx: AudioContext | null = null;

const playSoundEffect = (type: 'click' | 'pop' | 'success' | 'reveal' | 'alarm' | 'lock', enabled: boolean) => {
  if (!enabled) return;
  
  try {
    if (!globalAudioCtx) {
      globalAudioCtx = createAudioContext();
    }
    
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }

    if (!globalAudioCtx) return;

    const ctx = globalAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click': // High-tech blip for main actions
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
        
      case 'pop': // Softer interaction
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'success': // Unlock / Success
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.05, now + i * 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + i * 0.05);
          o.start(now + i * 0.05);
          o.stop(now + 0.6 + i * 0.05);
        });
        break;

      case 'reveal': // Suspense/Reveal
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.4);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'lock': // Error/Lock
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'alarm': // Time's up
        for(let i=0; i<3; i++) {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'square';
          o.frequency.setValueAtTime(880, now + i * 0.4);
          g.gain.setValueAtTime(0.1, now + i * 0.4);
          g.gain.linearRampToValueAtTime(0, now + i * 0.4 + 0.2);
          o.start(now + i * 0.4);
          o.stop(now + i * 0.4 + 0.2);
        }
        break;
    }
  } catch (e) {
    console.error("Audio error:", e);
  }
};


const App = () => {
  const [language, setLanguage] = useState<Language>('pt');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState<GameState>('setup');
  const [showHelp, setShowHelp] = useState(false);
  
  // Setup State
  const [numPlayers, setNumPlayers] = useState(4);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('Lugares');
  const [selectedTime, setSelectedTime] = useState(4); // minutes
  
  // New Setup Features
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [alarmEnabled, setAlarmEnabled] = useState(true); // New state for alarm
  const [lockedCategories, setLockedCategories] = useState<CategoryKey[]>(INITIAL_LOCKED);
  const [unlockClicks, setUnlockClicks] = useState<Record<string, number>>({});

  // Game Data State
  const [currentWord, setCurrentWord] = useState('');
  const [impostorIndex, setImpostorIndex] = useState<number | null>(null);
  
  // Revealing Phase State
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Playing Phase State (Timer)
  const [timeLeft, setTimeLeft] = useState(0); // seconds

  // Derived state for current language content
  const t = UI_TEXT[language];
  const currentCategories = language === 'pt' ? CATEGORIES_PT : CATEGORIES_EN;

  // Helper for sounds
  const play = (type: 'click' | 'pop' | 'success' | 'reveal' | 'alarm' | 'lock') => {
    playSoundEffect(type, soundEnabled);
  };

  useEffect(() => {
    let interval: any;
    if (gameState === 'playing' && isTimedMode && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Check alarmEnabled directly here to allow alarm even if UI sounds are off
            if (alarmEnabled) {
              playSoundEffect('alarm', true);
              // Vibrate if supported
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([500, 200, 500, 200, 500]);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft, isTimedMode, soundEnabled, alarmEnabled]);

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
        // Unlock
        setLockedCategories(prev => prev.filter(c => c !== cat));
        setSelectedCategory(cat);
        play('success');
      } else {
        play('lock');
      }
    } else {
      setSelectedCategory(cat);
      play('click');
    }
  };

  const startGame = () => {
    play('click');
    const categoryWords = currentCategories[selectedCategory];
    const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    const randomImpostor = Math.floor(Math.random() * numPlayers);
    
    setCurrentWord(randomWord);
    setImpostorIndex(randomImpostor);
    setCurrentPlayerIndex(0);
    setIsRevealed(false);
    
    if (isTimedMode) {
      setTimeLeft(selectedTime * 60);
    }
    
    setGameState('revealing');
  };

  const handleNextPlayer = () => {
    play('click');
    if (currentPlayerIndex < numPlayers - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
      setIsRevealed(false);
    } else {
      setGameState('playing');
    }
  };

  const resetGame = () => {
    play('click');
    setGameState('setup');
    setCurrentWord('');
    setImpostorIndex(null);
    setCurrentPlayerIndex(0);
    setIsRevealed(false);
  };

  const toggleLanguage = () => {
    play('pop');
    setLanguage(prev => prev === 'pt' ? 'en' : 'pt');
  };

  const toggleSound = () => {
    // We play a sound immediately if turning ON, otherwise silence
    if (!soundEnabled) {
      // Forced true for this specific call to give feedback
      playSoundEffect('pop', true);
    }
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      <div className="max-w-md mx-auto min-h-screen flex flex-col p-4 sm:p-6">
        
        {/* Header */}
        <header className="mb-6 text-center relative flex justify-center items-center pt-2">
          <button 
            onClick={() => setShowHelp(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
            aria-label="Help"
          >
            <HelpCircle size={20} />
          </button>

          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-1">
              IMPOSTOR
            </h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest">{t.subtitle}</p>
          </div>

          <button 
            onClick={toggleSound}
            className={`absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full border transition-all active:scale-95 ${
              soundEnabled 
                ? 'bg-slate-800 border-purple-500/30 text-purple-400 shadow-lg shadow-purple-900/20' 
                : 'bg-slate-800/50 border-slate-700/50 text-slate-600'
            }`}
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </header>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-slate-800/95 backdrop-blur p-4 border-b border-slate-700 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
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
                <p className="text-base font-medium text-white border-l-4 border-purple-500 pl-3">
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

        {/* Game Content */}
        <main className="flex-grow flex flex-col justify-center">
          
          {/* SETUP SCREEN */}
          {gameState === 'setup' && (
            <div className="space-y-6 animate-fadeIn pb-6">
              
              {/* Category Selection */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
                <label className="block text-slate-300 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-purple-400" />
                  {t.chooseCategory}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(CATEGORIES_PT) as CategoryKey[]).map((cat) => {
                    const isLocked = lockedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`relative p-3 rounded-xl text-sm font-bold transition-all border flex items-center justify-between gap-2 overflow-hidden ${
                          isLocked
                            ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-pointer active:scale-95' 
                            : selectedCategory === cat 
                              ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20 scale-[1.02]' 
                              : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <div className={`flex items-center gap-2 truncate flex-1 ${isLocked ? 'opacity-60' : ''}`}>
                          <span>{CATEGORY_ICONS[cat]}</span>
                          <span className="truncate">{t.categories[cat]}</span>
                        </div>
                        
                        {isLocked && (
                          <div className="flex items-center justify-center pl-1">
                             <Lock size={14} className={unlockClicks[cat] > 0 ? "text-purple-400 animate-pulse" : "text-slate-500"} />
                             {/* Progress bar for unlocking */}
                             {unlockClicks[cat] > 0 && (
                               <div className="absolute bottom-0 left-0 h-1 bg-purple-500 transition-all duration-300" style={{ width: `${(unlockClicks[cat] / 3) * 100}%` }} />
                             )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Game Config */}
              <div className="grid grid-cols-1 gap-4">
                {/* Players */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
                  <label className="block text-slate-300 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Users size={16} className="text-purple-400" />
                    {t.players}
                  </label>
                  <div className="flex items-center justify-between bg-slate-900/50 rounded-xl p-2 border border-slate-700">
                    <button 
                      onClick={() => {
                         setNumPlayers(Math.max(3, numPlayers - 1));
                         play('pop');
                      }}
                      className="w-12 h-12 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-xl font-bold transition-colors active:scale-95"
                    >
                      -
                    </button>
                    <span className="text-3xl font-bold text-white tabular-nums">
                      {numPlayers}
                    </span>
                    <button 
                      onClick={() => {
                        setNumPlayers(Math.min(20, numPlayers + 1));
                        play('pop');
                      }}
                      className="w-12 h-12 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-xl font-bold transition-colors active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Time Control */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 shadow-xl backdrop-blur-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-slate-300 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      {isTimedMode ? <Timer size={16} className="text-purple-400" /> : <Infinity size={16} className="text-purple-400" />}
                      {t.timeMode}
                    </label>
                    
                    {/* Toggle Switch */}
                    <button 
                      onClick={() => {
                        setIsTimedMode(!isTimedMode);
                        play('pop');
                      }}
                      className="relative flex items-center bg-slate-900 rounded-full w-48 h-10 p-1 cursor-pointer border border-slate-700"
                    >
                      <div className={`absolute w-1/2 h-8 rounded-full bg-purple-600 shadow-sm transition-all duration-300 ${isTimedMode ? 'translate-x-full left-[-4px]' : 'translate-x-0 left-1'}`}></div>
                      <span className={`flex-1 text-[10px] font-bold text-center z-10 transition-colors uppercase ${!isTimedMode ? 'text-white' : 'text-slate-500'}`}>
                        {t.free}
                      </span>
                      <span className={`flex-1 text-[10px] font-bold text-center z-10 transition-colors uppercase ${isTimedMode ? 'text-white' : 'text-slate-500'}`}>
                        {t.timed}
                      </span>
                    </button>
                  </div>

                  <div className={`flex gap-2 transition-all duration-300 ${!isTimedMode ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                    {[4, 6, 8].map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          play('pop');
                        }}
                        disabled={!isTimedMode}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all border ${
                          selectedTime === time
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                            : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {time}m
                      </button>
                    ))}
                  </div>

                  {/* Alarm Toggle */}
                  {isTimedMode && (
                    <div className="mt-4 flex justify-center animate-fadeIn border-t border-slate-700/50 pt-4">
                      <button
                        onClick={() => {
                          setAlarmEnabled(!alarmEnabled);
                          play('pop');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${
                          alarmEnabled 
                            ? 'bg-slate-900 border-purple-500/50 text-purple-400' 
                            : 'bg-slate-900/50 border-slate-700 text-slate-500'
                        }`}
                      >
                        {alarmEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                        {t.alarm}
                        <div className={`w-2 h-2 rounded-full ml-1 ${alarmEnabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`} />
                      </button>
                    </div>
                  )}

                </div>
              </div>

              <button 
                onClick={startGame}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-black text-lg shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide transform hover:-translate-y-1"
              >
                <Play size={24} fill="currentColor" />
                {t.start}
              </button>

              {/* Language Toggle */}
              <div className="flex justify-center items-center mt-4">
                <button 
                  onClick={toggleLanguage}
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

          {/* REVEALING SCREEN */}
          {gameState === 'revealing' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-4">
                <span className="px-4 py-2 bg-slate-800 rounded-full text-sm font-bold text-purple-400 border border-slate-700 shadow-lg">
                  {t.player} {currentPlayerIndex + 1} {t.of} {numPlayers}
                </span>
              </div>

              <div className="relative group perspective-1000">
                <div 
                  onClick={() => {
                    play(isRevealed ? 'pop' : 'reveal');
                    setIsRevealed(!isRevealed);
                  }}
                  className={`cursor-pointer w-full h-96 transition-all duration-500 transform-style-3d rounded-3xl shadow-2xl border-2 relative ${isRevealed ? 'bg-slate-800 border-purple-500 shadow-purple-500/20' : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-purple-500/50'}`}
                >
                  {/* Card Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    
                    {!isRevealed ? (
                      <>
                        <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                          <HelpCircle size={48} className="text-slate-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3">{t.player} {currentPlayerIndex + 1}</h3>
                        <p className="text-slate-400 font-medium">{t.tapReveal}</p>
                        <div className="mt-8 px-4 py-2 bg-slate-700/50 rounded-lg text-sm text-purple-300 font-bold flex items-center gap-2 border border-slate-600">
                          <Eye size={16} />
                          {t.revealBtn}
                        </div>
                      </>
                    ) : (
                      <div className="animate-fadeIn flex flex-col items-center w-full">
                        {currentPlayerIndex === impostorIndex ? (
                          <>
                            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border-2 border-red-500/50">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M8 10l4 4 4-4" />
                              </svg>
                            </div>
                            
                            <div className="mb-4 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="text-purple-400 scale-75">{CATEGORY_ICONS[selectedCategory]}</span>
                                {t.categories[selectedCategory]}
                            </div>

                            <h2 className="text-4xl font-black text-red-500 mb-3 uppercase tracking-widest">{t.impostor}</h2>
                            <p className="text-red-200/80 font-medium bg-red-500/10 px-4 py-2 rounded-lg text-sm">
                              {t.impostorDesc}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-500/50">
                                {CATEGORY_ICONS[selectedCategory]}
                            </div>
                            
                            <div className="mb-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                {t.categories[selectedCategory]}
                            </div>

                            <p className="text-emerald-400 uppercase tracking-widest text-xs font-bold mb-2">{t.secretIs}</p>
                            <h2 className="text-3xl font-black text-white break-words w-full leading-tight">{currentWord}</h2>
                          </>
                        )}
                        <div className="mt-12 text-slate-500 text-xs flex items-center gap-2 font-medium uppercase tracking-wide">
                          <EyeOff size={14} />
                          {t.tapHide}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isRevealed && (
                <button 
                  onClick={handleNextPlayer}
                  className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-xl"
                >
                  {currentPlayerIndex < numPlayers - 1 ? t.nextPlayer : t.startRound}
                </button>
              )}
            </div>
          )}

          {/* PLAYING SCREEN */}
          {gameState === 'playing' && (
            <div className="space-y-6 animate-fadeIn pb-8">
              {/* Timer Card / Status Card */}
              <div className={`border rounded-2xl p-6 text-center shadow-xl transition-colors duration-500 ${isTimedMode && timeLeft === 0 ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                <div className="flex items-center justify-center gap-2 mb-2 text-slate-400 text-xs uppercase tracking-widest font-bold">
                  {isTimedMode ? <Clock size={14} /> : <Infinity size={14} />}
                  {isTimedMode ? t.timeLeft : t.freeTime}
                </div>
                
                {isTimedMode ? (
                  <div className={`text-6xl font-black tabular-nums tracking-tight ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                  </div>
                ) : (
                  <div className="text-6xl font-black text-white flex justify-center py-2">
                    <Infinity size={64} className="text-purple-400/50" />
                  </div>
                )}

                {isTimedMode && timeLeft === 0 && (
                   <div className="mt-2 text-red-400 font-bold uppercase text-sm">{t.timesUp}</div>
                )}
                {!isTimedMode && (
                   <div className="mt-2 text-slate-500 font-medium text-sm">{t.discuss}</div>
                )}
              </div>

              <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-purple-400">{CATEGORY_ICONS[selectedCategory]}</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">{t.possible} {t.categories[selectedCategory]}</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                  {currentCategories[selectedCategory].map(word => (
                    <div key={word} className="p-2 rounded bg-slate-900/50 border border-slate-800 text-center font-medium truncate">
                      {word}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={resetGame}
                className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                {t.playAgain}
              </button>
            </div>
          )}

        </main>
        
        <footer className="mt-auto pt-6 text-center text-slate-700 text-[10px] uppercase tracking-widest font-bold">
          Desenvolvido por UP Games
        </footer>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);