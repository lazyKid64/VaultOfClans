# 🏰 Vault of Clans — Web3 Village Builder & DeFi Staking

🛡️ **Build your village, train your army, and stake your assets in a gamified decentralized finance strategy simulator.**

[![Solidity Version](https://img.shields.io/badge/Solidity-0.8.20-8B5A2B?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![React Version](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Next.js Framework](https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TailwindCSS styling](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Foundry Toolchain](https://img.shields.io/badge/Foundry-Forge-FF5733?style=for-the-badge&logo=rust&logoColor=white)](https://book.getfoundry.sh/)
[![Tests Passing](https://img.shields.io/badge/Tests-57%2F57%20Passed-22C55E?style=for-the-badge&logo=github-actions&logoColor=white)](#-testing-suite)
[![Skill Level](https://img.shields.io/badge/Skill%20Level-Beginner-brightgreen?style=for-the-badge)](https://github.com/lazyKid64/VaultOfClans)

---

## 🎮 Introduction

**Vault of Clans** is a decentralized Web3 strategy and village-building application that wraps complex decentralized finance (DeFi) yield actions in an interactive, gamified strategy wrapper. 

Instead of staring at dry charts and basic tables, players interact with a premium isometric 3D village grid. Depositing assets translates directly to constructing and stocking your treasury, while time-locking liquidity yields powerful troop units, generating village experience ($XP$) and unlocking fee reduction benefits.

---

## 🛠️ Technology Stack & Beginner Level Classification

This repository is designed as a **beginner-friendly dApp template** showcasing how to bind core ERC standards (ERC-20, ERC-721) and custom vault time-locking mechanics to a modern client application.

### Backend (Smart Contracts)
*   **Solidity (0.8.20):** Primary smart contract language.
*   **Foundry / Forge:** Compilation toolchain, fast local testing runner, and deployment utility.
*   **OpenZeppelin Contracts:** Enforces standardized implementations of `ERC20`, `ERC721`, and `Ownable` permissions.

### Frontend (User Interface)
*   **React (19.x) & Next.js (15.x):** Component architecture, server-side configurations, and client-side App Router.
*   **TypeScript:** Type-safe development environment for contract interaction variables.
*   **Tailwind CSS:** Premium styling framework used to design the retro dashboard panels.
*   **Ethers.js (v6):** Blockchain wrapper connecting React custom hooks to MetaMask provider networks.

---

## 🌐 Deployed Smart Contract Addresses (Sepolia Testnet)

The project contracts are compiled and deployed on the **Ethereum Sepolia Testnet** for real blockchain interaction:

| Contract | Purpose | Deployed Address |
|---|---|---|
| **VaultOfClans** | Core staking vault and troop training | [`0x636Ff98761076f641e724EdAF1B0B452C20Cc783`](https://sepolia.etherscan.io/address/0x636Ff98761076f641e724EdAF1B0B452C20Cc783) |
| **ClashGold** | In-game $GOLD resource token (ERC-20) | [`0xB5126dfC0158DfA1c6cd6a78CcEc759B00D6f260`](https://sepolia.etherscan.io/address/0xB5126dfC0158DfA1c6cd6a78CcEc759B00D6f260) |
| **ClashElixir** | In-game $ELIXIR resource token (ERC-20) | [`0x0599927D3a61904199F386265370F01198F722E5`](https://sepolia.etherscan.io/address/0x0599927D3a61904199F386265370F01198F722E5) |
| **ClashAssets** | Village building NFTs (ERC-721) | [`0xAAe15788ed6bfa51AE61F2987eB3aB637cF22148`](https://sepolia.etherscan.io/address/0xAAe15788ed6bfa51AE61F2987eB3aB637cF22148) |

---

## ⚔️ Gameplay Mechanics vs. On-Chain Actions

Every in-game village action executes a corresponding state mutation on the Ethereum blockchain.

| In-Game Action | On-Chain Operation | Mechanic & Requirements | Player Benefit |
|---|---|---|---|
| **Stock Treasury** | `deposit()` | Staking $ETH$ into the core Vault contract. | Increases earning balance; generates base resource points. |
| **Train Barbarian** | `spendResources()` | Burn in-game ERC-20 resources (`$GOLD` & `$ELIXIR`). | Generates basic military power; counts towards troop totals. |
| **Train Wizard** | `trainWizard(days)` | Lock staked $ETH$ inside the Vault for **1 to 7 days**. | Larger locks yield more Wizard units and boost $XP$ generation. |
| **Train Giant** | `trainGiant()` | Direct deposit transaction of **0.2 ETH** to the Vault. | Adds to active stake. Training $\ge 3$ Giants reduces withdraw fee by 90%. |
| **Join Clan** | `joinClan(clanId)` | Registers wallet address to a dynamic Clan index. | Combines stake to level up the Clan for shared multiplier perks. |
| **Claim Loot** | `withdraw(amount)` | Standard yield and principal unstaking request. | Redeems $ETH$ back to user wallet. Subject to timelocks. |

---

## 🏗️ System Architecture

The interaction flow between player actions, the frontend layer, and the core smart contracts:

```mermaid
flowchart TD
    Player([Player UI]) <--> |Interact / MetaMask Sign| NextJS[Next.js App / ethers.js]
    NextJS <--> |RPC Queries / Transact| Vault[VaultOfClans.sol]
    
    subgraph Tokens [On-Chain Token Layer]
        Vault -->|Mint Resources| Gold[ClashGold.sol ERC-20]
        Vault -->|Mint Resources| Elixir[ClashElixir.sol ERC-20]
        Vault -->|Mint Achievements| Assets[ClashAssets.sol ERC-721]
    end
    
    subgraph Clans [Clan Tracking Layer]
        Vault <-->|Read / Write Clan Balance| ClanData[(Clan Levels & Staking Balance)]
    end
```

---

## 📄 Smart Contracts in Detail

The business logic of the dApp resides in the following Solidity contracts inside `dApp/src/`:

### 1. Core Vault (`VaultOfClans.sol`)
The central coordinator that handles staking, time-locking, fee adjustments, and troop state changes.
*   **State Mappings:**
    *   `balance[address] => uint256`: Active staked ETH principal for each user.
    *   `troops[address][uint8] => uint256`: Count of active troops (0: Barbarian, 1: Archer, 2: Giant, 3: Wizard) for each player.
    *   `trainingEnd[address] => uint256`: The Unix timestamp when a user's active wizard-training timelock expires.
    *   `feeReduced[address] => bool`: Tracks whether the user is currently qualified for the 90% fee reduction discount.
    *   `clanOf[address] => uint256`: The current Clan ID that the player belongs to (0 if none).
    *   `clans[clanId] => Clan`: Struct storing collective `totalBalance` and `level` (increases by 1 for every 5 ETH deposited by members).
*   **Core Mechanics & Functions:**
    *   `deposit() external payable`: Stakes arbitrary ETH. Credits `balance[msg.sender]` and triggers `goldToken.mint()` and `elixirToken.mint()` to grant in-game resource points at a 1:1 ratio.
    *   `trainWizard(uint256 daysLocked) external`: Locks the user's staked principal for a duration of $1$ to $7$ days. Increments the Wizard count and updates the `trainingEnd[msg.sender]` lock timestamp.
    *   `trainGiant() external payable`: Stakers recruit Giants by sending exactly `0.2 ETH`. The ETH is added directly to their active stake (`balance`). If Giant count reaches $\ge 3$, it toggles `feeReduced[msg.sender] = true`.
    *   `withdraw(uint256 amount) external`: Unstakes ETH. Reverts if `block.timestamp < trainingEnd[msg.sender]`. Calculates the exit fee, deducts `amount` from `balance`, increases the vault's `accumulatedFees`, and forwards `amount - fee` to the player.
    *   `joinClan(uint256 clanId) external`: Registers the user's address to the new clan. Adds their staked balance to the clan's pool and levels up the clan dynamically.

### 2. Resource Tokens (`ClashGold.sol` & `ClashElixir.sol`)
Standard ERC-20 tokens representing in-game resources.
*   Uses a custom `onlyMinter` modifier restrictively set to the `VaultOfClans` deployment address.
*   Automatically minted to users upon `deposit()` and burned from users when they recruit Barbarians or upgrade.

### 3. Troop NFTs (`ClashAssets.sol`)
Standard **ERC-1155** semi-fungible token contract tracking player army cards.
*   Token IDs mapped to troop units: `Barbarian = 0`, `Archer = 1`, `Giant = 2`, `Wizard = 3`.
*   Invoked by the `VaultOfClans` minter address during troop training to issue ownership certificates of game units directly to the player's wallet.

---

## ⚙️ Giant Fee Reduction Algorithm

Staking withdrawals are subject to a **5.0% standard withdrawal fee** (500 BPS) used to incentivize the ecosystem. However, if a player has trained $\ge 3$ Giants, their withdrawal fee is slashed by **90%** down to **0.5%** (50 BPS).

### Complete Formula & Staking State Changes:
1.  **Fee Rate Lookup:**
    $$\text{feeBps} = \begin{cases} 
          50 \text{ BPS } (0.5\%) & \text{if } \text{feeReduced[msg.sender] is true} \\
          500 \text{ BPS } (5.0\%) & \text{otherwise}
       \end{cases}$$
2.  **Fee Calculation:**
    $$\text{feeAmount} = \frac{\text{amount} \times \text{feeBps}}{10,000}$$
3.  **State Deductions:**
    $$\text{balance[msg.sender]} = \text{balance[msg.sender]} - \text{amount}$$
    $$\text{accumulatedFees} = \text{accumulatedFees} + \text{feeAmount}$$
4.  **Payout Execution:**
    The contract transfers exactly $\text{amount} - \text{feeAmount}$ to the player's wallet. The user's active vault balance is reduced by the full requested `amount` (covering both the payout and the fee).

---

## 🕹️ End-to-End User Gameplay Workflow

A player's journey from landing on the dApp to withdrawing funds follows a structured flow:

```
[Connect Wallet] ➔ [Deposit ETH] ➔ [Train Troops] ➔ [Join Clan] ➔ [Wait Lock] ➔ [Withdraw with Discount]
```

1.  **Mobilization:** The player opens the dashboard and connects their MetaMask wallet on the Sepolia Testnet.
2.  **Establish Staking Principal:** The player stakes ETH (e.g. 1.0 ETH) on the **Treasury** page, minting 1000 `$GOLD` and 1000 `$ELIXIR` resource tokens.
3.  **Recruit Army & Activate Locks:** 
    *   The player navigates to the **Army** page and burns Gold/Elixir to train basic Barbarians.
    *   To boost their $XP$, they train a Wizard, choosing a **4-day lock**. The vault freezes their 1.0 ETH principal until the 4 days expire.
    *   They train 3 Giants by sending `0.6 ETH` (`3 x 0.2 ETH`) to the vault, bringing their total stake to 1.6 ETH.
4.  **Unlock Fee Reduction:** As soon as the 3rd Giant is trained, `feeReduced` toggles to `true` for their wallet address.
5.  **Clan Affiliation:** The player joins a Clan (e.g. Clan #1) on the **Clan** page. Their 1.6 ETH stake is added to the Clan pool, increasing the Clan's level and unlocking shared yield multiplier benefits.
6.  **Unstaking Principal & Yield:** Once the 4-day Wizard lock expires, the player requests a withdrawal of 1.0 ETH. 
    *   Because they own 3 Giants, the fee is only 0.005 ETH (0.5%).
    *   Their vault balance drops to 0.6 ETH.
    *   They receive 0.995 ETH in their wallet.

---


## 🖼️ Frontend Layout

The client dashboard compiles into 5 core views:
1.  **Landing Page (`/`):** Dynamic wallet connection interface with MetaMask connection states.
2.  **Village Grid (`/village`):** Isometric layout displaying the Town Hall, Barracks, Army Camp, Treasury, and Clan Castle. Displays live $XP$ level and token resource HUDs.
3.  **Army Camp (`/army`):** Interface to view active troop configurations, train Wizards with custom day locks, and purchase Giants.
4.  **Treasury Panel (`/treasury`):** Clean deposit and withdrawal terminal with dynamic fee calculations, max-balance selectors, and active timelock countdown progress bars.
5.  **Clan Portal (`/clan`):** Interface to join clans, view collective staking pools, and monitor clan upgrade levels.

---

## 🚀 Installation & Running Locally

### Prerequisites
*   [Rust & Foundry](https://book.getfoundry.sh/getting-started/installation)
*   [Node.js (v18+)](https://nodejs.org/)

### 1. Smart Contract Sandbox (Anvil)
In your terminal, navigate to the `dApp/` root directory and start the local EVM node:
```bash
anvil
```

### 2. Compile & Deploy Contracts
Deploy the contracts to the local sandbox using Forge:
```bash
# Compile Solidity files
forge build

# Deploy to Anvil
forge script script/DeployAll.s.sol --fork-url http://localhost:8545 --broadcast
```

### 3. Start Frontend Dev Server
Navigate to the `frontend` folder, install dependencies, and start Next.js:
```bash
cd frontend

# Install package dependencies
npm install

# Start Next.js App Router in dev mode
npm run dev
```
Open `http://localhost:3000` in your browser. Configure MetaMask to connect to `Localhost 8545` (Chain ID `31337`).

---

## 🧪 Testing Suite

Vault of Clans features a comprehensive unit-test and fuzz-testing suite containing **57 check cases** in [VaultOfClans.t.sol](file:///c:/MinGW/CoC-dApp/week3-dApp/dApp/test/VaultOfClans.t.sol) to enforce security.

To run the entire suite and view gas snapshot reports:
```bash
# Run unit and fuzz tests
forge test -vvv

# Generate gas snapshots
forge snapshot
```

The test coverage guarantees:
*   **Security Bounds:** Verifies reentrancy guards and access control bounds for admin withdrawals.
*   **Timelock Validation:** Enforces locked balances cannot be withdrawn under any circumstances before `unlockTime`.
*   **Fuzz Testing:** Runs multiple randomized inputs on deposit limits, fee calculations, and clan switching to avoid calculation overflow.
