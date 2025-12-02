// FFXIV World Data organized by Data Center
// Source: https://na.finalfantasyxiv.com/lodestone/worldstatus/

export interface World {
  name: string;
  dataCenter: string;
  region: string;
}

export interface DataCenter {
  name: string;
  region: string;
  worlds: string[];
}

// North America Data Centers
const aetherWorlds: DataCenter = {
  name: 'Aether',
  region: 'North America',
  worlds: [
    'Adamantoise',
    'Cactuar',
    'Faerie',
    'Gilgamesh',
    'Jenova',
    'Midgardsormr',
    'Sargatanas',
    'Siren'
  ]
};

const primalWorlds: DataCenter = {
  name: 'Primal',
  region: 'North America',
  worlds: [
    'Behemoth',
    'Excalibur',
    'Exodus',
    'Famfrit',
    'Hyperion',
    'Lamia',
    'Leviathan',
    'Ultros'
  ]
};

const crystalWorlds: DataCenter = {
  name: 'Crystal',
  region: 'North America',
  worlds: [
    'Balmung',
    'Brynhildr',
    'Coeurl',
    'Diabolos',
    'Goblin',
    'Malboro',
    'Mateus',
    'Zalera'
  ]
};

const dynamis: DataCenter = {
  name: 'Dynamis',
  region: 'North America',
  worlds: [
    'Halicarnassus',
    'Maduin',
    'Marilith',
    'Seraph'
  ]
};

// Europe Data Centers
const chaosWorlds: DataCenter = {
  name: 'Chaos',
  region: 'Europe',
  worlds: [
    'Cerberus',
    'Louisoix',
    'Moogle',
    'Omega',
    'Phantom',
    'Ragnarok',
    'Sagittarius',
    'Spriggan'
  ]
};

const lightWorlds: DataCenter = {
  name: 'Light',
  region: 'Europe',
  worlds: [
    'Alpha',
    'Lich',
    'Odin',
    'Phoenix',
    'Raiden',
    'Shiva',
    'Twintania',
    'Zodiark'
  ]
};

// Japan Data Centers
const elementalWorlds: DataCenter = {
  name: 'Elemental',
  region: 'Japan',
  worlds: [
    'Aegis',
    'Atomos',
    'Carbuncle',
    'Garuda',
    'Gungnir',
    'Kujata',
    'Tonberry',
    'Typhon'
  ]
};

const gaia: DataCenter = {
  name: 'Gaia',
  region: 'Japan',
  worlds: [
    'Alexander',
    'Bahamut',
    'Durandal',
    'Fenrir',
    'Ifrit',
    'Ridill',
    'Tiamat',
    'Ultima'
  ]
};

const mana: DataCenter = {
  name: 'Mana',
  region: 'Japan',
  worlds: [
    'Anima',
    'Asura',
    'Chocobo',
    'Hades',
    'Ixion',
    'Masamune',
    'Pandaemonium',
    'Titan'
  ]
};

const meteor: DataCenter = {
  name: 'Meteor',
  region: 'Japan',
  worlds: [
    'Belias',
    'Mandragora',
    'Ramuh',
    'Shinryu',
    'Unicorn',
    'Valefor',
    'Yojimbo',
    'Zeromus'
  ]
};

// Oceania Data Centers
const materia: DataCenter = {
  name: 'Materia',
  region: 'Oceania',
  worlds: [
    'Bismarck',
    'Ravana',
    'Sephirot',
    'Sophia',
    'Zurvan'
  ]
};

// Export all data centers grouped by region
export const dataCenters: Record<string, DataCenter[]> = {
  'North America': [aetherWorlds, primalWorlds, crystalWorlds, dynamis],
  'Europe': [chaosWorlds, lightWorlds],
  'Japan': [elementalWorlds, gaia, mana, meteor],
  'Oceania': [materia]
};

// Flat list of all worlds
export const allWorlds: World[] = Object.entries(dataCenters).flatMap(([region, dcs]) =>
  dcs.flatMap(dc =>
    dc.worlds.map(world => ({
      name: world,
      dataCenter: dc.name,
      region: region
    }))
  )
);

// Helper function to get worlds by data center
export function getWorldsByDataCenter(dataCenterName: string): string[] {
  for (const dcs of Object.values(dataCenters)) {
    const dc = dcs.find(d => d.name === dataCenterName);
    if (dc) return dc.worlds;
  }
  return [];
}

// Helper function to get data center by world
export function getDataCenterByWorld(worldName: string): string | null {
  const world = allWorlds.find(w => w.name === worldName);
  return world ? world.dataCenter : null;
}