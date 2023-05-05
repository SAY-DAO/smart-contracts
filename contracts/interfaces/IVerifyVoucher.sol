// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./INeedStorage.sol";

interface IVerifyVoucher {
    function _verify(
        INeedStorage.SocialWorkerVoucher calldata _voucher
    ) external returns (address);
}
