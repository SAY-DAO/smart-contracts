// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "contracts/utils/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "contracts/needModule/NeedStorage.sol";

string constant SIGNING_DOMAIN = "SAY-DAO";
string constant SIGNATURE_VERSION = "1";

contract VerifyVoucher is
    OwnableUpgradeable,
    EIP712Upgradeable,
    UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __EIP712_init(SIGNING_DOMAIN, SIGNATURE_VERSION);
    }

    event FallingBack(string msg);

    function _hash(
        NeedStorage.Voucher calldata _voucher
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Voucher(uint256 needId,uint256 mintAmount,string tokenUri,string content)"
                        ),
                        _voucher.need.needId,
                        _voucher.mintAmount,
                        keccak256(bytes(_voucher.tokenUri)),
                        keccak256(bytes(_voucher.content))
                    )
                )
            );
    }

    // returns signer address
    function _verify(
        NeedStorage.Voucher calldata _voucher
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

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    fallback() external {
        emit FallingBack("Store Fall Back");
    }
}
