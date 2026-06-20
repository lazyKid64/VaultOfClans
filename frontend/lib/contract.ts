// Contract configuration
// IMPORTANT: Update this address after redeploying the new VaultOfClans contract
export const VAULT_ADDRESS = "0x636Ff98761076f641e724EdAF1B0B452C20Cc783";
export const CHAIN_ID = 11155111; // Sepolia

// VaultOfClans ABI (updated with Ownable, fee fix, token integration)
export const VAULT_ABI = [
  // ============ WRITE FUNCTIONS ============
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "daysLocked", type: "uint256" }],
    name: "trainWizard",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "trainGiant",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "clanId", type: "uint256" }],
    name: "joinClan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_gold", type: "address" },
      { internalType: "address", name: "_elixir", type: "address" },
      { internalType: "address", name: "_assets", type: "address" },
    ],
    name: "setTokenContracts",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ============ READ FUNCTIONS ============
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "townHall",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "xp",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "trainingEnd",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "feeReduced",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getWithdrawFeeBps",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_FEE_BPS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REDUCED_FEE_BPS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "accumulatedFees",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokensConfigured",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint8", name: "", type: "uint8" },
    ],
    name: "troops",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "clanOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "clans",
    outputs: [
      { internalType: "uint256", name: "totalBalance", type: "uint256" },
      { internalType: "uint256", name: "level", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // ============ EVENTS ============
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" },
    ],
    name: "Withdrawal",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "level", type: "uint256" },
    ],
    name: "TownHallUpgraded",
    type: "event",
  },
] as const;

// Troop enum values (match contract + ERC-1155 token IDs)
export enum Troop {
  Barbarian = 0,
  Archer = 1,
  Giant = 2,
  Wizard = 3,
}

// ============ TOKEN CONTRACT ADDRESSES ============
// Update these after deploying the token contracts
export const GOLD_ADDRESS = "0xB5126dfC0158DfA1c6cd6a78CcEc759B00D6f260";
export const ELIXIR_ADDRESS = "0x0599927D3a61904199F386265370F01198F722E5";
export const ASSETS_ADDRESS = "0xAAe15788ed6bfa51AE61F2987eB3aB637cF22148";

// ERC-20 minimal ABI (for reading balances)
export const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ERC-1155 minimal ABI (for reading NFT balances)
export const ERC1155_ABI = [
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
