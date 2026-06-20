// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VaultOfClans} from "../src/VaultOfClans.sol";
import {ClashGold} from "../src/ClashGold.sol";
import {ClashElixir} from "../src/ClashElixir.sol";
import {ClashAssets} from "../src/ClashAssets.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy tokens
        ClashGold gold = new ClashGold();
        ClashElixir elixir = new ClashElixir();
        ClashAssets assets = new ClashAssets();

        // 2. Deploy main contract
        VaultOfClans vault = new VaultOfClans();

        // 3. Set minters → Vault is the only one who can mint
        gold.setMinter(address(vault));
        elixir.setMinter(address(vault));
        assets.setMinter(address(vault));

        // 4. Configure tokens in Vault
        vault.setTokenContracts(address(gold), address(elixir), address(assets));

        console.log("VaultOfClans:", address(vault));
        console.log("ClashGold:   ", address(gold));
        console.log("ClashElixir: ", address(elixir));
        console.log("ClashAssets: ", address(assets));

        vm.stopBroadcast();
    }
}
