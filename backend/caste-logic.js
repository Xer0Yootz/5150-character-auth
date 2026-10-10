const ZODIAC = [
  { name: 'Capricorn', start: [12, 22], end: [1, 19] },
  { name: 'Aquarius', start: [1, 20], end: [2, 18] },
  { name: 'Pisces', start: [2, 19], end: [3, 20] },
  { name: 'Aries', start: [3, 21], end: [4, 19] },
  { name: 'Taurus', start: [4, 20], end: [5, 20] },
  { name: 'Gemini', start: [5, 21], end: [6, 20] },
  { name: 'Cancer', start: [6, 21], end: [7, 22] },
  { name: 'Leo', start: [7, 23], end: [8, 22] },
  { name: 'Virgo', start: [8, 23], end: [9, 22] },
  { name: 'Libra', start: [9, 23], end: [10, 22] },
  { name: 'Scorpio', start: [10, 23], end: [11, 21] },
  { name: 'Sagittarius', start: [11, 22], end: [12, 21] }
];

const CASTE_BY_CLIMATE = {
  tropical: {
    Aries: 'Pulse', Taurus: 'Deep', Gemini: 'Flow', Cancer: 'Vein',
    Leo: 'Pulse', Virgo: 'Deep', Libra: 'Flow', Scorpio: 'Vein',
    Sagittarius: 'Pulse', Capricorn: 'Deep', Aquarius: 'Flow', Pisces: 'Vein'
  },
  temperate: {
    Aries: 'Flow', Taurus: 'Pulse', Gemini: 'Vein', Cancer: 'Deep',
    Leo: 'Flow', Virgo: 'Pulse', Libra: 'Vein', Scorpio: 'Deep',
    Sagittarius: 'Flow', Capricorn: 'Pulse', Aquarius: 'Vein', Pisces: 'Deep'
  },
  cold: {
    Aries: 'Deep', Taurus: 'Vein', Gemini: 'Pulse', Cancer: 'Flow',
    Leo: 'Deep', Virgo: 'Vein', Libra: 'Pulse', Scorpio: 'Flow',
    Sagittarius: 'Deep', Capricorn: 'Vein', Aquarius: 'Pulse', Pisces: 'Flow'
  },
  arid: {
    Aries: 'Vein', Taurus: 'Flow', Gemini: 'Deep', Cancer: 'Pulse',
    Leo: 'Vein', Virgo: 'Flow', Libra: 'Deep', Scorpio: 'Pulse',
    Sagittarius: 'Vein', Capricorn: 'Flow', Aquarius: 'Deep', Pisces: 'Pulse'
  }
};

export function zodiacFromDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  for (const sign of ZODIAC) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    const afterStart = month > startMonth || (month === startMonth && day >= startDay);
    const beforeEnd = month < endMonth || (month === endMonth && day <= endDay);
    if (startMonth > endMonth) {
      if (afterStart || beforeEnd) return sign.name;
    } else if (afterStart && beforeEnd) {
      return sign.name;
    }
  }
  return null;
}

export function climateFromLocation({ latitude, longitude }) {
  const lat = Number(latitude);
  if (!Number.isFinite(lat)) return 'temperate';
  const abs = Math.abs(lat);
  if (abs < 23.5) return 'tropical';
  if (abs < 45) return 'temperate';
  if (abs < 66) return 'cold';
  return 'cold';
}

export function assignCaste({ birthDate, latitude, longitude }) {
  const zodiac = zodiacFromDate(birthDate);
  const climate = climateFromLocation({ latitude, longitude });
  if (!zodiac) {
    return { zodiac: null, climate, caste: null, note: 'Birth date is required.' };
  }
  const table = CASTE_BY_CLIMATE[climate] || CASTE_BY_CLIMATE.temperate;
  return {
    zodiac,
    climate,
    caste: table[zodiac],
    note: 'First-pass map. Not final canon.'
  };
}
