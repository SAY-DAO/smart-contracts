// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./GovernanceToken.sol";

contract GovernanceTokenV2 is GovernanceToken {
    function version() public pure returns (string memory) {
        return "v2";
    }
}
