//SPDX-License-Identifier: UNLICENSED
// Get symbol and decimals trying both symbol/decimals and _symbol/_decimals
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

library Helpers {
    function getTokenSymbol(
        address tokenAddress
    ) external view returns (string memory) {
        ERC20 token = ERC20(tokenAddress);
        try token.symbol() returns (string memory symbol) {
            return symbol;
        } catch (bytes memory /*lowLevelData*/) {
            revert("Cannot get token symbol");
        }
    }

    function getTokenDecimals(
        address tokenAddress
    ) external view returns (uint8) {
        ERC20 token = ERC20(tokenAddress);
        try token.decimals() returns (uint8 decimals) {
            return decimals;
        } catch (bytes memory /*lowLevelData*/) {
            revert("Cannot get token decimals");
        }
    }
}
