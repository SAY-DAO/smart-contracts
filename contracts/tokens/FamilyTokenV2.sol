// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./FamilyToken.sol";

contract FamilyTokenV2 is FamilyToken {
    function onlyForTest() public pure returns (bool) {
        return true;
    }
}
