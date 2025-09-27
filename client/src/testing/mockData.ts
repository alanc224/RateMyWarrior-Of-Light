import type { PlayerInfo } from '../types/player';

export const mockWarriorData: PlayerInfo[] = [
  {
    id: '1',
    characterName: 'Thancred Waters',
    serverName: 'Gilgamesh',
    level: 90,
    job: 'Gunbreaker',
    freeCompany: 'Scions of the Seventh Dawn',
    rating: 4.8,
    reviewCount: 127
  },
  {
    id: '2',
    characterName: 'Y\'shtola Rhul',
    serverName: 'Leviathan',
    level: 90,
    job: 'Black Mage',
    freeCompany: 'Scions of the Seventh Dawn',
    rating: 4.9,
    reviewCount: 203
  },
  {
    id: '3',
    characterName: 'Alphinaud Leveilleur',
    serverName: 'Behemoth',
    level: 87,
    job: 'Sage',
    freeCompany: 'Scions of the Seventh Dawn',
    rating: 4.6,
    reviewCount: 89
  },
  {
    id: '4',
    characterName: 'Alisaie Leveilleur',
    serverName: 'Excalibur',
    level: 90,
    job: 'Red Mage',
    freeCompany: 'Scions of the Seventh Dawn',
    rating: 4.7,
    reviewCount: 156
  },
  {
    id: '5',
    characterName: 'Urianger Augurelt',
    serverName: 'Hyperion',
    level: 90,
    job: 'Astrologian',
    freeCompany: 'Scions of the Seventh Dawn',
    rating: 4.5,
    reviewCount: 78
  },
  {
    id: '6',
    characterName: 'G\'raha Tia',
    serverName: 'Malboro',
    level: 90,
    job: 'Black Mage',
    rating: 4.9,
    reviewCount: 234
  },
  {
    id: '7',
    characterName: 'Estinien Varlineau',
    serverName: 'Cactuar',
    level: 90,
    job: 'Dragoon',
    rating: 4.3,
    reviewCount: 92
  },
  {
    id: '8',
    characterName: 'Tataru Taru',
    serverName: 'Faerie',
    level: 85,
    job: 'Weaver',
    freeCompany: 'Scions of the Seventh Dawn',
    rating: 5.0,
    reviewCount: 45
  },
  {
    id: '9',
    characterName: 'Krile Baldesion',
    serverName: 'Adamantoise',
    level: 88,
    job: 'Scholar',
    rating: 4.4,
    reviewCount: 67
  },
  {
    id: '10',
    characterName: 'Haurchefant Greystone',
    serverName: 'Siren',
    level: 90,
    job: 'Paladin',
    rating: 4.9,
    reviewCount: 189
  }
];

export function getMockResults(): PlayerInfo[] {
  const randomCount = Math.floor(Math.random() * 6) + 3; // 3-8 warriors
  const shuffled = [...mockWarriorData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, randomCount);
}