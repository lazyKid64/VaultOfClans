// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ClashAssets — Semi-fungible troop NFTs for Vault of Clans
/// @notice ERC-1155 tokens representing troops. Token IDs: Barbarian=0, Archer=1, Giant=2, Wizard=3
contract ClashAssets is ERC1155, Ownable {
    address public minter;

    // Token ID constants (matching VaultOfClans.Troop enum)
    uint256 public constant BARBARIAN = 0;
    uint256 public constant ARCHER = 1;
    uint256 public constant GIANT = 2;
    uint256 public constant WIZARD = 3;

    // Token names for metadata
    mapping(uint256 => string) private _tokenNames;

    error OnlyMinter();

    modifier onlyMinter() {
        if (msg.sender != minter) revert OnlyMinter();
        _;
    }

    constructor()
        ERC1155("https://vaultofclans.xyz/api/troops/{id}.json")
        Ownable(msg.sender)
    {
        _tokenNames[BARBARIAN] = "Barbarian";
        _tokenNames[ARCHER] = "Archer";
        _tokenNames[GIANT] = "Giant";
        _tokenNames[WIZARD] = "Wizard";
    }

    /// @notice Set the minter address (VaultOfClans contract)
    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "Invalid minter");
        minter = _minter;
    }

    /// @notice Mint troop NFT (called by VaultOfClans on training)
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external onlyMinter {
        require(id <= WIZARD, "Invalid troop ID");
        _mint(to, id, amount, data);
    }

    /// @notice Batch mint troops
    function mintBatch(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external onlyMinter {
        _mintBatch(to, ids, amounts, data);
    }

    /// @notice Update the base URI for metadata
    function setURI(string calldata newuri) external onlyOwner {
        _setURI(newuri);
    }

    /// @notice Get the name for a given token ID
    function tokenName(uint256 id) external view returns (string memory) {
        return _tokenNames[id];
    }
}
