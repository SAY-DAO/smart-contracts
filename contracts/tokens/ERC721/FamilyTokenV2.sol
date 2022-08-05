// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./FamilyToken.sol";

contract FamilyTokenV2 is FamilyToken {
    function version() public pure returns (string memory) {
        return "v2";
    }
}
