// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {VaultOfClans} from "../src/VaultOfClans.sol";
import {ClashGold} from "../src/ClashGold.sol";
import {ClashElixir} from "../src/ClashElixir.sol";
import {ClashAssets} from "../src/ClashAssets.sol";

contract VaultOfClansTest is Test {
    VaultOfClans public vault;
    ClashGold public gold;
    ClashElixir public elixir;
    ClashAssets public assets;

    address public owner;
    address public user1;
    address public user2;
    address public attacker;

    // Mirror the events from the contract
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount, uint256 fee);
    event TownHallUpgraded(address indexed user, uint256 level);
    event TroopTrained(address indexed user, VaultOfClans.Troop troopType, uint256 count);
    event ClanJoined(address indexed user, uint256 clanId);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    event TokensConfigured(address gold, address elixir, address assets);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        attacker = makeAddr("attacker");

        // Fund test accounts
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(attacker, 10 ether);

        // Deploy all contracts
        gold = new ClashGold();
        elixir = new ClashElixir();
        assets = new ClashAssets();
        vault = new VaultOfClans();

        // Set up minters
        gold.setMinter(address(vault));
        elixir.setMinter(address(vault));
        assets.setMinter(address(vault));

        // Configure tokens in vault
        vault.setTokenContracts(address(gold), address(elixir), address(assets));
    }

    // ============================================================
    //                    1. DEPLOYMENT & SETUP TESTS
    // ============================================================

    function test_DeploymentState() public view {
        assertEq(vault.owner(), owner);
        assertTrue(vault.tokensConfigured());
        assertEq(vault.DEFAULT_FEE_BPS(), 500);
        assertEq(vault.REDUCED_FEE_BPS(), 50);
    }

    function test_TokenContractsConfigured() public view {
        assertEq(address(vault.goldToken()), address(gold));
        assertEq(address(vault.elixirToken()), address(elixir));
        assertEq(address(vault.assetsToken()), address(assets));
    }

    function test_SetTokenContracts_EmitsEvent() public {
        VaultOfClans newVault = new VaultOfClans();
        vm.expectEmit(true, true, true, true);
        emit TokensConfigured(address(gold), address(elixir), address(assets));
        newVault.setTokenContracts(address(gold), address(elixir), address(assets));
    }

    function test_SetTokenContracts_RejectsZeroAddress() public {
        VaultOfClans newVault = new VaultOfClans();
        vm.expectRevert("Invalid address");
        newVault.setTokenContracts(address(0), address(elixir), address(assets));

        vm.expectRevert("Invalid address");
        newVault.setTokenContracts(address(gold), address(0), address(assets));

        vm.expectRevert("Invalid address");
        newVault.setTokenContracts(address(gold), address(elixir), address(0));
    }

    function test_SetTokenContracts_OnlyOwner() public {
        VaultOfClans newVault = new VaultOfClans();
        vm.prank(user1);
        vm.expectRevert();
        newVault.setTokenContracts(address(gold), address(elixir), address(assets));
    }

    // ============================================================
    //                    2. DEPOSIT TESTS
    // ============================================================

    function test_Deposit_BasicSuccess() public {
        vm.prank(user1);
        vault.deposit{value: 1 ether}();

        assertEq(vault.balance(user1), 1 ether);
        assertEq(vault.xp(user1), 100);
        assertEq(vault.troops(user1, 0), 1); // 1 Barbarian
    }

    function test_Deposit_MintsTokens() public {
        vm.prank(user1);
        vault.deposit{value: 1 ether}();

        assertEq(gold.balanceOf(user1), 100 * 1e18);
        assertEq(elixir.balanceOf(user1), 50 * 1e18);
        assertEq(assets.balanceOf(user1, 0), 1); // 1 Barbarian NFT
    }

    function test_Deposit_EmitsEvents() public {
        vm.startPrank(user1);

        vm.expectEmit(true, false, false, true);
        emit TownHallUpgraded(user1, 1);
        vm.expectEmit(true, false, false, true);
        emit TroopTrained(user1, VaultOfClans.Troop.Barbarian, 1);
        vm.expectEmit(true, false, false, true);
        emit Deposit(user1, 1 ether);

        vault.deposit{value: 1 ether}();
        vm.stopPrank();
    }

    function test_Deposit_RevertsWithZeroValue() public {
        vm.prank(user1);
        vm.expectRevert("Send ETH");
        vault.deposit{value: 0}();
    }

    function test_Deposit_MultipleDeposits() public {
        vm.startPrank(user1);

        vault.deposit{value: 1 ether}();
        vault.deposit{value: 2 ether}();
        vault.deposit{value: 0.5 ether}();

        assertEq(vault.balance(user1), 3.5 ether);
        assertEq(vault.xp(user1), 300); // 100 * 3
        assertEq(vault.troops(user1, 0), 3); // 3 Barbarians
        assertEq(gold.balanceOf(user1), 300 * 1e18);
        assertEq(elixir.balanceOf(user1), 150 * 1e18);

        vm.stopPrank();
    }

    function test_Deposit_TownHallAutoUpgrade() public {
        vm.startPrank(user1);

        // 5 deposits → 500 XP → TH Level should become 2 (500/500 + 1 = 2)
        for (uint i = 0; i < 5; i++) {
            vault.deposit{value: 0.01 ether}();
        }
        assertEq(vault.xp(user1), 500);
        assertEq(vault.townHall(user1), 2); // 500/500 + 1 = 2

        vm.stopPrank();
    }

    function test_Deposit_ClanContribution() public {
        vm.startPrank(user1);
        vault.joinClan(1);
        vault.deposit{value: 5 ether}();

        (uint256 totalBalance, uint256 level) = vault.clans(1);
        assertEq(totalBalance, 5 ether);
        assertEq(level, 2); // 5 ether / 5 ether + 1 = 2
        vm.stopPrank();
    }

    function test_Deposit_NoClanContribution() public {
        vm.prank(user1);
        vault.deposit{value: 1 ether}();

        // clanOf is 0 (default), so no clan contribution
        (uint256 totalBalance, uint256 level) = vault.clans(0);
        assertEq(totalBalance, 0);
        assertEq(level, 0);
    }

    function test_Deposit_WithoutTokensConfigured() public {
        VaultOfClans bareVault = new VaultOfClans();
        vm.deal(user1, 10 ether);
        vm.prank(user1);
        bareVault.deposit{value: 1 ether}();

        assertEq(bareVault.balance(user1), 1 ether);
        assertEq(bareVault.xp(user1), 100);
        assertFalse(bareVault.tokensConfigured());
    }

    // ============================================================
    //                    3. WITHDRAWAL TESTS
    // ============================================================

    function test_Withdraw_BasicSuccess() public {
        vm.startPrank(user1);
        vault.deposit{value: 10 ether}();

        uint256 balBefore = user1.balance;
        vault.withdraw(1 ether);

        // Default fee = 5% → fee = 0.05 ETH → user receives 0.95 ETH
        uint256 expectedFee = (1 ether * 500) / 10_000;
        assertEq(vault.balance(user1), 9 ether);
        assertEq(user1.balance, balBefore + 1 ether - expectedFee);
        assertEq(vault.accumulatedFees(), expectedFee);

        vm.stopPrank();
    }

    function test_Withdraw_EmitsEvent() public {
        vm.startPrank(user1);
        vault.deposit{value: 10 ether}();

        uint256 expectedFee = (1 ether * 500) / 10_000;
        vm.expectEmit(true, false, false, true);
        emit Withdrawal(user1, 1 ether, expectedFee);
        vault.withdraw(1 ether);

        vm.stopPrank();
    }

    function test_Withdraw_InsufficientBalance() public {
        vm.startPrank(user1);
        vault.deposit{value: 1 ether}();
        vm.expectRevert("Insufficient");
        vault.withdraw(2 ether);
        vm.stopPrank();
    }

    function test_Withdraw_FullBalance() public {
        vm.startPrank(user1);
        vault.deposit{value: 1 ether}();
        vault.withdraw(1 ether);

        assertEq(vault.balance(user1), 0);
        vm.stopPrank();
    }

    function test_Withdraw_BlockedDuringTraining() public {
        vm.startPrank(user1);
        vault.deposit{value: 1 ether}();
        vault.trainWizard(1); // Lock for 1 day

        vm.expectRevert("Troops training");
        vault.withdraw(0.5 ether);

        vm.stopPrank();
    }

    function test_Withdraw_AllowedAfterTraining() public {
        vm.startPrank(user1);
        vault.deposit{value: 1 ether}();
        vault.trainWizard(1);

        // Warp forward past training end
        vm.warp(block.timestamp + 1 days + 1);

        vault.withdraw(0.5 ether);
        assertEq(vault.balance(user1), 0.5 ether);

        vm.stopPrank();
    }

    // ============================================================
    //                    4. FEE SYSTEM TESTS
    // ============================================================

    function test_Fee_DefaultIs500BPS() public {
        assertEq(vault.getWithdrawFeeBps(user1), 500);
    }

    function test_Fee_ReducedWith3Giants() public {
        vm.startPrank(user1);

        // Train 3 Giants (each costs 0.2 ETH)
        vault.trainGiant{value: 0.2 ether}();
        vault.trainGiant{value: 0.2 ether}();
        vault.trainGiant{value: 0.2 ether}();

        assertTrue(vault.feeReduced(user1));
        assertEq(vault.getWithdrawFeeBps(user1), 50); // 0.5%

        vm.stopPrank();
    }

    function test_Fee_NotReducedWith2Giants() public {
        vm.startPrank(user1);
        vault.trainGiant{value: 0.2 ether}();
        vault.trainGiant{value: 0.2 ether}();

        assertFalse(vault.feeReduced(user1));
        assertEq(vault.getWithdrawFeeBps(user1), 500); // 5%

        vm.stopPrank();
    }

    function test_Fee_ReducedFeeAppliedOnWithdrawal() public {
        vm.startPrank(user1);

        vault.deposit{value: 10 ether}();

        // Train 3 giants
        vault.trainGiant{value: 0.2 ether}();
        vault.trainGiant{value: 0.2 ether}();
        vault.trainGiant{value: 0.2 ether}();

        uint256 balBefore = user1.balance;
        vault.withdraw(1 ether);

        // Reduced fee = 0.5% → fee = 0.005 ETH
        uint256 expectedFee = (1 ether * 50) / 10_000;
        assertEq(user1.balance, balBefore + 1 ether - expectedFee);

        vm.stopPrank();
    }

    function test_Fee_CalculationEdgeCases() public {
        vm.startPrank(user1);
        vault.deposit{value: 10 ether}();

        // Withdrawing 1 wei should still calculate a fee (though it may round to 0)
        vault.withdraw(1);
        // fee = (1 * 500) / 10000 = 0 (rounding down)
        assertEq(vault.accumulatedFees(), 0);

        vm.stopPrank();
    }

    // ============================================================
    //                    5. TRAIN WIZARD TESTS
    // ============================================================

    function test_TrainWizard_Success() public {
        vm.prank(user1);
        vault.trainWizard(7);

        assertEq(vault.troops(user1, 3), 1); // 1 Wizard
        assertEq(vault.trainingEnd(user1), block.timestamp + 7 days);
        assertEq(assets.balanceOf(user1, 3), 1); // Wizard NFT
    }

    function test_TrainWizard_RevertsWithZeroDays() public {
        vm.prank(user1);
        vm.expectRevert("Invalid lock");
        vault.trainWizard(0);
    }

    function test_TrainWizard_EmitsEvent() public {
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit TroopTrained(user1, VaultOfClans.Troop.Wizard, 1);
        vault.trainWizard(3);
    }

    function test_TrainWizard_MultipleTrainings() public {
        vm.startPrank(user1);
        vault.trainWizard(1);
        vault.trainWizard(2); // Overwrites trainingEnd

        assertEq(vault.troops(user1, 3), 2); // 2 Wizards
        assertEq(vault.trainingEnd(user1), block.timestamp + 2 days);

        vm.stopPrank();
    }

    // ============================================================
    //                    6. TRAIN GIANT TESTS
    // ============================================================

    function test_TrainGiant_Success() public {
        vm.prank(user1);
        vault.trainGiant{value: 0.2 ether}();

        assertEq(vault.troops(user1, 2), 1); // 1 Giant
        assertEq(vault.balance(user1), 0.2 ether);
        assertEq(assets.balanceOf(user1, 2), 1); // Giant NFT
    }

    function test_TrainGiant_RevertsInsufficientETH() public {
        vm.prank(user1);
        vm.expectRevert("Need more ETH");
        vault.trainGiant{value: 0.19 ether}();
    }

    function test_TrainGiant_AcceptsExactAmount() public {
        vm.prank(user1);
        vault.trainGiant{value: 0.2 ether}();
        assertEq(vault.troops(user1, 2), 1);
    }

    function test_TrainGiant_AcceptsOverpayment() public {
        vm.prank(user1);
        vault.trainGiant{value: 1 ether}();

        assertEq(vault.balance(user1), 1 ether);
        assertEq(vault.troops(user1, 2), 1);
    }

    function test_TrainGiant_EmitsEvent() public {
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit TroopTrained(user1, VaultOfClans.Troop.Giant, 1);
        vault.trainGiant{value: 0.2 ether}();
    }

    // ============================================================
    //                    7. CLAN SYSTEM TESTS
    // ============================================================

    function test_JoinClan_Success() public {
        vm.prank(user1);
        vault.joinClan(1);

        assertEq(vault.clanOf(user1), 1);
    }

    function test_JoinClan_RevertsWithZero() public {
        vm.prank(user1);
        vm.expectRevert("Invalid clan");
        vault.joinClan(0);
    }

    function test_JoinClan_EmitsEvent() public {
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit ClanJoined(user1, 42);
        vault.joinClan(42);
    }

    function test_JoinClan_SwitchClan() public {
        vm.startPrank(user1);
        vault.joinClan(1);
        vault.joinClan(2);
        assertEq(vault.clanOf(user1), 2);
        vm.stopPrank();
    }

    function test_ClanLevel_IncreasesWithDeposits() public {
        vm.startPrank(user1);
        vault.joinClan(1);
        vault.deposit{value: 10 ether}();

        (, uint256 level) = vault.clans(1);
        assertEq(level, 3); // 10 / 5 + 1 = 3

        vm.stopPrank();
    }

    function test_ClanLevel_MultipleUsers() public {
        // User 1 joins clan 1 and deposits
        vm.startPrank(user1);
        vault.joinClan(1);
        vault.deposit{value: 3 ether}();
        vm.stopPrank();

        // User 2 joins clan 1 and deposits
        vm.startPrank(user2);
        vault.joinClan(1);
        vault.deposit{value: 3 ether}();
        vm.stopPrank();

        (uint256 totalBalance, uint256 level) = vault.clans(1);
        assertEq(totalBalance, 6 ether);
        assertEq(level, 2); // 6 / 5 + 1 = 2
    }

    // ============================================================
    //                    8. ADMIN / OWNER TESTS
    // ============================================================

    function test_WithdrawFees_Success() public {
        // Generate some fees
        vm.startPrank(user1);
        vault.deposit{value: 10 ether}();
        vault.withdraw(10 ether);
        vm.stopPrank();

        // Fee = 5% of 10 ETH = 0.5 ETH
        uint256 expectedFee = (10 ether * 500) / 10_000;
        assertEq(vault.accumulatedFees(), expectedFee);

        uint256 ownerBalBefore = owner.balance;
        vault.withdrawFees();

        assertEq(vault.accumulatedFees(), 0);
        assertEq(owner.balance, ownerBalBefore + expectedFee);
    }

    function test_WithdrawFees_EmitsEvent() public {
        vm.startPrank(user1);
        vault.deposit{value: 10 ether}();
        vault.withdraw(10 ether);
        vm.stopPrank();

        uint256 expectedFee = (10 ether * 500) / 10_000;
        vm.expectEmit(true, false, false, true);
        emit FeesWithdrawn(owner, expectedFee);
        vault.withdrawFees();
    }

    function test_WithdrawFees_RevertsIfNoFees() public {
        vm.expectRevert("No fees to withdraw");
        vault.withdrawFees();
    }

    function test_WithdrawFees_OnlyOwner() public {
        vm.startPrank(user1);
        vault.deposit{value: 10 ether}();
        vault.withdraw(10 ether);
        vm.stopPrank();

        vm.prank(user1);
        vm.expectRevert();
        vault.withdrawFees();
    }

    // ============================================================
    //                    9. EDGE CASES & SECURITY
    // ============================================================

    function test_Deposit_VerySmallAmount() public {
        vm.prank(user1);
        vault.deposit{value: 1}();
        assertEq(vault.balance(user1), 1);
    }

    function test_Withdraw_ZeroAmount() public {
        vm.startPrank(user1);
        vault.deposit{value: 1 ether}();
        // withdraw 0 should succeed (no check against 0)
        vault.withdraw(0);
        assertEq(vault.balance(user1), 1 ether);
        vm.stopPrank();
    }

    function test_TrainWizard_OverwritesTrainingEnd_BUG() public {
        // BUG: A user can train a wizard for 7 days, then immediately
        // call trainWizard(1 day) to reduce their lock time, effectively
        // bypassing the original lock.
        vm.startPrank(user1);
        vault.deposit{value: 1 ether}();
        vault.trainWizard(7); // Lock for 7 days
        uint256 firstEnd = vault.trainingEnd(user1);

        vault.trainWizard(1); // Reduce lock to 1 day!
        uint256 secondEnd = vault.trainingEnd(user1);

        // This proves that the second call OVERWRITES the first, allowing shorter lock
        assertTrue(secondEnd < firstEnd, "Bug: trainingEnd can be reduced by subsequent call");
        vm.stopPrank();
    }

    function test_TrainGiant_OverpaymentGoesToBalance() public {
        // Sending more than 0.2 ETH to trainGiant adds the entire msg.value to balance
        // This means the extra ETH is subject to withdrawal fees
        vm.prank(user1);
        vault.trainGiant{value: 5 ether}();
        assertEq(vault.balance(user1), 5 ether);
    }

    function test_JoinClan_DoesNotRemoveFromOldClan() public {
        // BUG: When switching clans, the old clan keeps the contribution.
        // The contribution balance in the old clan is not reduced.
        vm.startPrank(user1);
        vault.joinClan(1);
        vault.deposit{value: 5 ether}();

        (uint256 clan1Balance,) = vault.clans(1);
        assertEq(clan1Balance, 5 ether);

        vault.joinClan(2);
        vault.deposit{value: 3 ether}();

        // Clan 1 still has 5 ETH (contributions are never removed)
        (clan1Balance,) = vault.clans(1);
        assertEq(clan1Balance, 5 ether);

        // Clan 2 only got the new deposit
        (uint256 clan2Balance,) = vault.clans(2);
        assertEq(clan2Balance, 3 ether);

        vm.stopPrank();
    }

    function test_SetTokenContracts_CanBeCalledMultipleTimes() public {
        // NOTE: setTokenContracts has no check to prevent reconfiguration.
        // The owner can change token addresses at any time.
        ClashGold newGold = new ClashGold();
        ClashElixir newElixir = new ClashElixir();
        ClashAssets newAssets = new ClashAssets();

        vault.setTokenContracts(address(newGold), address(newElixir), address(newAssets));
        assertEq(address(vault.goldToken()), address(newGold));
    }

    function test_Reentrancy_Withdraw() public {
        // Use a vault without tokens configured to avoid ERC1155 receiver check
        VaultOfClans bareVault = new VaultOfClans();
        ReentrancyAttacker attackerContract = new ReentrancyAttacker(address(bareVault));
        vm.deal(address(attackerContract), 10 ether);

        // Attacker deposits and then tries to re-enter on withdraw
        attackerContract.attack();

        // The contract uses CEI pattern (balance -= amount before call)
        // so reentrancy should fail with "Insufficient" on second attempt
        // Verify the attacker could NOT drain extra funds
        assertEq(bareVault.balance(address(attackerContract)), 0);
    }

    // ============================================================
    //                    10. FUZZ TESTS
    // ============================================================

    function testFuzz_Deposit(uint256 amount) public {
        amount = bound(amount, 1, 50 ether);

        vm.prank(user1);
        vault.deposit{value: amount}();

        assertEq(vault.balance(user1), amount);
        assertEq(vault.xp(user1), 100);
    }

    function testFuzz_WithdrawFee(uint256 depositAmt, uint256 withdrawAmt) public {
        depositAmt = bound(depositAmt, 1 ether, 50 ether);
        withdrawAmt = bound(withdrawAmt, 1, depositAmt);

        vm.startPrank(user1);
        vault.deposit{value: depositAmt}();

        uint256 balBefore = user1.balance;
        vault.withdraw(withdrawAmt);

        uint256 expectedFee = (withdrawAmt * 500) / 10_000;
        assertEq(user1.balance, balBefore + withdrawAmt - expectedFee);
        assertEq(vault.accumulatedFees(), expectedFee);

        vm.stopPrank();
    }

    function testFuzz_TrainGiant(uint256 amount) public {
        amount = bound(amount, 0.2 ether, 5 ether);

        vm.prank(user1);
        vault.trainGiant{value: amount}();

        assertEq(vault.troops(user1, 2), 1);
        assertEq(vault.balance(user1), amount);
    }

    // ============================================================
    //                    11. VIEW FUNCTION TESTS
    // ============================================================

    function test_GetWithdrawFeeBps_Default() public view {
        assertEq(vault.getWithdrawFeeBps(user1), 500);
    }

    function test_GetWithdrawFeeBps_Reduced() public {
        vm.startPrank(user1);
        vault.trainGiant{value: 0.2 ether}();
        vault.trainGiant{value: 0.2 ether}();
        vault.trainGiant{value: 0.2 ether}();
        vm.stopPrank();

        assertEq(vault.getWithdrawFeeBps(user1), 50);
    }

    // ============================================================
    //                    12. RECEIVE ETH TEST
    // ============================================================

    function test_CannotSendETHDirectly() public {
        // VaultOfClans has no receive() or fallback(), so direct ETH sends should revert
        vm.prank(user1);
        (bool success,) = address(vault).call{value: 1 ether}("");
        assertFalse(success);
    }

    // Allow this test contract to receive ETH (for withdrawFees)
    receive() external payable {}
}

/// @notice Reentrancy attacker contract for testing withdrawal safety
contract ReentrancyAttacker {
    VaultOfClans public vault;
    uint256 public attackCount;

    constructor(address _vault) {
        vault = VaultOfClans(_vault);
    }

    function attack() external {
        vault.deposit{value: 1 ether}();
        vault.withdraw(1 ether);
    }

    receive() external payable {
        if (attackCount < 3) {
            attackCount++;
            try vault.withdraw(1 ether) {} catch {}
        }
    }
}
