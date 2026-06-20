// =====================================================
// MOCK DATA FOR VAULT OF CLANS
// Replace these objects with real smart contract data
// when integrating Web3 functionality
// =====================================================

export interface PlayerData {
  address: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  villageLevel: number;
  joinedDate: string;
}

export interface ResourceData {
  ethBalance: number;
  storedGold: number;
  maxGold: number;
  storedElixir: number;
  maxElixir: number;
  gems: number;
}

export interface Building {
  id: string;
  name: string;
  type: 'army-camp' | 'barracks' | 'treasury' | 'laboratory' | 'clan-castle';
  level: number;
  maxLevel: number;
  description: string;
  capacity?: number;
  currentUnits?: number;
  upgradeTime?: string;
  upgradeCost?: {
    gold?: number;
    elixir?: number;
  };
  position: { x: number; y: number };
}

export interface TroopData {
  id: string;
  name: string;
  level: number;
  count: number;
  maxCount: number;
  icon: string;
}

export interface VaultData {
  totalDeposited: number;
  withdrawable: number;
  locked: number;
  cooldownEndTime: number; // Unix timestamp
  lastDepositTime: number;
  apy: number;
  pendingRewards: number;
}

// =====================================================
// PLAYER & RESOURCES
// =====================================================

export const mockPlayer: PlayerData = {
  address: '0x1234...5678',
  level: 12,
  experience: 8450,
  experienceToNextLevel: 10000,
  villageLevel: 8,
  joinedDate: '2024-06-15',
};

export const mockResources: ResourceData = {
  ethBalance: 2.458,
  storedGold: 845000,
  maxGold: 1000000,
  storedElixir: 623000,
  maxElixir: 1000000,
  gems: 1250,
};

// =====================================================
// BUILDINGS
// =====================================================

export const mockBuildings: Building[] = [
  {
    id: 'army-camp-1',
    name: 'Army Camp',
    type: 'army-camp',
    level: 7,
    maxLevel: 12,
    description: 'Houses your troops. Upgrade to increase troop capacity.',
    capacity: 200,
    currentUnits: 165,
    upgradeTime: '2d 4h',
    upgradeCost: { gold: 150000 },
    position: { x: 20, y: 30 },
  },
  {
    id: 'barracks-1',
    name: 'Barracks',
    type: 'barracks',
    level: 9,
    maxLevel: 15,
    description: 'Train troops for battle. Higher levels unlock stronger units.',
    capacity: 50,
    currentUnits: 23,
    upgradeTime: '3d 12h',
    upgradeCost: { elixir: 200000 },
    position: { x: 50, y: 20 },
  },
  {
    id: 'treasury-1',
    name: 'Treasury',
    type: 'treasury',
    level: 5,
    maxLevel: 10,
    description: 'Secure vault for your ETH. Stake and earn rewards.',
    capacity: 10,
    upgradeTime: '4d 8h',
    upgradeCost: { gold: 500000 },
    position: { x: 50, y: 55 },
  },
];

// =====================================================
// TROOPS
// =====================================================

export const mockTroops: TroopData[] = [
  { id: 'barbarian', name: 'Barbarian', level: 6, count: 45, maxCount: 60, icon: 'sword' },
  { id: 'archer', name: 'Archer', level: 5, count: 30, maxCount: 50, icon: 'target' },
  { id: 'giant', name: 'Giant', level: 4, count: 12, maxCount: 20, icon: 'shield' },
  { id: 'wizard', name: 'Wizard', level: 3, count: 8, maxCount: 15, icon: 'sparkles' },
  { id: 'dragon', name: 'Dragon', level: 2, count: 3, maxCount: 5, icon: 'flame' },
];

// =====================================================
// VAULT / TREASURY DATA
// =====================================================

export const mockVaultData: VaultData = {
  totalDeposited: 5.234,
  withdrawable: 3.127,
  locked: 2.107,
  cooldownEndTime: Date.now() + 86400000 * 2, // 2 days from now
  lastDepositTime: Date.now() - 86400000 * 5, // 5 days ago
  apy: 8.5,
  pendingRewards: 0.0234,
};

// =====================================================
// HELPER FUNCTIONS
// These simulate what would be smart contract calls
// =====================================================

export function formatETH(value: number): string {
  return value.toFixed(4);
}

export function formatGold(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

export function getTimeRemaining(endTime: number): string {
  const now = Date.now();
  const diff = endTime - now;
  
  if (diff <= 0) return 'Ready';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
