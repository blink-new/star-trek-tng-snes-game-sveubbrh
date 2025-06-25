import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Viewscreen3D from './components/3DViewscreen';
import { 
  LCARSButton, 
  LCARSPanel, 
  LCARSProgress, 
  LCARSStatus, 
  LCARSData, 
  LCARSAlert,
  LCARSTerminal,
  LCARS_COLORS 
} from './components/LCARSComponents';
import { StarSystemAI, type StarSystem } from './utils/StarSystemAI';
import './snes-effects.css';

// Enhanced Type definitions
interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  species: string;
  level: number;
  stats: {
    leadership: number;
    tactical: number;
    diplomacy: number;
    science: number;
    engineering: number;
  };
}

interface Player {
  name: string;
  species: string;
  backstory: string;
  ship: string;
  quadrant: { x: number; y: number };
  sector: { x: number; y: number };
  warpCore: number;
  shields: number;
  hull: number;
  credits: number;
  morality: number;
  stats: {
    leadership: number;
    tactical: number;
    diplomacy: number;
    science: number;
    engineering: number;
  };
  inventory: string[];
  crew: CrewMember[];
}

interface Enemy {
  id: number;
  name: string;
  faction: string;
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number];
  shields: number;
  hull: number;
  aiState: 'patrol' | 'attack' | 'retreat' | 'idle';
}

interface Mission {
  id: string;
  title: string;
  description: string;
  targetSystem: string;
  reward: number;
  status: 'available' | 'active' | 'completed';
  type: 'exploration' | 'diplomatic' | 'rescue' | 'combat';
}

interface AlertMessage {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  visible: boolean;
}

function StarTrekGame() {
  // Game State
  const [gameState, setGameState] = useState("main-menu");
  const [viewMode, setViewMode] = useState("bridge");
  const [warpSpeed, setWarpSpeed] = useState(0);
  const [isWarping, setIsWarping] = useState(false);
  const [currentSystem, setCurrentSystem] = useState<StarSystem | null>(null);
  const [systems, setSystems] = useState<StarSystem[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [viewscreenMode, setViewscreenMode] = useState('tactical');
  const [soundVolume, setSoundVolume] = useState(70);
  const [effectsVolume, setEffectsVolume] = useState(80);
  const [showSettings, setShowSettings] = useState(false);
  
  const audioContextRef = useRef<AudioContext>();

  // Player state
  const [player, setPlayer] = useState<Player>({
    name: "",
    species: "",
    backstory: "",
    ship: "USS Enterprise NCC-1701-D",
    quadrant: { x: 0, y: 0 },
    sector: { x: 5, y: 5 },
    warpCore: 100,
    shields: 100,
    hull: 100,
    credits: 1000,
    morality: 0,
    stats: {
      leadership: 50,
      tactical: 50,
      diplomacy: 50,
      science: 50,
      engineering: 50,
    },
    inventory: [],
    crew: []
  });

  // Species data with enhanced bonuses
  const species = [
    {
      name: "Human",
      description: "Versatile and diplomatic, humans excel in leadership and exploration.",
      bonuses: { leadership: 10, diplomacy: 5 },
      homeworld: "Earth",
      traits: ["Adaptable", "Curious", "Diplomatic"]
    },
    {
      name: "Vulcan",
      description: "Logical and scientific, Vulcans have superior analytical abilities.",
      bonuses: { science: 15, diplomacy: 5 },
      homeworld: "Vulcan",
      traits: ["Logical", "Long-lived", "Telepathic"]
    },
    {
      name: "Klingon",
      description: "Warrior race with exceptional combat and tactical skills.",
      bonuses: { tactical: 15, leadership: 5 },
      homeworld: "Qo'noS",
      traits: ["Honorable", "Aggressive", "Strong"]
    },
    {
      name: "Romulan",
      description: "Cunning and strategic, Romulans excel in tactics and engineering.",
      bonuses: { tactical: 10, engineering: 5 },
      homeworld: "Romulus",
      traits: ["Secretive", "Intelligent", "Proud"]
    },
    {
      name: "Betazoid",
      description: "Empathic abilities make them excellent diplomats and counselors.",
      bonuses: { diplomacy: 15, leadership: 5 },
      homeworld: "Betazed",
      traits: ["Empathic", "Peaceful", "Intuitive"]
    },
    {
      name: "Andorian",
      description: "Hardy warriors with keen tactical instincts and engineering prowess.",
      bonuses: { tactical: 10, engineering: 5 },
      homeworld: "Andoria",
      traits: ["Resilient", "Militaristic", "Technical"]
    }
  ];

  // Backstory options with enhanced effects
  const backstories = [
    {
      title: "Starfleet Academy Graduate",
      description: "Fresh from the Academy with exceptional training in leadership and science.",
      bonuses: { leadership: 8, science: 7 },
      startingCredits: 500,
      startingItems: ["Starfleet Communicator", "Tricorder"]
    },
    {
      title: "Veteran Explorer",
      description: "Years of frontier exploration have honed your survival and engineering skills.",
      bonuses: { engineering: 8, tactical: 7 },
      startingCredits: 800,
      startingItems: ["Advanced Scanner", "Emergency Kit"]
    },
    {
      title: "Former Merchant Marine",
      description: "Commercial experience provides excellent negotiation and trade skills.",
      bonuses: { diplomacy: 12, leadership: 3 },
      startingCredits: 1500,
      startingItems: ["Trade Contacts", "Cargo Manifest"]
    },
    {
      title: "Ex-Intelligence Officer",
      description: "Covert operations background gives tactical and strategic advantages.",
      bonuses: { tactical: 12, science: 3 },
      startingCredits: 750,
      startingItems: ["Encrypted Datapad", "Stealth Device"]
    },
    {
      title: "Diplomatic Corps",
      description: "Extensive diplomatic training and cultural knowledge across species.",
      bonuses: { diplomacy: 15 },
      startingCredits: 1000,
      startingItems: ["Diplomatic Immunity", "Universal Translator"]
    }
  ];

  // Initialize game systems and crew
  useEffect(() => {
    generateGalaxy();
    generateMissions();
    initializeCrew();
    spawnEnemies();
    initializeAudio();
    
    // Add welcome message
    setTerminalLines([
      "STARFLEET COMPUTER SYSTEM ONLINE",
      "USS ENTERPRISE NCC-1701-D",
      "ALL SYSTEMS NOMINAL",
      "AWAITING ORDERS..."
    ]);
  }, []);

  // Initialize audio context for LCARS sounds
  const initializeAudio = () => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  };

  // Play LCARS interaction sounds
  const playLCARSSound = (frequency: number = 800, duration: number = 150) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    const volumeScale = soundVolume / 100;
    gainNode.gain.setValueAtTime(0.1 * volumeScale, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  };

  // Generate comprehensive galaxy
  const generateGalaxy = () => {
    const newSystems: StarSystem[] = [];
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if (Math.random() < 0.7) { // 70% chance of system existing
          const system = StarSystemAI.generateStarSystem(x, y, 0);
          // First few systems are discovered
          if (newSystems.length < 5) {
            system.discovered = true;
          }
          newSystems.push(system);
        }
      }
    }
    setSystems(newSystems);
    
    // Set starting system
    if (newSystems.length > 0) {
      setCurrentSystem(newSystems[0]);
    }
  };

  // Enhanced mission generation
  const generateMissions = () => {
    const missionTemplates = [
      {
        type: 'exploration' as const,
        title: "Deep Space Survey",
        description: "Conduct detailed surveys of uncharted stellar phenomena in remote sectors.",
        reward: 750,
        requirements: ["Advanced Sensors", "Science Officer"]
      },
      {
        type: 'diplomatic' as const,
        title: "First Contact Protocol",
        description: "Establish peaceful diplomatic relations with newly discovered civilization.",
        reward: 1000,
        requirements: ["Universal Translator", "Diplomatic Experience"]
      },
      {
        type: 'rescue' as const,
        title: "Emergency Evacuation",
        description: "Rescue stranded colonists from natural disaster on frontier world.",
        reward: 800,
        requirements: ["Medical Supplies", "Transporter Arrays"]
      },
      {
        type: 'combat' as const,
        title: "Pirate Interdiction",
        description: "Eliminate hostile forces threatening civilian shipping lanes.",
        reward: 900,
        requirements: ["Tactical Officer", "Weapons Systems"]
      }
    ];

    const newMissions: Mission[] = missionTemplates.map((template, index) => ({
      id: `mission-${index}`,
      title: template.title,
      description: template.description,
      targetSystem: systems[Math.floor(Math.random() * systems.length)]?.id || 'unknown',
      reward: template.reward,
      status: 'available',
      type: template.type
    }));

    setMissions(newMissions);
  };

  // Initialize iconic TNG crew
  const initializeCrew = () => {
    const crew: CrewMember[] = [
      {
        id: "picard",
        name: "Jean-Luc Picard",
        rank: "Captain",
        department: "Command",
        species: "Human",
        level: 10,
        stats: { leadership: 98, tactical: 85, diplomacy: 95, science: 80, engineering: 65 }
      },
      {
        id: "riker",
        name: "William T. Riker",
        rank: "Commander",
        department: "Command",
        species: "Human",
        level: 9,
        stats: { leadership: 90, tactical: 88, diplomacy: 85, science: 75, engineering: 70 }
      },
      {
        id: "data",
        name: "Data",
        rank: "Lt. Commander",
        department: "Operations",
        species: "Android",
        level: 8,
        stats: { leadership: 75, tactical: 95, diplomacy: 65, science: 98, engineering: 98 }
      },
      {
        id: "worf",
        name: "Worf",
        rank: "Lieutenant",
        department: "Security",
        species: "Klingon",
        level: 7,
        stats: { leadership: 80, tactical: 98, diplomacy: 55, science: 65, engineering: 75 }
      },
      {
        id: "laforge",
        name: "Geordi La Forge",
        rank: "Lt. Commander",
        department: "Engineering",
        species: "Human",
        level: 8,
        stats: { leadership: 85, tactical: 75, diplomacy: 80, science: 90, engineering: 98 }
      },
      {
        id: "troi",
        name: "Deanna Troi",
        rank: "Lt. Commander",
        department: "Medical",
        species: "Betazoid",
        level: 7,
        stats: { leadership: 80, tactical: 50, diplomacy: 98, science: 85, engineering: 55 }
      }
    ];

    setPlayer(prev => ({ ...prev, crew }));
  };

  // Spawn intelligent enemies
  const spawnEnemies = () => {
    const enemyFactions = [
      { name: "Cardassian Galor-class", faction: "Cardassian", hostility: 0.7 },
      { name: "Romulan Warbird", faction: "Romulan", hostility: 0.6 },
      { name: "Borg Cube", faction: "Borg", hostility: 0.9 },
      { name: "Klingon Bird of Prey", faction: "Klingon", hostility: 0.5 },
      { name: "Dominion Attack Ship", faction: "Dominion", hostility: 0.8 }
    ];

    const newEnemies: Enemy[] = [];
    for (let i = 0; i < 8; i++) {
      const enemy = enemyFactions[Math.floor(Math.random() * enemyFactions.length)];
      newEnemies.push({
        id: i,
        name: `${enemy.name} ${i + 1}`,
        faction: enemy.faction,
        position: [
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 100
        ],
        velocity: [0, 0, 0],
        rotation: [0, 0, 0],
        shields: 100,
        hull: 100,
        aiState: Math.random() < enemy.hostility ? 'attack' : 'patrol'
      });
    }
    setEnemies(newEnemies);
  };

  // Show alert
  const showAlert = (type: AlertMessage['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts(prev => [...prev, { id, type, message, visible: true }]);
    playLCARSSound(type === 'error' ? 400 : type === 'warning' ? 600 : 800);
  };

  // Handle warp navigation
  const initiateWarp = (speed: number) => {
    if (player.warpCore < 20) {
      showAlert('warning', 'Insufficient warp core energy');
      return;
    }
    
    setWarpSpeed(speed);
    setIsWarping(speed > 0);
    playLCARSSound(1200, 300);
    
    if (speed > 0) {
      addTerminalLine(`Engaging warp ${speed}`);
      // Simulate warp core energy drain
      setPlayer(prev => ({ 
        ...prev, 
        warpCore: Math.max(0, prev.warpCore - speed * 2) 
      }));
    } else {
      addTerminalLine("Dropping to impulse");
    }
  };

  // Add line to terminal
  const addTerminalLine = (line: string) => {
    setTerminalLines(prev => {
      const newLines = [...prev, `> ${line}`];
      return newLines.slice(-10); // Keep last 10 lines
    });
  };

  // Handle terminal commands
  const handleTerminalCommand = (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    switch (cmd) {
      case 'scan':
        addTerminalLine("Long range sensors detect multiple contacts");
        addTerminalLine(`Current system: ${currentSystem?.name || 'Unknown'}`);
        break;
      case 'status':
        addTerminalLine(`Hull: ${player.hull}% Shields: ${player.shields}% Warp Core: ${player.warpCore}%`);
        break;
      case 'hail':
        addTerminalLine("Opening hailing frequencies...");
        break;
      case 'red alert':
        showAlert('error', 'Red Alert! All hands to battle stations!');
        break;
      default:
        addTerminalLine(`Unknown command: ${command}`);
    }
    
    playLCARSSound(900, 100);
  };

  // Settings Menu Component
  const SettingsMenu = () => (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-gray-900 border-2 border-orange-500 p-8 max-w-md w-full">
        <h2 className="text-2xl mb-6 text-orange-500">SETTINGS</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Sound Volume</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={soundVolume}
              onChange={(e) => setSoundVolume(Number(e.target.value))}
              className="w-full" 
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Effects Volume</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={effectsVolume}
              onChange={(e) => setEffectsVolume(Number(e.target.value))}
              className="w-full" 
            />
          </div>
        </div>
        <div className="mt-8 text-center">
          <LCARSButton onClick={() => setShowSettings(false)} color={LCARS_COLORS.green}>
            SAVE & CLOSE
          </LCARSButton>
        </div>
      </div>
    </div>
  );

  // Main Menu with enhanced LCARS styling
  const renderMainMenu = () => (
    <div className="w-full h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* LCARS-style background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-orange-500 to-transparent opacity-20"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-blue-500 to-transparent opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-purple-900 to-transparent"></div>
      </div>
      
      {/* Animated starfield */}
      <div className="absolute inset-0">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="text-center space-y-8 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <h1 className="text-8xl font-bold mb-4" style={{ 
            background: 'linear-gradient(45deg, #FF9900, #FFB000, #FF6600)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `0 0 30px ${LCARS_COLORS.orange}80`
          }}>
            STAR TREK
          </h1>
          <h2 className="text-3xl mb-8" style={{ color: LCARS_COLORS.lightBlue }}>
            THE NEXT GENERATION
          </h2>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="space-y-6"
        >
          <LCARSButton 
            onClick={() => {
              setGameState("character-name");
              playLCARSSound();
            }}
            color={LCARS_COLORS.orange}
            size="large"
            variant="pill"
          >
            NEW GAME
          </LCARSButton>
          <LCARSButton 
            color={LCARS_COLORS.blue}
            size="large"
            variant="pill"
            disabled={true}
          >
            LOAD GAME
          </LCARSButton>
          <LCARSButton 
            onClick={() => {
              setShowSettings(true);
              playLCARSSound();
            }}
            color={LCARS_COLORS.purple}
            size="large"
            variant="pill"
          >
            SETTINGS
          </LCARSButton>
        </motion.div>
      </div>
    </div>
  );

  // Character Creation: Name Input with LCARS UI
  const renderCharacterName = () => (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* LCARS Frame Structure */}
      <div className="absolute inset-0 p-8">
        {/* Top LCARS Bar */}
        <div className="absolute top-0 left-0 right-0 h-24 flex">
          <div className="h-full w-32 rounded-br-3xl" style={{ backgroundColor: LCARS_COLORS.orange }}></div>
          <div className="h-8 flex-1 ml-4" style={{ backgroundColor: LCARS_COLORS.orange }}></div>
          <div className="h-full w-32 rounded-bl-3xl" style={{ backgroundColor: LCARS_COLORS.orange }}></div>
        </div>
        
        {/* Side panels */}
        <div className="absolute left-0 top-24 bottom-24 w-32" style={{ backgroundColor: LCARS_COLORS.blue + '40' }}></div>
        <div className="absolute right-0 top-24 bottom-24 w-32" style={{ backgroundColor: LCARS_COLORS.purple + '40' }}></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <LCARSPanel className="max-w-2xl" color={LCARS_COLORS.orange}>
            <div className="text-center space-y-8 p-8">
              <h2 className="text-4xl font-bold" style={{ color: LCARS_COLORS.orange }}>
                STARFLEET PERSONNEL DATABASE
              </h2>
              <div className="text-lg" style={{ color: LCARS_COLORS.lightBlue }}>
                ENTER OFFICER IDENTIFICATION
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => setPlayer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black border-4 px-6 py-4 text-xl text-center rounded-lg focus:outline-none focus:ring-4 text-white uppercase tracking-wider"
                  style={{ 
                    borderColor: LCARS_COLORS.orange,
                    boxShadow: `0 0 20px ${LCARS_COLORS.orange}40, inset 0 0 10px ${LCARS_COLORS.orange}20`
                  }}
                  placeholder="ENTER NAME"
                  maxLength={25}
                />
              </div>
              <div className="flex space-x-6 justify-center pt-4">
                <LCARSButton 
                  onClick={() => {
                    setGameState("main-menu");
                    playLCARSSound(600);
                  }}
                  color={LCARS_COLORS.red}
                  variant="pill"
                  size="medium"
                >
                  CANCEL
                </LCARSButton>
                <LCARSButton 
                  onClick={() => {
                    if (player.name) {
                      setGameState("species-select");
                      playLCARSSound();
                    }
                  }}
                  color={LCARS_COLORS.green}
                  variant="pill"
                  size="medium"
                  disabled={!player.name}
                >
                  PROCEED
                </LCARSButton>
              </div>
            </div>
          </LCARSPanel>
        </div>
      </div>
    </div>
  );

  // Species Selection with LCARS styling
  const renderSpeciesSelect = () => (
    <div className="w-full h-screen bg-black text-white relative overflow-hidden">
      {/* LCARS Frame */}
      <div className="absolute inset-0">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-20 flex items-center px-8" style={{ backgroundColor: LCARS_COLORS.blue }}>
          <h1 className="text-3xl font-bold text-black">SPECIES SELECTION DATABASE</h1>
        </div>
        
        {/* Left sidebar */}
        <div className="absolute left-0 top-20 bottom-0 w-48 p-4" style={{ backgroundColor: LCARS_COLORS.dark2 }}>
          <div className="space-y-2">
            <div className="h-16 rounded-r-full" style={{ backgroundColor: LCARS_COLORS.orange + '60' }}></div>
            <div className="h-8 rounded-r-full" style={{ backgroundColor: LCARS_COLORS.purple + '60' }}></div>
            <div className="h-12 rounded-r-full" style={{ backgroundColor: LCARS_COLORS.blue + '60' }}></div>
            <div className="h-24 rounded-r-full" style={{ backgroundColor: LCARS_COLORS.yellow + '60' }}></div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="absolute left-48 right-0 top-20 bottom-20 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {species.map((spec) => (
              <motion.div
                key={spec.name}
                whileHover={{ scale: 1.05, brightness: 1.2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setPlayer(prev => ({ 
                    ...prev, 
                    species: spec.name,
                    stats: {
                      leadership: prev.stats.leadership + (spec.bonuses.leadership || 0),
                      tactical: prev.stats.tactical + (spec.bonuses.tactical || 0),
                      diplomacy: prev.stats.diplomacy + (spec.bonuses.diplomacy || 0),
                      science: prev.stats.science + (spec.bonuses.science || 0),
                      engineering: prev.stats.engineering + (spec.bonuses.engineering || 0),
                    }
                  }));
                  setGameState("backstory-select");
                  playLCARSSound();
                }}
                className="cursor-pointer"
              >
                <LCARSPanel 
                  color={LCARS_COLORS.lightBlue}
                  variant="curved"
                  className="h-full hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-4">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: LCARS_COLORS.lightBlue }}>
                      {spec.name.toUpperCase()}
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">{spec.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold" style={{ color: LCARS_COLORS.orange }}>HOMEWORLD:</span>
                        <span className="text-xs text-white">{spec.homeworld}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold" style={{ color: LCARS_COLORS.yellow }}>TRAITS:</span>
                        <span className="text-xs text-white">{spec.traits.join(' • ')}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="text-xs font-bold mb-2" style={{ color: LCARS_COLORS.green }}>ATTRIBUTE BONUSES:</div>
                        <div className="grid grid-cols-2 gap-1">
                          {Object.entries(spec.bonuses).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-gray-400 capitalize">{key}:</span>
                              <span className="font-bold" style={{ color: LCARS_COLORS.green }}>+{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </LCARSPanel>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Bottom navigation */}
        <div className="absolute bottom-0 left-48 right-0 h-20 flex items-center justify-center space-x-6" style={{ backgroundColor: LCARS_COLORS.dark2 }}>
          <LCARSButton 
            onClick={() => {
              setGameState("character-name");
              playLCARSSound(600);
            }}
            color={LCARS_COLORS.red}
            variant="pill"
            size="medium"
          >
            BACK TO NAME
          </LCARSButton>
        </div>
      </div>
    </div>
  );

  // Backstory Selection with LCARS theme
  const renderBackstorySelect = () => (
    <div className="w-full h-screen bg-black text-white relative overflow-hidden">
      {/* LCARS Frame */}
      <div className="absolute inset-0">
        {/* Top header */}
        <div className="absolute top-0 left-0 right-0 h-24 flex items-end">
          <div className="h-16 w-64 rounded-tr-3xl flex items-center px-6" style={{ backgroundColor: LCARS_COLORS.purple }}>
            <h1 className="text-2xl font-bold text-black">CAREER PATH</h1>
          </div>
          <div className="h-8 flex-1 ml-4" style={{ backgroundColor: LCARS_COLORS.purple }}></div>
        </div>
        
        {/* Right sidebar with stats preview */}
        <div className="absolute right-0 top-24 bottom-0 w-64 p-4" style={{ backgroundColor: LCARS_COLORS.dark2 }}>
          <LCARSPanel title="CURRENT STATS" color={LCARS_COLORS.green} className="mb-4">
            <div className="space-y-2">
              {Object.entries(player.stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between items-center">
                  <span className="text-xs uppercase text-gray-400">{stat}</span>
                  <LCARSProgress 
                    value={value} 
                    max={100} 
                    color={value > 70 ? LCARS_COLORS.green : value > 50 ? LCARS_COLORS.yellow : LCARS_COLORS.orange}
                    className="w-24"
                  />
                </div>
              ))}
            </div>
          </LCARSPanel>
          
          <LCARSPanel title="SELECTED" color={LCARS_COLORS.blue}>
            <div className="text-sm">
              <div className="mb-2">
                <span className="text-gray-400">Name:</span>
                <div className="text-white font-bold">{player.name || 'Unknown'}</div>
              </div>
              <div>
                <span className="text-gray-400">Species:</span>
                <div className="text-white font-bold">{player.species || 'Unknown'}</div>
              </div>
            </div>
          </LCARSPanel>
        </div>
        
        {/* Main content */}
        <div className="absolute left-0 right-64 top-24 bottom-20 p-8 overflow-y-auto">
          <div className="space-y-4">
            {backstories.map((story, index) => (
              <motion.div
                key={story.title}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setPlayer(prev => ({ 
                    ...prev, 
                    backstory: story.title,
                    credits: story.startingCredits,
                    inventory: story.startingItems,
                    stats: {
                      leadership: Math.min(100, prev.stats.leadership + (story.bonuses.leadership || 0)),
                      tactical: Math.min(100, prev.stats.tactical + (story.bonuses.tactical || 0)),
                      diplomacy: Math.min(100, prev.stats.diplomacy + (story.bonuses.diplomacy || 0)),
                      science: Math.min(100, prev.stats.science + (story.bonuses.science || 0)),
                      engineering: Math.min(100, prev.stats.engineering + (story.bonuses.engineering || 0)),
                    }
                  }));
                  setGameState("bridge");
                  showAlert('success', 'Welcome aboard, Captain!');
                  playLCARSSound();
                }}
                className="cursor-pointer"
              >
                <LCARSPanel color={LCARS_COLORS.lightBlue} variant="angular">
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: LCARS_COLORS.lightBlue }}>
                      {story.title.toUpperCase()}
                    </h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">{story.description}</p>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-bold mb-2" style={{ color: LCARS_COLORS.orange }}>STARTING EQUIPMENT</h4>
                        <ul className="space-y-1">
                          {story.startingItems.map((item, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-center">
                              <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: LCARS_COLORS.yellow }}></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold mb-2" style={{ color: LCARS_COLORS.green }}>CAREER BONUSES</h4>
                        <div className="space-y-1">
                          {Object.entries(story.bonuses).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-gray-400 capitalize">{key}:</span>
                              <span className="font-bold" style={{ color: LCARS_COLORS.green }}>+{value}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs pt-2 border-t border-gray-700">
                            <span className="text-gray-400">Credits:</span>
                            <span className="font-bold" style={{ color: LCARS_COLORS.yellow }}>{story.startingCredits}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </LCARSPanel>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Bottom navigation */}
        <div className="absolute bottom-0 left-0 right-64 h-20 flex items-center justify-center" style={{ backgroundColor: LCARS_COLORS.dark2 }}>
          <LCARSButton 
            onClick={() => {
              setGameState("species-select");
              playLCARSSound(600);
            }}
            color={LCARS_COLORS.red}
            variant="pill"
            size="medium"
          >
            BACK TO SPECIES
          </LCARSButton>
        </div>
      </div>
    </div>
  );

  // Main Bridge Interface with enhanced 3D Viewscreen
  const renderBridge = () => (
    <div className="w-full h-screen bg-black text-white relative overflow-hidden">
      {/* LCARS Frame - Main Bridge Layout */}
      <div className="absolute inset-0">
        
        {/* Top Status Bar - Enhanced LCARS Style */}
        <div className="absolute top-0 left-0 right-0 h-20 flex items-stretch">
          <div className="w-48 rounded-br-3xl flex items-center px-6" style={{ backgroundColor: LCARS_COLORS.orange }}>
            <div className="text-black font-bold text-sm">
              <div>STARDATE</div>
              <div className="text-xl">{(Date.now() / 1000000).toFixed(1)}</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center px-8" style={{ backgroundColor: LCARS_COLORS.dark2 }}>
            <h1 className="text-2xl font-bold tracking-wider" style={{ color: LCARS_COLORS.orange }}>
              {player.ship}
            </h1>
          </div>
          <div className="w-96 rounded-bl-3xl flex items-center justify-end px-6 space-x-4" style={{ backgroundColor: LCARS_COLORS.blue }}>
            <LCARSStatus 
              status={player.hull > 75 ? 'online' : player.hull > 25 ? 'warning' : 'critical'}
              label="HULL"
              value={`${player.hull}%`}
            />
            <LCARSStatus 
              status={player.shields > 50 ? 'online' : player.shields > 0 ? 'warning' : 'critical'}
              label="SHIELDS"
              value={`${player.shields}%`}
            />
          </div>
        </div>

        {/* Left Control Panel - Enhanced with LCARS elements */}
        <div className="absolute left-0 top-20 bottom-0 w-80 flex flex-col" style={{ backgroundColor: LCARS_COLORS.dark2 }}>
          {/* LCARS decorative elements */}
          <div className="h-8 w-full rounded-tr-3xl mb-4" style={{ backgroundColor: LCARS_COLORS.purple }}></div>
          
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <LCARSPanel title="HELM CONTROL" color={LCARS_COLORS.blue}>
              <LCARSData 
                data={[
                  { label: "Quadrant", value: `${player.quadrant.x}.${player.quadrant.y}`, color: LCARS_COLORS.lightBlue },
                  { label: "Sector", value: `${player.sector.x}.${player.sector.y}`, color: LCARS_COLORS.lightBlue },
                  { label: "System", value: currentSystem?.name || "Deep Space", color: LCARS_COLORS.yellow }
                ]}
              />
              <div className="grid grid-cols-2 gap-2 mt-4">
                <LCARSButton 
                  onClick={() => setShowMap(true)} 
                  color={LCARS_COLORS.blue} 
                  size="small"
                  variant="rounded"
                >
                  GALAXY MAP
                </LCARSButton>
                <LCARSButton 
                  onClick={() => setViewMode("crew")} 
                  color={LCARS_COLORS.green} 
                  size="small"
                  variant="rounded"
                >
                  CREW
                </LCARSButton>
                <LCARSButton 
                  onClick={() => setViewMode("missions")} 
                  color={LCARS_COLORS.yellow} 
                  size="small"
                  variant="rounded"
                >
                  MISSIONS
                </LCARSButton>
                <LCARSButton 
                  onClick={() => showAlert('info', 'Engineering systems online')} 
                  color={LCARS_COLORS.orange} 
                  size="small"
                  variant="rounded"
                >
                  ENGINEERING
                </LCARSButton>
              </div>
            </LCARSPanel>

            <LCARSPanel title="VIEWSCREEN MODES" color={LCARS_COLORS.purple}>
              <div className="grid grid-cols-2 gap-2">
                <LCARSButton
                  onClick={() => setViewscreenMode('tactical')}
                  active={viewscreenMode === 'tactical'}
                  color={LCARS_COLORS.red}
                  size="small"
                  variant="rounded"
                >
                  TACTICAL
                </LCARSButton>
                <LCARSButton
                  onClick={() => setViewscreenMode('orbit')}
                  active={viewscreenMode === 'orbit'}
                  color={LCARS_COLORS.blue}
                  size="small"
                  variant="rounded"
                >
                  PLANETARY
                </LCARSButton>
                <LCARSButton
                  onClick={() => setViewscreenMode('pursuit')}
                  active={viewscreenMode === 'pursuit'}
                  color={LCARS_COLORS.yellow}
                  size="small"
                  variant="rounded"
                >
                  PURSUIT
                </LCARSButton>
                <LCARSButton
                  onClick={() => setViewscreenMode('bridge')}
                  active={viewscreenMode === 'bridge'}
                  color={LCARS_COLORS.green}
                  size="small"
                  variant="rounded"
                >
                  FORWARD
                </LCARSButton>
              </div>
            </LCARSPanel>

            <LCARSPanel title="TACTICAL ANALYSIS" color={LCARS_COLORS.red}>
              <LCARSData 
                data={[
                  { label: "Contacts", value: enemies.length, color: LCARS_COLORS.yellow },
                  { label: "Hostile", value: enemies.filter(e => e.aiState === 'attack').length, color: LCARS_COLORS.red },
                  { label: "Alert", value: enemies.filter(e => e.aiState === 'attack').length > 0 ? "RED" : "GREEN", 
                    color: enemies.filter(e => e.aiState === 'attack').length > 0 ? LCARS_COLORS.red : LCARS_COLORS.green }
                ]}
              />
            </LCARSPanel>
          </div>
          
          {/* Bottom decorative element */}
          <div className="h-12 w-full rounded-tr-3xl" style={{ backgroundColor: LCARS_COLORS.orange }}></div>
        </div>

        {/* Center 3D Viewscreen - The main attraction */}
        <div className="absolute left-80 right-80 top-20 bottom-32">
          <div className="h-full relative">
            {/* Viewscreen frame */}
            <div className="absolute inset-0 p-2">
              <div 
                className="h-full rounded-lg border-4 relative overflow-hidden"
                style={{ 
                  borderColor: LCARS_COLORS.lightBlue,
                  boxShadow: `0 0 40px ${LCARS_COLORS.lightBlue}60, inset 0 0 40px ${LCARS_COLORS.lightBlue}20`
                }}
              >
                {/* 3D Viewscreen Content */}
                <Viewscreen3D 
                  currentSystem={currentSystem}
                  enemies={enemies}
                  viewMode={viewscreenMode}
                  warpSpeed={warpSpeed}
                  isWarping={isWarping}
                />
                
                {/* Viewscreen overlay elements */}
                <div className="absolute top-4 left-4 text-xs font-mono" style={{ color: LCARS_COLORS.lightBlue }}>
                  VIEWER MODE: {viewscreenMode.toUpperCase()}
                </div>
                
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2" style={{ borderColor: LCARS_COLORS.orange }}></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2" style={{ borderColor: LCARS_COLORS.orange }}></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2" style={{ borderColor: LCARS_COLORS.orange }}></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2" style={{ borderColor: LCARS_COLORS.orange }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Control Panel - Enhanced systems */}
        <div className="absolute right-0 top-20 bottom-0 w-80 flex flex-col" style={{ backgroundColor: LCARS_COLORS.dark2 }}>
          <div className="h-8 w-full rounded-tl-3xl mb-4" style={{ backgroundColor: LCARS_COLORS.green }}></div>
          
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <LCARSPanel title="WARP DRIVE" color={LCARS_COLORS.orange}>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(speed => (
                  <LCARSButton
                    key={speed}
                    onClick={() => initiateWarp(speed)}
                    active={warpSpeed === speed}
                    color={warpSpeed === speed ? LCARS_COLORS.red : LCARS_COLORS.blue}
                    size="small"
                    variant="rounded"
                  >
                    {speed}
                  </LCARSButton>
                ))}
              </div>
              <LCARSButton
                onClick={() => initiateWarp(0)}
                active={warpSpeed === 0}
                color={warpSpeed === 0 ? LCARS_COLORS.red : LCARS_COLORS.purple}
                size="small"
                className="w-full"
                variant="pill"
              >
                ALL STOP
              </LCARSButton>
            </LCARSPanel>

            <LCARSPanel title="SHIP SYSTEMS" color={LCARS_COLORS.green}>
              <div className="space-y-3">
                <div>
                  <LCARSProgress 
                    value={player.warpCore} 
                    label="WARP CORE"
                    color={player.warpCore > 50 ? LCARS_COLORS.green : player.warpCore > 25 ? LCARS_COLORS.yellow : LCARS_COLORS.red}
                    animated={true}
                  />
                </div>
                <div>
                  <LCARSProgress 
                    value={player.shields} 
                    label="SHIELDS"
                    color={player.shields > 50 ? LCARS_COLORS.blue : player.shields > 25 ? LCARS_COLORS.yellow : LCARS_COLORS.red}
                    animated={true}
                  />
                </div>
                <div>
                  <LCARSProgress 
                    value={player.hull} 
                    label="HULL INTEGRITY"
                    color={player.hull > 50 ? LCARS_COLORS.green : player.hull > 25 ? LCARS_COLORS.yellow : LCARS_COLORS.red}
                    animated={true}
                  />
                </div>
              </div>
            </LCARSPanel>

            <LCARSPanel title="QUICK ACTIONS" color={LCARS_COLORS.yellow}>
              <div className="space-y-2">
                <LCARSButton
                  onClick={() => showAlert('warning', 'Yellow Alert - Shields Raised')}
                  color={LCARS_COLORS.yellow}
                  size="small"
                  className="w-full"
                  variant="rounded"
                >
                  YELLOW ALERT
                </LCARSButton>
                <LCARSButton
                  onClick={() => showAlert('error', 'Red Alert - Battle Stations!')}
                  color={LCARS_COLORS.red}
                  size="small"
                  className="w-full"
                  variant="rounded"
                >
                  RED ALERT
                </LCARSButton>
                <LCARSButton
                  onClick={() => addTerminalLine('Hailing frequencies open')}
                  color={LCARS_COLORS.blue}
                  size="small"
                  className="w-full"
                  variant="rounded"
                >
                  HAIL
                </LCARSButton>
              </div>
            </LCARSPanel>
          </div>
          
          <div className="h-12 w-full rounded-tl-3xl" style={{ backgroundColor: LCARS_COLORS.red }}></div>
        </div>

        {/* Bottom Terminal - Enhanced LCARS style */}
        <div className="absolute bottom-0 left-80 right-80 h-32 p-4" style={{ backgroundColor: LCARS_COLORS.dark1 }}>
          <LCARSTerminal 
            lines={terminalLines}
            prompt="LCARS>"
            onCommand={handleTerminalCommand}
            className="h-full"
          />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showMap && renderGalaxyMap()}
        {viewMode === "crew" && renderCrewManagement()}
        {viewMode === "missions" && renderMissionBriefing()}
      </AnimatePresence>

      {/* Alert System */}
      {alerts.map(alert => (
        <LCARSAlert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          visible={alert.visible}
          onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
        />
      ))}
    </div>
  );

  // Enhanced Galaxy Map with 3D visualization hints
  const renderGalaxyMap = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
    >
      <div className="w-11/12 h-5/6 relative">
        <LCARSPanel 
          title="STELLAR CARTOGRAPHY" 
          color={LCARS_COLORS.blue} 
          className="w-full h-full"
        >
          <div className="relative w-full h-full bg-black overflow-hidden">
            {/* Grid overlay with LCARS style */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
              {[...Array(20)].map((_, i) => (
                <g key={i}>
                  <line 
                    x1={`${i * 5}%`} y1="0" 
                    x2={`${i * 5}%`} y2="100%" 
                    stroke={LCARS_COLORS.blue} 
                    strokeWidth="1" 
                  />
                  <line 
                    x1="0" y1={`${i * 5}%`} 
                    x2="100%" y2={`${i * 5}%` }
                    stroke={LCARS_COLORS.blue} 
                    strokeWidth="1" 
                  />
                </g>
              ))}
            </svg>
            
            {/* Quadrant labels */}
            <div className="absolute top-4 left-4 text-2xl font-bold" style={{ color: LCARS_COLORS.orange }}>
              ALPHA QUADRANT
            </div>
            
            {/* Star systems with enhanced visualization */}
            {systems.map(system => (
              <motion.div
                key={system.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${(system.x / 10) * 90 + 5}%`,
                  top: `${(system.y / 10) * 90 + 5}%`,
                }}
                whileHover={{ scale: 2 }}
                onClick={() => {
                  if (system.discovered) {
                    setCurrentSystem(system);
                    setShowMap(false);
                    playLCARSSound();
                  }
                }}
              >
                {/* System marker */}
                <div className="relative">
                  <motion.div
                    className={`w-6 h-6 rounded-full border-2 ${
                      system.discovered ? 'bg-blue-400' : 'bg-gray-600'
                    }`}
                    style={{
                      borderColor: system.discovered ? LCARS_COLORS.blue : LCARS_COLORS.gray,
                      boxShadow: system.discovered ? `0 0 20px ${LCARS_COLORS.blue}` : 'none'
                    }}
                    animate={system === currentSystem ? { 
                      boxShadow: [`0 0 20px ${LCARS_COLORS.orange}`, `0 0 40px ${LCARS_COLORS.orange}`, `0 0 20px ${LCARS_COLORS.orange}`]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* System info on hover */}
                  {system.discovered && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="text-xs font-bold" style={{ color: LCARS_COLORS.lightBlue }}>
                        {system.name}
                      </div>
                      <div className="text-xs" style={{ color: LCARS_COLORS.yellow }}>
                        {system.planets.length} planets
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* Player ship position */}
            <motion.div
              className="absolute w-8 h-8"
              style={{
                left: `${(player.sector.x / 10) * 90 + 5}%`,
                top: `${(player.sector.y / 10) * 90 + 5}%`,
              }}
            >
              <div 
                className="w-full h-full rounded-full border-4 border-white"
                style={{ 
                  backgroundColor: LCARS_COLORS.orange,
                  boxShadow: `0 0 30px ${LCARS_COLORS.orange}`
                }}
              />
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap" 
                   style={{ color: LCARS_COLORS.orange }}>
                YOUR POSITION
              </div>
            </motion.div>
            
            {/* Map legend */}
            <div className="absolute bottom-4 left-4 p-4" style={{ backgroundColor: LCARS_COLORS.dark2 + 'CC' }}>
              <div className="text-xs space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: LCARS_COLORS.blue }}></div>
                  <span style={{ color: LCARS_COLORS.lightBlue }}>Discovered System</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-gray-600"></div>
                  <span className="text-gray-400">Unexplored System</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: LCARS_COLORS.orange }}></div>
                  <span style={{ color: LCARS_COLORS.orange }}>Your Ship</span>
                </div>
              </div>
            </div>
          </div>
        </LCARSPanel>
        
        <div className="absolute bottom-8 right-8">
          <LCARSButton 
            onClick={() => {
              setShowMap(false);
              playLCARSSound(600);
            }} 
            color={LCARS_COLORS.red}
            variant="pill"
            size="medium"
          >
            CLOSE MAP
          </LCARSButton>
        </div>
      </div>
    </motion.div>
  );

  // Enhanced Crew Management with LCARS styling
  const renderCrewManagement = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
    >
      <div className="w-11/12 h-5/6 relative">
        <LCARSPanel 
          title="CREW MANIFEST - USS ENTERPRISE" 
          color={LCARS_COLORS.green} 
          className="w-full h-full"
        >
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
              {player.crew.map(crew => (
                <motion.div
                  key={crew.id}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                >
                  <LCARSPanel color={LCARS_COLORS.lightBlue} variant="curved">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold" style={{ color: LCARS_COLORS.lightBlue }}>
                            {crew.name.toUpperCase()}
                          </h3>
                          <div className="text-sm" style={{ color: LCARS_COLORS.yellow }}>
                            {crew.rank}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs" style={{ color: LCARS_COLORS.orange }}>
                            LEVEL {crew.level}
                          </div>
                          <div className="text-xs text-gray-400">
                            {crew.species}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm mb-3" style={{ color: LCARS_COLORS.purple }}>
                        {crew.department.toUpperCase()}
                      </div>
                      
                      <div className="space-y-2">
                        {Object.entries(crew.stats).map(([stat, value]) => (
                          <div key={stat} className="flex items-center justify-between">
                            <span className="text-xs uppercase text-gray-400">{stat}</span>
                            <div className="flex-1 mx-2">
                              <LCARSProgress 
                                value={value} 
                                max={100}
                                color={value > 80 ? LCARS_COLORS.green : value > 60 ? LCARS_COLORS.yellow : LCARS_COLORS.orange}
                              />
                            </div>
                            <span className="text-xs font-bold" style={{ 
                              color: value > 80 ? LCARS_COLORS.green : value > 60 ? LCARS_COLORS.yellow : LCARS_COLORS.orange 
                            }}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </LCARSPanel>
                </motion.div>
              ))}
            </div>
            
            {/* Crew statistics */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <LCARSPanel color={LCARS_COLORS.blue}>
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: LCARS_COLORS.blue }}>
                    {player.crew.length}
                  </div>
                  <div className="text-sm text-gray-400">TOTAL CREW</div>
                </div>
              </LCARSPanel>
              
              <LCARSPanel color={LCARS_COLORS.green}>
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: LCARS_COLORS.green }}>
                    {Math.round(player.crew.reduce((acc, c) => acc + Object.values(c.stats).reduce((a, b) => a + b, 0) / 5, 0) / player.crew.length)}
                  </div>
                  <div className="text-sm text-gray-400">AVG SKILL LEVEL</div>
                </div>
              </LCARSPanel>
              
              <LCARSPanel color={LCARS_COLORS.orange}>
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: LCARS_COLORS.orange }}>
                    OPTIMAL
                  </div>
                  <div className="text-sm text-gray-400">CREW STATUS</div>
                </div>
              </LCARSPanel>
            </div>
          </div>
        </LCARSPanel>
        
        <div className="absolute bottom-8 right-8">
          <LCARSButton 
            onClick={() => {
              setViewMode("bridge");
              playLCARSSound(600);
            }} 
            color={LCARS_COLORS.red}
            variant="pill"
            size="medium"
          >
            RETURN TO BRIDGE
          </LCARSButton>
        </div>
      </div>
    </motion.div>
  );

  // Mission Briefing with LCARS enhancements
  const renderMissionBriefing = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
    >
      <div className="w-11/12 h-5/6 relative">
        <LCARSPanel 
          title="MISSION BRIEFINGS - STARFLEET COMMAND" 
          color={LCARS_COLORS.yellow} 
          className="w-full h-full"
        >
          <div className="p-6 h-full overflow-y-auto">
            <div className="space-y-4 max-h-96">
              {missions.map(mission => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="cursor-pointer"
                >
                  <LCARSPanel 
                    color={
                      mission.status === 'active' ? LCARS_COLORS.yellow :
                      mission.status === 'completed' ? LCARS_COLORS.green :
                      LCARS_COLORS.blue
                    }
                    variant="angular"
                  >
                    <div className="p-6 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-bold" style={{ 
                            color: mission.status === 'active' ? LCARS_COLORS.yellow :
                                   mission.status === 'completed' ? LCARS_COLORS.green :
                                   LCARS_COLORS.blue 
                          }}>
                            {mission.title.toUpperCase()}
                          </h3>
                          <div 
                            className="px-3 py-1 rounded-full text-xs uppercase font-bold"
                            style={{
                              backgroundColor: mission.type === 'combat' ? LCARS_COLORS.red + '40' :
                                             mission.type === 'diplomatic' ? LCARS_COLORS.blue + '40' :
                                             mission.type === 'exploration' ? LCARS_COLORS.green + '40' :
                                             LCARS_COLORS.yellow + '40',
                              color: mission.type === 'combat' ? LCARS_COLORS.red :
                                     mission.type === 'diplomatic' ? LCARS_COLORS.blue :
                                     mission.type === 'exploration' ? LCARS_COLORS.green :
                                     LCARS_COLORS.yellow
                            }}
                          >
                            {mission.type}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-4 leading-relaxed">{mission.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-xs uppercase" style={{ color: LCARS_COLORS.orange }}>Mission Type</span>
                            <div className="text-white font-bold capitalize">{mission.type}</div>
                          </div>
                          <div>
                            <span className="text-xs uppercase" style={{ color: LCARS_COLORS.orange }}>Reward</span>
                            <div className="text-white font-bold">{mission.reward} credits</div>
                          </div>
                          <div>
                            <span className="text-xs uppercase" style={{ color: LCARS_COLORS.orange }}>Status</span>
                            <div className="text-white font-bold uppercase">{mission.status}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 space-y-2">
                        {mission.status === 'available' && (
                          <LCARSButton
                            onClick={() => {
                              setMissions(prev => prev.map(m => 
                                m.id === mission.id ? { ...m, status: 'active' } : m
                              ));
                              showAlert('success', `Mission "${mission.title}" accepted. Good luck, Captain!`);
                              playLCARSSound();
                            }}
                            color={LCARS_COLORS.green}
                            size="small"
                            variant="pill"
                          >
                            ACCEPT
                          </LCARSButton>
                        )}
                        
                        {mission.status === 'active' && (
                          <div className="text-center">
                            <div className="text-xs" style={{ color: LCARS_COLORS.yellow }}>IN PROGRESS</div>
                            <motion.div
                              className="w-16 h-1 mt-2 rounded-full"
                              style={{ backgroundColor: LCARS_COLORS.yellow }}
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>
                        )}
                        
                        {mission.status === 'completed' && (
                          <div className="text-center">
                            <div className="text-xs" style={{ color: LCARS_COLORS.green }}>COMPLETED</div>
                            <div className="text-2xl mt-1" style={{ color: LCARS_COLORS.green }}>✓</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </LCARSPanel>
                </motion.div>
              ))}
            </div>
            
            {/* Mission statistics */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <LCARSPanel color={LCARS_COLORS.blue}>
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: LCARS_COLORS.blue }}>
                    {missions.filter(m => m.status === 'available').length}
                  </div>
                  <div className="text-xs text-gray-400">AVAILABLE</div>
                </div>
              </LCARSPanel>
              
              <LCARSPanel color={LCARS_COLORS.yellow}>
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: LCARS_COLORS.yellow }}>
                    {missions.filter(m => m.status === 'active').length}
                  </div>
                  <div className="text-xs text-gray-400">ACTIVE</div>
                </div>
              </LCARSPanel>
              
              <LCARSPanel color={LCARS_COLORS.green}>
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: LCARS_COLORS.green }}>
                    {missions.filter(m => m.status === 'completed').length}
                  </div>
                  <div className="text-xs text-gray-400">COMPLETED</div>
                </div>
              </LCARSPanel>
              
              <LCARSPanel color={LCARS_COLORS.orange}>
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: LCARS_COLORS.orange }}>
                    {missions.reduce((acc, m) => acc + (m.status === 'completed' ? m.reward : 0), 0)}
                  </div>
                  <div className="text-xs text-gray-400">CREDITS EARNED</div>
                </div>
              </LCARSPanel>
            </div>
          </div>
        </LCARSPanel>
        
        <div className="absolute bottom-8 right-8">
          <LCARSButton 
            onClick={() => {
              setViewMode("bridge");
              playLCARSSound(600);
            }} 
            color={LCARS_COLORS.red}
            variant="pill"
            size="medium"
          >
            RETURN TO BRIDGE
          </LCARSButton>
        </div>
      </div>
    </motion.div>
  );

  // Main render switch
  return (
    <div className="font-mono overflow-hidden">
      {gameState === "main-menu" && renderMainMenu()}
      {gameState === "character-name" && renderCharacterName()}
      {gameState === "species-select" && renderSpeciesSelect()}
      {gameState === "backstory-select" && renderBackstorySelect()}
      {gameState === "bridge" && renderBridge()}
      {showSettings && <SettingsMenu />}
    </div>
  );
}

export default StarTrekGame;