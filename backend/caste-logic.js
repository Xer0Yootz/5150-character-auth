const zodiacMap = {
  aries: { name: 'Aries', element: 'fire', dates: [321, 419] },
  taurus: { name: 'Taurus', element: 'earth', dates: [420, 520] },
  gemini: { name: 'Gemini', element: 'air', dates: [521, 620] },
  cancer: { name: 'Cancer', element: 'water', dates: [621, 722] },
  leo: { name: 'Leo', element: 'fire', dates: [723, 822] },
  virgo: { name: 'Virgo', element: 'earth', dates: [823, 922] },
  libra: { name: 'Libra', element: 'air', dates: [923, 1022] },
  scorpio: { name: 'Scorpio', element: 'water', dates: [1023, 1121] },
  sagittarius: { name: 'Sagittarius', element: 'fire', dates: [1122, 1221] },
  capricorn: { name: 'Capricorn', element: 'earth', dates: [1222, 119] },
  aquarius: { name: 'Aquarius', element: 'air', dates: [120, 218] },
  pisces: { name: 'Pisces', element: 'water', dates: [219, 320] }
};

const climateElementMap = {
  desert: 'fire',
  tropical: 'water',
  temperate_forest: 'earth',
  mountain: 'earth',
  coastal: 'water',
  tundra: 'air',
  steppe: 'earth',
  jungle: 'water',
  urban: 'fire',
  river_basin: 'water',
  wind_swept: 'air',
  volcanic: 'fire'
};

const castesByElementAndZodiac = {
  fire: {
    aries: { caste: 'Iron Mountain Republic', tribe: 'The Warborn', desc: 'Militant, heat-driven, aggressive expansion' },
    leo: { caste: 'Iron Mountain Republic', tribe: 'The Furnace', desc: 'Command presence, leadership through dominance' },
    sagittarius: { caste: 'Digitized Humans', tribe: 'The Flame Carriers', desc: 'Nomadic, data-driven fire prophets' }
  },
  water: {
    cancer: { caste: 'Amnion Clave', tribe: 'The Deep Singers', desc: 'Healing, biological resonance, protective instinct' },
    scorpio: { caste: 'Tide Clan', tribe: 'The Tide Hunters', desc: 'Secretive, predatory grace, hidden depths' },
    pisces: { caste: 'Vein-Singers', tribe: 'The Nomad Path', desc: 'Wandering, harmonic resonance, fluid adaptation' }
  },
  earth: {
    taurus: { caste: 'Stone Roots', tribe: 'The Steadfast', desc: 'Immovable endurance, deep stability, resource mastery' },
    virgo: { caste: 'City-Ruins Scavengers', tribe: 'The Salvage Keepers', desc: 'Precision, refitting ancient tech, careful extraction' },
    capricorn: { caste: 'Bug Swarm Castes', tribe: 'The Brass Collective', desc: 'Hierarchical, pheromonal networks, collective will' }
  },
  air: {
    gemini: { caste: 'The Strays', tribe: 'The Signal Runners', desc: 'Swift, information brokers, vertical mastery' },
    libra: { caste: 'The Climbers', tribe: 'The Canopy Folk', desc: 'Balanced, wind-reading, tree-bound wisdom' },
    aquarius: { caste: 'The Symbiont Nodes', tribe: 'The Hexa Lineage', desc: 'Distributed consciousness, wireless entities, data drift' }
  }
};

export function getZodiacSign(birthDate) {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const mmdd = month * 100 + day;

  for (const [sign, info] of Object.entries(zodiacMap)) {
    const [start, end] = info.dates;
    if (start <= end) {
      if (mmdd >= start && mmdd <= end) return sign;
    } else if (mmdd >= start || mmdd <= end) {
      return sign;
    }
  }
  return 'pisces';
}

export function getClimateFromCoords(lat, lon) {
  const absLat = Math.abs(lat);

  if (absLat > 66.5) return 'tundra';
  if (absLat > 55) {
    if (lon > -180 && lon < -60) return 'mountain';
    return 'temperate_forest';
  }
  if (absLat > 35) {
    if (Math.abs(lon - -74) < 20) return 'urban';
    if (Math.abs(lon - -120) < 15) return 'mountain';
    if (Math.abs(lon - 0) < 30 && absLat < 45) return 'temperate_forest';
    return 'steppe';
  }
  if (absLat > 23.5) {
    if (lon > 95 && lon < 105) return 'tropical';
    if (lon > 70 && lon < 90) return 'jungle';
    return 'desert';
  }

  if (lon > 30 && lon < 60) return 'jungle';
  if (lon > 140 || lon < -120) return 'tropical';
  if (lon > 10 && lon < 35) return 'tropical';

  return 'tropical';
}

export function assignCaste(birthDate, latitude, longitude) {
  const zodiac = getZodiacSign(birthDate);
  const climate = getClimateFromCoords(latitude, longitude);
  const element = climateElementMap[climate] || 'earth';
  const caste = castesByElementAndZodiac[element]?.[zodiac] || castesByElementAndZodiac.earth.taurus;

  return {
    zodiac: zodiacMap[zodiac].name,
    climate,
    element,
    caste: caste.caste,
    tribe: caste.tribe,
    description: caste.desc,
    abilities: getStartingAbilities(caste.caste)
  };
}

export function getStartingAbilities(caste) {
  const abilities = {
    'Iron Mountain Republic': ['Heat Resistance', 'Combat Training', 'Authority Command'],
    'Amnion Clave': ['Biological Resonance', 'Healing Touch', 'Water Affinity'],
    'Tide Clan': ['Current Reading', 'Predatory Instinct', 'Stealth Movement'],
    'Vein-Singers': ['Harmonic Resonance', 'Nomadic Navigation', 'Fluid Adaptation'],
    'Stone Roots': ['Deep Endurance', 'Mineral Reading', 'Root Connection'],
    'City-Ruins Scavengers': ['Tech Salvage', 'Precision Extraction', 'Ancient Knowledge'],
    'Bug Swarm Castes': ['Pheromonal Sensing', 'Collective Will', 'Swarm Coordination'],
    'The Hounds': ['Pack Tactics', 'Heat Tracking', 'Oral Tradition'],
    'The Strays': ['Signal Hacking', 'Vertical Mastery', 'Information Brokering'],
    'The Climbers': ['Wind Reading', 'Canopy Navigation', 'Tree Sense'],
    'The Symbiont Nodes': ['Data Drift', 'Wireless Presence', 'Distributed Consciousness'],
    'The Void-Born': ['Orbital Awareness', 'Augmented Precision', 'Cold Logic'],
    'The Scrappers': ['Implant Repair', 'Tech Jury-Rig', 'Salvage Sense'],
    'Digitized Humans': ['Data Upload', 'Core Processing', 'Consciousness Transfer']
  };

  return abilities[caste] || ['Survival', 'Learning', 'Adaptation'];
}
