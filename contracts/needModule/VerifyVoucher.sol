// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "contracts/utils/ECDSA.sol";
import "contracts/utils/EIP712.sol";
import "../interfaces/INeedStorage.sol";

string constant SIGNING_DOMAIN = "SAY-DAO";
string constant SIGNATURE_VERSION = "1";

contract VerifyVoucher is EIP712 {
    constructor() EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {}

    function _digestHash(
        INeedStorage.FinalVoucher calldata _voucher
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Voucher(uint256 needId,uint256 socialWorkerId,string swSignature,string content)"
                        ),
                        _voucher.needId,
                        _voucher.socialWorkerId,
                        keccak256(bytes(_voucher.swSignature)),
                        keccak256(bytes(_voucher.content))
                    )
                )
            );
    }

    // returns signer address
    function _verify(
        INeedStorage.FinalVoucher calldata _voucher
    ) public view virtual returns (address) {
        bytes32 digest = _digestHash(_voucher);
        return ECDSA.recover(digest, _voucher.signature);
    }

    function getChainID() external view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }
}
