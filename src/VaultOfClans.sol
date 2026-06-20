// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IClashGold {
    function mint(address to, uint256 amount) external;
}

interface IClashElixir {
    function mint(address to, uint256 amount) external;
}

interface IClashAssets {
    function mint(address to, uint256 id, uint256 amount, bytes calldata data) external;
}

contract VaultOfClans is Ownable {
    // ============================================================
    //                       STATE VARIABLES
    // ============================================================

    mapping(address => uint256) public balance;
    mapping(address => uint256) public townHall;
    mapping(address => uint256) public xp;
    mapping(address => uint256) public trainingEnd;

    // Fee system: default 500 BPS (5%), reduced to 50 BPS (0.5%) with 3+ Giants
    uint256 public constant DEFAULT_FEE_BPS = 500;
    uint256 public constant REDUCED_FEE_BPS = 50;
    mapping(address => bool) public feeReduced;

    // Accumulated protocol fees (claimable by owner)
    uint256 public accumulatedFees;

    // Troop types
    enum Troop {
        Barbarian,
        Archer,
        Giant,
        Wizard
    }
    mapping(address => mapping(uint8 => uint256)) public troops;

    // Clan system
    struct Clan {
        uint256 totalBalance;
        uint256 level;
    }
    mapping(uint256 => Clan) public clans;
    mapping(address => uint256) public clanOf;

    // Token contracts (set by owner after deployment)
    IClashGold public goldToken;
    IClashElixir public elixirToken;
    IClashAssets public assetsToken;
    bool public tokensConfigured;

    // ============================================================
    //                           EVENTS
    // ============================================================

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount, uint256 fee);
    event TownHallUpgraded(address indexed user, uint256 level);
    event TroopTrained(address indexed user, Troop troopType, uint256 count);
    event ClanJoined(address indexed user, uint256 clanId);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    event TokensConfigured(address gold, address elixir, address assets);

    // ============================================================
    //                        CONSTRUCTOR
    // ============================================================

    constructor() Ownable(msg.sender) {}

    // ============================================================
    //                      ADMIN FUNCTIONS
    // ============================================================

    /// @notice Configure the token contract addresses (call once after deploying tokens)
    function setTokenContracts(
        address _gold,
        address _elixir,
        address _assets
    ) external onlyOwner {
        require(_gold != address(0) && _elixir != address(0) && _assets != address(0), "Invalid address");
        goldToken = IClashGold(_gold);
        elixirToken = IClashElixir(_elixir);
        assetsToken = IClashAssets(_assets);
        tokensConfigured = true;
        emit TokensConfigured(_gold, _elixir, _assets);
    }

    /// @notice Withdraw accumulated protocol fees
    function withdrawFees() external onlyOwner {
        uint256 fees = accumulatedFees;
        require(fees > 0, "No fees to withdraw");
        accumulatedFees = 0;
        (bool ok, ) = payable(msg.sender).call{value: fees}("");
        require(ok, "ETH transfer failed");
        emit FeesWithdrawn(msg.sender, fees);
    }

    // ============================================================
    //                      PLAYER FUNCTIONS
    // ============================================================

    /// @notice Deposit ETH into the vault. Awards XP, trains a Barbarian, mints tokens.
    function deposit() external payable {
        require(msg.value > 0, "Send ETH");
        balance[msg.sender] += msg.value;
        xp[msg.sender] += 100;

        // Town Hall auto-upgrade based on cumulative XP
        uint256 newLevel = xp[msg.sender] / 500 + 1;
        if (newLevel > townHall[msg.sender]) {
            townHall[msg.sender] = newLevel;
            emit TownHallUpgraded(msg.sender, newLevel);
        }

        // Train 1 Barbarian
        troops[msg.sender][uint8(Troop.Barbarian)]++;
        emit TroopTrained(msg.sender, Troop.Barbarian, 1);

        // Clan contribution
        uint256 clanId = clanOf[msg.sender];
        if (clanId != 0) {
            clans[clanId].totalBalance += msg.value;
            clans[clanId].level = clans[clanId].totalBalance / 5 ether + 1;
        }

        // Mint ERC-20 and ERC-1155 tokens if configured
        if (tokensConfigured) {
            goldToken.mint(msg.sender, 100 * 1e18);    // 100 GOLD
            elixirToken.mint(msg.sender, 50 * 1e18);   // 50 ELIXIR
            assetsToken.mint(msg.sender, uint256(Troop.Barbarian), 1, ""); // 1 Barbarian NFT
        }

        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Train a Wizard by locking funds for a specified number of days
    function trainWizard(uint256 daysLocked) external {
        require(daysLocked > 0, "Invalid lock");
        trainingEnd[msg.sender] = block.timestamp + daysLocked * 1 days;
        troops[msg.sender][uint8(Troop.Wizard)]++;
        emit TroopTrained(msg.sender, Troop.Wizard, 1);

        // Mint Wizard NFT if configured
        if (tokensConfigured) {
            assetsToken.mint(msg.sender, uint256(Troop.Wizard), 1, "");
        }
    }

    /// @notice Train a Giant for 0.2 ETH. Holding 3+ Giants reduces withdrawal fees.
    function trainGiant() external payable {
        require(msg.value >= 0.2 ether, "Need more ETH");
        balance[msg.sender] += msg.value;
        troops[msg.sender][uint8(Troop.Giant)]++;
        emit TroopTrained(msg.sender, Troop.Giant, 1);

        // Check if player now qualifies for reduced fees
        if (troops[msg.sender][uint8(Troop.Giant)] >= 3 && !feeReduced[msg.sender]) {
            feeReduced[msg.sender] = true;
        }

        // Mint Giant NFT if configured
        if (tokensConfigured) {
            assetsToken.mint(msg.sender, uint256(Troop.Giant), 1, "");
        }
    }

    /// @notice Withdraw ETH from the vault (blocked during training)
    function withdraw(uint256 amount) external {
        require(block.timestamp >= trainingEnd[msg.sender], "Troops training");
        require(balance[msg.sender] >= amount, "Insufficient");

        // Calculate fee: 0.5% if fee is reduced (3+ Giants), 5% otherwise
        uint256 feeBps = feeReduced[msg.sender] ? REDUCED_FEE_BPS : DEFAULT_FEE_BPS;
        uint256 fee = (amount * feeBps) / 10_000;

        balance[msg.sender] -= amount;
        accumulatedFees += fee;

        (bool ok, ) = payable(msg.sender).call{value: amount - fee}("");
        require(ok, "ETH transfer failed");

        emit Withdrawal(msg.sender, amount, fee);
    }

    /// @notice Join a clan by ID
    function joinClan(uint256 clanId) external {
        require(clanId != 0, "Invalid clan");
        clanOf[msg.sender] = clanId;
        emit ClanJoined(msg.sender, clanId);
    }

    // ============================================================
    //                       VIEW FUNCTIONS
    // ============================================================

    /// @notice Get the effective withdrawal fee for a player (in BPS)
    function getWithdrawFeeBps(address player) external view returns (uint256) {
        return feeReduced[player] ? REDUCED_FEE_BPS : DEFAULT_FEE_BPS;
    }
}
