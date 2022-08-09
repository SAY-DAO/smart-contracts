// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

struct Voucher {
    uint256 needId;
    uint256 mintValue;
    string tokenUri;
    string content;
    bytes signature;
}

interface IVoucher {
    function _verify(Voucher calldata voucher) external view returns (address);
}
