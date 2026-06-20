// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ClashGold — In-game gold currency for Vault of Clans
/// @notice ERC-20 token minted by the VaultOfClans contract on deposits
contract ClashGold is ERC20, Ownable {
    address public minter;

    error OnlyMinter();

    modifier onlyMinter() {
        if (msg.sender != minter) revert OnlyMinter();
        _;
    }

    constructor() ERC20("Clash Gold", "GOLD") Ownable(msg.sender) {}

    /// @notice Set the minter address (VaultOfClans contract)
    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "Invalid minter");
        minter = _minter;
    }

    /// @notice Mint gold tokens (called by VaultOfClans on deposit)
    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }

    /// @notice Burn gold tokens (for future upgrade spending)
    function burn(address from, uint256 amount) external onlyMinter {
        _burn(from, amount);
    }
}
