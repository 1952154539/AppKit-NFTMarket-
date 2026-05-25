// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BaseERC20.sol";
import "../src/SimpleNFT.sol";
import "../src/NFTMarket.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        BaseERC20 token = new BaseERC20("MyToken", "MTK", 1_000_000 * 10**18);
        console.log("BaseERC20 deployed at:", address(token));

        SimpleNFT nft = new SimpleNFT();
        console.log("SimpleNFT deployed at:", address(nft));

        NFTMarket market = new NFTMarket(address(token));
        console.log("NFTMarket deployed at:", address(market));

        // Mint some NFTs for testing
        nft.mint(msg.sender, "ipfs://QmTest1");
        nft.mint(msg.sender, "ipfs://QmTest2");
        nft.mint(msg.sender, "ipfs://QmTest3");
        console.log("Minted 3 test NFTs to deployer");

        vm.stopBroadcast();
    }
}
