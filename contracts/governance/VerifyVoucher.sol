// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "contracts/utils/ECDSA.sol";
import "contracts/utils/EIP712.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "contracts/needModule/NeedStorage.sol";

string constant SIGNING_DOMAIN = "SAY-DAO";
string constant SIGNATURE_VERSION = "1";

contract VerifyVoucher is EIP712 {
    constructor() EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {}

    function _hash(
        NeedStorage.SocialWorkerVoucher calldata _voucher
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Voucher(uint256 needId,uint256 mintAmount,string tokenUri,string content)"
                        ),
                        _voucher.need.needId,
                        _voucher.need.socialWorker.wallet,
                        _voucher.need.auditor.wallet,
                        _voucher.mintAmount,
                        keccak256(bytes(_voucher.content))
                    )
                )
            );
    }

    // returns signer address
    function _verify(
        NeedStorage.SocialWorkerVoucher calldata _voucher
    ) public view virtual returns (address) {
        bytes32 digest = _hash(_voucher);
        return ECDSA.recover(digest, _voucher.signature);
    }

    function getChainID() external view returns (uint256) {
        uint256 id;
        // https://docs.soliditylang.org/en/v0.8.7/yul.html?highlight=chainid#evm-dialect
        assembly {
            id := chainid()
        }
        return id;
    }
}
