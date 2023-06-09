// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface INeedStorage {
    struct FinalVoucher {
        uint256 needId;
        uint256 socialWorkerId; // Need Creator
        bytes signature;
        address signer; // reltive / خویس‌آوند
        uint256 mintValue;
        string swSignature; // social worker signature
        string content;
    }

    function getTresaryAddress() external returns (address);
}
