// Comprehensive AI Star System Generator

export interface Planet {
  id: string;
  name: string;
  type: 'Rocky' | 'Gas Giant' | 'Ice World' | 'Desert' | 'Ocean' | 'Volcanic' | 'Dead';
  atmosphere: string;
  life: string;
  color: string;
  size: number;
  distance: number; // AU from star
  orbitSpeed: number; // radians per second
  rotationSpeed: number;
  population?: number;
  resources?: string[];
  tradeGoods?: string[];
  discovered: boolean;
  position: [number, number, number];
  rings?: boolean;
  moons?: Moon[];
  temperature: number; // Kelvin
  gravity: number; // Earth = 1.0
  magneticField: number; // Earth = 1.0
  tectonicActivity: 'None' | 'Low' | 'Moderate' | 'High' | 'Extreme';
  weatherPatterns: string[];
}

export interface Moon {
  id: string;
  name: string;
  color: string;
  size: number;
  distance: number; // from planet
  orbitSpeed: number;
  type: 'Rocky' | 'Ice' | 'Captured Asteroid';
  tidally_locked: boolean;
}

export interface StarSystem {
  id: string;
  name: string;
  starType: 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M' | 'WD' | 'NS' | 'BH'; // Main sequence + exotic
  starColor: string;
  starSize: number;
  starMass: number; // Solar masses
  starAge: number; // Billion years
  starTemperature: number; // Kelvin
  planets: Planet[];
  description: string;
  x: number;
  y: number;
  z: number;
  discovered: boolean;
  habitableZone: [number, number]; // Inner and outer AU
  asteroidBelts: AsteroidBelt[];
  nebulae?: Nebula[];
  anomalies?: SpaceAnomaly[];
  faction?: string;
  threatLevel: 'Safe' | 'Low' | 'Moderate' | 'High' | 'Extreme';
}

export interface AsteroidBelt {
  id: string;
  name: string;
  innerRadius: number;
  outerRadius: number;
  density: 'Sparse' | 'Moderate' | 'Dense';
  resources: string[];
  mining_stations?: number;
}

export interface Nebula {
  id: string;
  name: string;
  type: 'Planetary' | 'Emission' | 'Dark' | 'Supernova Remnant';
  color: string;
  density: number;
  effects: string[]; // sensor interference, radiation, etc.
}

export interface SpaceAnomaly {
  id: string;
  name: string;
  type: 'Wormhole' | 'Spatial Rift' | 'Subspace Distortion' | 'Quantum Singularity' | 'Time Distortion';
  description: string;
  effects: string[];
  stability: 'Stable' | 'Unstable' | 'Deteriorating' | 'Dangerous';
}

// Name generators using procedural algorithms
class NameGenerator {
  private static starPrefixes = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa',
    'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon',
    'Phi', 'Chi', 'Psi', 'Omega'
  ];

  private static starSuffixes = [
    'Centauri', 'Tauri', 'Orionis', 'Cygni', 'Leonis', 'Virginis', 'Scorpii', 'Aquarii',
    'Pegasi', 'Andromedae', 'Cassiopeiae', 'Ursae', 'Draconis', 'Lyrae', 'Aquilae'
  ];

  private static planetNames = [
    'Kepler', 'Gliese', 'Proxima', 'Trappist', 'HD', 'TOI', 'K2', 'WASP', 'HAT',
    'XO', 'TrES', 'CoRoT', 'Qatar', 'KELT', 'MASCARA'
  ];

  private static alienNames = [
    'Qo\'noS', 'Vulcan', 'Risa', 'Bajor', 'Cardassia', 'Ferenginar', 'Romulus', 'Remus',
    'Andoria', 'Tellar', 'Trill', 'Betazed', 'Rura Penthe', 'Talos', 'Rigel', 'Deneb',
    'Altair', 'Vega', 'Sirius', 'Arcturus', 'Capella', 'Aldebaran', 'Antares', 'Pollux'
  ];

  static generateSystemName(): string {
    const useAlien = Math.random() < 0.3;
    if (useAlien) {
      return this.alienNames[Math.floor(Math.random() * this.alienNames.length)];
    }
    
    const prefix = this.starPrefixes[Math.floor(Math.random() * this.starPrefixes.length)];
    const suffix = this.starSuffixes[Math.floor(Math.random() * this.starSuffixes.length)];
    return `${prefix} ${suffix}`;
  }

  static generatePlanetName(systemName: string, planetIndex: number): string {
    const useNumber = Math.random() < 0.7;
    if (useNumber) {
      return `${systemName} ${String.fromCharCode(98 + planetIndex)}`; // b, c, d, e...
    }
    
    const planetPrefix = this.planetNames[Math.floor(Math.random() * this.planetNames.length)];
    return `${planetPrefix}-${Math.floor(Math.random() * 999) + 1}${String.fromCharCode(98 + planetIndex)}`;
  }
}

// Star system generation AI
export class StarSystemAI {
  private static readonly RESOURCES = [
    'Dilithium', 'Tritanium', 'Duranium', 'Latinum', 'Quadrotriticale',
    'Pergium', 'Topaline', 'Zenite', 'Corbomite', 'Trellium-D'
  ];

  private static readonly TRADE_GOODS = [
    'Medical Supplies', 'Scientific Data', 'Artwork', 'Luxury Items',
    'Industrial Equipment', 'Agricultural Products', 'Textiles', 'Spices',
    'Technology Components', 'Biological Samples'
  ];

  static generateStarSystem(x: number, y: number, z: number): StarSystem {
    const name = NameGenerator.generateSystemName();
    const starType = this.generateStarType();
    const starData = this.getStarData(starType);
    
    const system: StarSystem = {
      id: `system-${x}-${y}-${z}`,
      name,
      starType,
      starColor: starData.color,
      starSize: starData.size,
      starMass: starData.mass,
      starAge: starData.age,
      starTemperature: starData.temperature,
      planets: [],
      description: this.generateSystemDescription(name, starType),
      x,
      y,
      z,
      discovered: false,
      habitableZone: this.calculateHabitableZone(starData.mass),
      asteroidBelts: [],
      faction: this.assignFaction(),
      threatLevel: this.calculateThreatLevel()
    };

    // Generate planets
    const planetCount = this.calculatePlanetCount(starType);
    for (let i = 0; i < planetCount; i++) {
      const distance = this.calculateOrbitDistance(i, planetCount, starData.mass);
      const planet = this.generatePlanet(name, i, distance, system.habitableZone, starData.temperature);
      system.planets.push(planet);
    }

    // Generate asteroid belts
    if (Math.random() < 0.4) {
      system.asteroidBelts.push(this.generateAsteroidBelt(system));
    }

    // Generate anomalies for some systems
    if (Math.random() < 0.15) {
      system.anomalies = [this.generateAnomaly()];
    }

    return system;
  }

  private static generateStarType(): StarSystem['starType'] {
    const rand = Math.random();
    // Realistic stellar distribution
    if (rand < 0.76) return 'M'; // Red dwarf
    if (rand < 0.88) return 'K'; // Orange dwarf
    if (rand < 0.96) return 'G'; // Yellow dwarf (like Sun)
    if (rand < 0.98) return 'F'; // Yellow-white
    if (rand < 0.994) return 'A'; // White
    if (rand < 0.998) return 'B'; // Blue-white
    if (rand < 0.9995) return 'O'; // Blue giant
    
    // Exotic objects
    const exotic = ['WD', 'NS', 'BH'] as const;
    return exotic[Math.floor(Math.random() * exotic.length)];
  }

  private static getStarData(type: StarSystem['starType']) {
    const starData = {
      'O': { color: '#9BB0FF', size: 15, mass: 20, age: 0.01, temperature: 30000 },
      'B': { color: '#AABFFF', size: 8, mass: 10, age: 0.1, temperature: 20000 },
      'A': { color: '#CAD7FF', size: 2.5, mass: 2, age: 1, temperature: 8500 },
      'F': { color: '#F8F7FF', size: 1.5, mass: 1.3, age: 3, temperature: 6500 },
      'G': { color: '#FFF4EA', size: 1, mass: 1, age: 5, temperature: 5800 },
      'K': { color: '#FFE4B5', size: 0.8, mass: 0.7, age: 8, temperature: 4500 },
      'M': { color: '#FFCC6F', size: 0.4, mass: 0.3, age: 12, temperature: 3200 },
      'WD': { color: '#FFFFFF', size: 0.01, mass: 0.6, age: 15, temperature: 50000 },
      'NS': { color: '#E6E6FA', size: 0.001, mass: 1.4, age: 2, temperature: 100000 },
      'BH': { color: '#000000', size: 0.001, mass: 10, age: 5, temperature: 0 }
    };
    
    return starData[type];
  }

  private static calculateHabitableZone(mass: number): [number, number] {
    const luminosity = mass * mass * mass * mass; // Simplified mass-luminosity relation
    const inner = Math.sqrt(luminosity / 1.1);
    const outer = Math.sqrt(luminosity / 0.53);
    return [inner, outer];
  }

  private static calculatePlanetCount(starType: StarSystem['starType']): number {
    if (['WD', 'NS', 'BH'].includes(starType)) {
      return Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0;
    }
    
    // More massive stars tend to have fewer planets due to shorter lifespans
    const basePlanets = starType === 'O' || starType === 'B' ? 2 : 
                       starType === 'A' ? 4 : 
                       starType === 'F' || starType === 'G' ? 6 : 8;
    
    return Math.floor(Math.random() * basePlanets) + 1;
  }

  private static calculateOrbitDistance(index: number, _totalPlanets: number, starMass: number): number {
    // Titius-Bode-like law with some randomness
    const base = 0.4 + (0.3 * Math.pow(2, index));
    const variation = (Math.random() - 0.5) * 0.2;
    return (base + variation) * Math.sqrt(starMass);
  }

  private static generatePlanet(
    systemName: string, 
    index: number, 
    distance: number, 
    habitableZone: [number, number],
    starTemp: number
  ): Planet {
    const name = NameGenerator.generatePlanetName(systemName, index);
    const inHabitableZone = distance >= habitableZone[0] && distance <= habitableZone[1];
    
    // Planet type based on distance and stellar temperature
    let type: Planet['type'];
    const temp = this.calculateTemperature(distance, starTemp);
    
    if (distance < habitableZone[0] * 0.7) {
      type = temp > 800 ? 'Volcanic' : 'Rocky';
    } else if (inHabitableZone) {
      const roll = Math.random();
      if (roll < 0.4) type = 'Rocky';
      else if (roll < 0.7) type = 'Ocean';
      else type = 'Desert';
    } else if (distance < habitableZone[1] * 3) {
      type = Math.random() < 0.7 ? 'Gas Giant' : 'Ice World';
    } else {
      type = Math.random() < 0.8 ? 'Ice World' : 'Gas Giant';
    }

    const size = this.calculatePlanetSize(type);
    const gravity = this.calculateGravity(size, type);
    
    return {
      id: `${systemName.toLowerCase().replace(' ', '-')}-${index}`,
      name,
      type,
      atmosphere: this.generateAtmosphere(type, temp, gravity),
      life: this.generateLife(type, temp, inHabitableZone),
      color: this.getPlanetColor(type, temp),
      size,
      distance,
      orbitSpeed: Math.sqrt(1 / Math.pow(distance, 3)) * 0.1, // Kepler's third law simplified
      rotationSpeed: (Math.random() * 0.1 + 0.01) * (Math.random() < 0.1 ? -1 : 1), // 10% retrograde
      population: this.calculatePopulation(type, temp, inHabitableZone),
      resources: this.generateResources(type),
      tradeGoods: this.generateTradeGoods(type),
      discovered: false,
      position: [0, 0, 0], // Will be calculated in orbit
      rings: type === 'Gas Giant' && Math.random() < 0.6,
      moons: this.generateMoons(type, size),
      temperature: temp,
      gravity,
      magneticField: this.calculateMagneticField(size, type),
      tectonicActivity: this.calculateTectonicActivity(type, temp, size),
      weatherPatterns: this.generateWeatherPatterns(type, temp, gravity)
    };
  }

  private static calculateTemperature(distance: number, starTemp: number): number {
    // Simplified stellar heating model
    const solarConstant = Math.pow(starTemp / 5778, 4) / Math.pow(distance, 2);
    const baseTemp = Math.pow(solarConstant * 0.25, 0.25) * 278; // Simplified
    return Math.max(baseTemp, 2.7); // Cosmic microwave background minimum
  }

  private static calculatePlanetSize(type: Planet['type']): number {
    switch (type) {
      case 'Gas Giant':
        return Math.random() * 8 + 4; // 4-12 Earth radii
      case 'Rocky':
      case 'Desert':
      case 'Ocean':
      case 'Volcanic':
        return Math.random() * 1.5 + 0.5; // 0.5-2 Earth radii
      case 'Ice World':
        return Math.random() * 1.2 + 0.3; // 0.3-1.5 Earth radii
      case 'Dead':
        return Math.random() * 0.8 + 0.2; // 0.2-1 Earth radii
      default:
        return 1;
    }
  }

  private static calculateGravity(size: number, type: Planet['type']): number {
    const density = type === 'Gas Giant' ? 0.3 : 
                   type === 'Ice World' ? 0.6 : 1.0;
    return Math.pow(size, 3) * density;
  }

  private static generateAtmosphere(type: Planet['type'], temp: number, gravity: number): string {
    if (type === 'Gas Giant') return 'Dense hydrogen/helium';
    if (gravity < 0.3) return 'None';
    if (temp < 150) return 'Frozen';
    if (temp > 800) return 'Toxic volcanic';
    
    const atmospheres = [
      'Breathable', 'Toxic', 'Thin', 'Dense', 'Corrosive', 
      'High CO2', 'Methane', 'Ammonia-based'
    ];
    
    if (type === 'Ocean' && temp > 273 && temp < 373) {
      return Math.random() < 0.7 ? 'Breathable' : 'High humidity';
    }
    
    return atmospheres[Math.floor(Math.random() * atmospheres.length)];
  }

  private static generateLife(type: Planet['type'], temp: number, inHZ: boolean): string {
    if (type === 'Gas Giant') return Math.random() < 0.1 ? 'Aerial microbes' : 'None';
    if (type === 'Dead') return 'None';
    if (!inHZ && temp < 200) return Math.random() < 0.2 ? 'Extremophile bacteria' : 'None';
    if (temp > 500) return Math.random() < 0.1 ? 'Thermophiles' : 'None';
    
    if (inHZ && type === 'Ocean') {
      const lifeTypes = [
        'Advanced aquatic civilization',
        'Primitive aquatic life',
        'Complex marine ecosystem',
        'Microscopic life',
        'Silicon-based organisms'
      ];
      return lifeTypes[Math.floor(Math.random() * lifeTypes.length)];
    }
    
    if (inHZ && (type === 'Rocky' || type === 'Desert')) {
      const roll = Math.random();
      if (roll < 0.1) return 'Advanced civilization';
      if (roll < 0.3) return 'Primitive civilization';
      if (roll < 0.6) return 'Complex life forms';
      if (roll < 0.8) return 'Simple life forms';
      return 'Microbial life';
    }
    
    return Math.random() < 0.3 ? 'Microbial life' : 'None';
  }

  private static getPlanetColor(type: Planet['type'], temp: number): string {
    const colors = {
      'Rocky': temp > 400 ? '#8B4513' : '#A0522D',
      'Gas Giant': ['#4169E1', '#87CEEB', '#DDA0DD', '#F0E68C'][Math.floor(Math.random() * 4)],
      'Ice World': '#E0FFFF',
      'Desert': '#F4A460',
      'Ocean': '#006994',
      'Volcanic': '#FF4500',
      'Dead': '#696969'
    };
    return colors[type] || '#CCCCCC';
  }

  private static calculatePopulation(type: Planet['type'], temp: number, inHZ: boolean): number {
    if (!inHZ || type === 'Gas Giant' || type === 'Dead') return 0;
    if (temp < 200 || temp > 400) return 0;
    
    const roll = Math.random();
    if (roll < 0.7) return 0; // Most planets uninhabited
    if (roll < 0.85) return Math.floor(Math.random() * 100000); // Small settlements
    if (roll < 0.95) return Math.floor(Math.random() * 1000000); // Cities
    return Math.floor(Math.random() * 1000000000); // Civilizations
  }

  private static generateResources(type: Planet['type']): string[] {
    const resourcePools = {
      'Rocky': ['Tritanium', 'Duranium', 'Pergium'],
      'Gas Giant': ['Deuterium', 'Helium-3'],
      'Ice World': ['Water', 'Deuterium'],
      'Desert': ['Rare minerals', 'Crystals'],
      'Ocean': ['Biological compounds'],
      'Volcanic': ['Dilithium', 'Rare earth elements'],
      'Dead': ['Metal ores', 'Radioactive materials']
    };
    
    const pool = resourcePools[type] || this.RESOURCES;
    const count = Math.floor(Math.random() * 3);
    const selected = [];
    
    for (let i = 0; i < count; i++) {
      const resource = pool[Math.floor(Math.random() * pool.length)];
      if (!selected.includes(resource)) {
        selected.push(resource);
      }
    }
    
    return selected;
  }

  private static generateTradeGoods(type: Planet['type']): string[] {
    // Different planet types have different trade probabilities
    const tradeChance = type === 'Ocean' || type === 'Rocky' ? 0.5 : 0.3;
    if (Math.random() > tradeChance) return [];
    
    const count = Math.floor(Math.random() * 2) + 1;
    const selected = [];
    
    for (let i = 0; i < count; i++) {
      const good = this.TRADE_GOODS[Math.floor(Math.random() * this.TRADE_GOODS.length)];
      if (!selected.includes(good)) {
        selected.push(good);
      }
    }
    
    return selected;
  }

  private static generateMoons(planetType: Planet['type'], planetSize: number): Moon[] {
    if (planetType === 'Gas Giant') {
      const moonCount = Math.floor(Math.random() * 8) + 2; // 2-9 moons
      const moons: Moon[] = [];
      
      for (let i = 0; i < moonCount; i++) {
        moons.push({
          id: `moon-${i}`,
          name: `Moon ${i + 1}`,
          color: ['#CCCCCC', '#E0FFFF', '#8B4513'][Math.floor(Math.random() * 3)],
          size: Math.random() * 0.3 + 0.1,
          distance: (i + 1) * 2,
          orbitSpeed: Math.sqrt(1 / Math.pow((i + 1) * 2, 3)) * 0.5,
          type: Math.random() < 0.6 ? 'Ice' : 'Rocky',
          tidally_locked: Math.random() < 0.8
        });
      }
      return moons;
    } else if (planetSize > 0.8 && Math.random() < 0.4) {
      // Rocky planets can have 1-2 moons
      return [{
        id: 'moon-0',
        name: 'Moon',
        color: '#CCCCCC',
        size: Math.random() * 0.2 + 0.05,
        distance: 3,
        orbitSpeed: 0.1,
        type: 'Rocky',
        tidally_locked: Math.random() < 0.5
      }];
    }
    
    return [];
  }

  private static calculateMagneticField(size: number, type: Planet['type']): number {
    if (type === 'Gas Giant') return size * 10;
    if (type === 'Dead' || type === 'Ice World') return 0.1;
    return size * (Math.random() * 2);
  }

  private static calculateTectonicActivity(
    type: Planet['type'], 
    temp: number, 
    size: number
  ): Planet['tectonicActivity'] {
    if (type === 'Gas Giant' || type === 'Dead') return 'None';
    if (type === 'Volcanic') return 'Extreme';
    if (size < 0.5) return 'None';
    
    const activity = size * (temp / 300) * Math.random();
    if (activity < 0.2) return 'None';
    if (activity < 0.5) return 'Low';
    if (activity < 1.0) return 'Moderate';
    if (activity < 1.5) return 'High';
    return 'Extreme';
  }

  private static generateWeatherPatterns(
    type: Planet['type'], 
    temp: number, 
    gravity: number
  ): string[] {
    if (type === 'Dead' || gravity < 0.1) return ['None'];
    if (type === 'Gas Giant') return ['Massive storms', 'Atmospheric bands', 'Lightning'];
    
    const patterns = [];
    if (temp > 273) patterns.push('Rain');
    if (temp < 273) patterns.push('Snow');
    if (type === 'Desert') patterns.push('Dust storms');
    if (type === 'Ocean') patterns.push('Hurricanes', 'Tidal patterns');
    if (type === 'Volcanic') patterns.push('Ash clouds');
    if (gravity > 2) patterns.push('Extreme weather');
    
    return patterns.length > 0 ? patterns : ['Calm'];
  }

  private static generateAsteroidBelt(system: StarSystem): AsteroidBelt {
    const planetDistances = system.planets.map(p => p.distance).sort((a, b) => a - b);
    let innerRadius, outerRadius;
    
    if (planetDistances.length >= 2) {
      // Place between two planets
      const gap = Math.floor(Math.random() * (planetDistances.length - 1));
      innerRadius = planetDistances[gap] + 0.5;
      outerRadius = planetDistances[gap + 1] - 0.5;
    } else {
      // Place at outer edge
      innerRadius = (planetDistances[planetDistances.length - 1] || 1) + 1;
      outerRadius = innerRadius + 2;
    }
    
    return {
      id: `${system.id}-belt`,
      name: `${system.name} Asteroid Belt`,
      innerRadius,
      outerRadius,
      density: ['Sparse', 'Moderate', 'Dense'][Math.floor(Math.random() * 3)] as AsteroidBelt['density'],
      resources: this.RESOURCES.slice(0, Math.floor(Math.random() * 3) + 1),
      mining_stations: Math.random() < 0.3 ? Math.floor(Math.random() * 5) : 0
    };
  }

  private static generateAnomaly(): SpaceAnomaly {
    const types: SpaceAnomaly['type'][] = [
      'Wormhole', 'Spatial Rift', 'Subspace Distortion', 'Quantum Singularity', 'Time Distortion'
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const anomalies = {
      'Wormhole': {
        description: 'A stable wormhole leading to unknown regions of space',
        effects: ['Instant travel', 'Navigation hazard', 'Temporal effects']
      },
      'Spatial Rift': {
        description: 'A tear in the fabric of space-time',
        effects: ['Sensor interference', 'Hull stress', 'Dimensional intrusion']
      },
      'Subspace Distortion': {
        description: 'Distorted subspace field affecting warp travel',
        effects: ['Warp drive malfunction', 'Communication disruption']
      },
      'Quantum Singularity': {
        description: 'A microscopic black hole with unique properties',
        effects: ['Gravitational lensing', 'Time dilation', 'Energy discharge']
      },
      'Time Distortion': {
        description: 'Temporal anomaly causing time flow irregularities',
        effects: ['Temporal displacement', 'Causality loops', 'Chronometer malfunction']
      }
    };
    
    return {
      id: `anomaly-${Math.random().toString(36).substr(2, 9)}`,
      name: `${type} Anomaly`,
      type,
      description: anomalies[type].description,
      effects: anomalies[type].effects,
      stability: ['Stable', 'Unstable', 'Deteriorating', 'Dangerous'][Math.floor(Math.random() * 4)] as SpaceAnomaly['stability']
    };
  }

  private static assignFaction(): string | undefined {
    const factions = [
      'Federation', 'Klingon Empire', 'Romulan Star Empire', 
      'Cardassian Union', 'Dominion', 'Borg Collective',
      'Ferengi Alliance', 'Neutral Zone', 'Independent'
    ];
    
    return Math.random() < 0.3 ? factions[Math.floor(Math.random() * factions.length)] : undefined;
  }

  private static calculateThreatLevel(): StarSystem['threatLevel'] {
    const roll = Math.random();
    if (roll < 0.4) return 'Safe';
    if (roll < 0.7) return 'Low';
    if (roll < 0.9) return 'Moderate';
    if (roll < 0.98) return 'High';
    return 'Extreme';
  }

  private static generateSystemDescription(name: string, starType: StarSystem['starType']): string {
    const starDescriptions = {
      'O': 'massive blue giant',
      'B': 'hot blue-white star',
      'A': 'white main sequence star',
      'F': 'yellow-white star',
      'G': 'yellow dwarf star',
      'K': 'orange dwarf star',
      'M': 'red dwarf star',
      'WD': 'white dwarf remnant',
      'NS': 'neutron star',
      'BH': 'stellar black hole'
    };
    
    return `The ${name} system orbits a ${starDescriptions[starType]}, creating unique conditions for planetary formation and potential life.`;
  }
}