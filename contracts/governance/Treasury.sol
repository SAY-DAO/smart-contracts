// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is Ownable {
    address private deployer;
    string private needRatio;

    constructor(string memory ratio) {
        needRatio = ratio;
    }

    uint256 private feeAllocation;
    event FeeChanged(uint256 newFee);

    function updateNeedRatio(string memory newRatio) public onlyOwner {
        needRatio = newRatio;
    }

    function fetchNeedRatio() public view returns (string memory) {
        return (needRatio);
    }
}
