// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface INeedStorage {
    struct SocialWorkerVoucher {
        uint256 needId;
        uint256 socialWorkerId;
        bytes signature;
        address signer;
        uint256 mintValue;
        string content;
    }

    function getTresaryAddress() external returns (address);
}
