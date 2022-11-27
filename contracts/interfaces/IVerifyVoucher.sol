// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "contracts/needModule/NeedStorage.sol";

interface IVerifyVoucher {
    function _verify(
        NeedStorage.Voucher calldata voucher
    ) external view returns (address);
}
