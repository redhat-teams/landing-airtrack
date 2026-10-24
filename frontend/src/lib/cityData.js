// Abidjan stylisé (viewBox 1600 × 1000) : lagune Ébrié, océan, quartiers, ponts et itinéraires des trackers.
// Ce n'est pas une carte exacte : une évocation lisible de la ville où AirTrack est né.

export const VIEW = { w: 1600, h: 1000 };

export const LAGOON =
  'M0,600 C200,570 300,612 372,592 C396,566 392,476 420,440 C452,474 452,560 484,586 C560,604 640,572 700,576 C760,582 822,572 880,562 C902,520 906,422 940,382 C976,422 972,520 1002,560 C1100,582 1200,560 1320,590 C1420,616 1520,586 1600,600 L1600,664 C1500,650 1400,682 1300,666 C1200,650 1100,692 980,676 C880,662 760,692 640,672 C520,650 420,692 300,668 C200,650 100,682 0,666 Z';

export const OCEAN = 'M0,902 C300,880 600,908 900,890 C1200,874 1400,902 1600,884 L1600,1000 L0,1000 Z';

export const DISTRICTS = [
  { name: 'Abobo', x: 860, y: 150 },
  { name: 'Adjamé', x: 640, y: 330 },
  { name: 'Plateau', x: 792, y: 508 },
  { name: 'Cocody', x: 1120, y: 430 },
  { name: 'Riviera', x: 1370, y: 250 },
  { name: 'Yopougon', x: 190, y: 400 },
  { name: 'Attécoubé', x: 520, y: 500 },
  { name: 'Treichville', x: 740, y: 760 },
  { name: 'Marcory', x: 1010, y: 740 },
  { name: 'Koumassi', x: 1270, y: 740 },
  { name: 'Port-Bouët', x: 1100, y: 868 },
];

// Grands axes (lignes plus visibles) et ponts sur la lagune.
export const ROADS = [
  'M120,470 C300,430 420,380 520,400 C600,410 640,380 680,330 C720,260 780,220 840,170',
  'M520,400 C600,450 700,480 780,520 C860,540 980,500 1150,450 C1260,420 1360,380 1480,330',
  'M680,330 C760,360 900,380 1020,350 C1120,330 1240,290 1330,230',
  'M640,720 C760,760 900,720 1080,740 C1200,750 1300,720 1460,740',
  'M800,790 C900,820 1000,860 1300,800',
  'M200,300 C300,260 420,240 560,230 C700,220 760,200 840,170',
];
export const BRIDGES = [
  { name: 'Pont FHB', d: 'M770,578 L752,676' },
  { name: 'Pont de Gaulle', d: 'M845,566 L850,690' },
  { name: 'Pont HKB', d: 'M1150,574 L1132,668' },
];

// Zone géographique surveillée (alerte d'entrée / sortie).
export const GEOFENCE = { name: 'Plateau', cx: 812, cy: 528, r: 78 };

// Trackers simulés : itinéraire fermé, vitesse de croisière (px/s à l'écran), plage km/h affichée, arrêts.
export const FLEET = [
  {
    id: 'yaris',
    name: 'Toyota Yaris',
    emoji: '🚗',
    category: 'car',
    route: 'M1150,452 C1050,470 980,500 900,520 C870,528 850,534 842,548 L846,620 L850,690 C920,722 1050,724 1122,702 L1134,620 L1150,540 Z',
    pxPerSec: 62,
    kmh: [38, 56],
    stops: [{ at: 0.27, s: 3.5 }],
    battery: 82,
    online: true,
    offset: 0.05,
  },
  {
    id: 'djakarta',
    name: 'Moto Djakarta',
    emoji: '🏍️',
    category: 'moto',
    route: 'M200,470 C300,430 420,380 520,400 C600,410 640,380 680,330 C720,260 780,220 822,190 C700,180 560,240 450,300 C350,350 250,382 200,470 Z',
    pxPerSec: 78,
    kmh: [32, 61],
    stops: [{ at: 0.52, s: 2.5 }],
    battery: 64,
    online: true,
    offset: 0.3,
  },
  {
    id: 'camion',
    name: 'Camion livraison',
    emoji: '🚚',
    category: 'truck',
    route: 'M980,858 C1100,850 1250,842 1300,790 C1320,742 1200,722 1080,740 C960,758 860,770 800,792 C760,822 820,860 980,858 Z',
    pxPerSec: 54,
    kmh: [44, 86],
    stops: [{ at: 0.6, s: 4.5 }],
    battery: 91,
    online: true,
    offset: 0.55,
  },
  {
    id: 'sac',
    name: 'Sac école',
    emoji: '🎒',
    category: 'object',
    route: 'M1300,330 C1380,300 1450,340 1440,400 C1430,460 1340,470 1300,430 C1262,400 1252,352 1300,330 Z',
    pxPerSec: 14,
    kmh: [4, 6],
    stops: [{ at: 0.1, s: 6 }],
    battery: 24,
    online: true,
    offset: 0.6,
  },
  {
    id: 'cles',
    name: 'Clés maison',
    emoji: '🔑',
    category: 'keys',
    route: 'M962,800 L963,800 Z',
    pxPerSec: 0,
    kmh: [0, 0],
    stops: [],
    battery: 47,
    online: false,
    offset: 0,
    lastSeenS: 3 * 3600 + 12 * 60,
  },
];
