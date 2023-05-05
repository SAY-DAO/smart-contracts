// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "contracts/needModule/NeedStorage.sol";
import "contracts/interfaces/IVerifyVoucher.sol";
import "contracts/governance/GovernanceToken.sol";
import "../interfaces/ITreasury.sol";

contract Need is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant TIME_LOCK_ROLE = keccak256("TIME_LOCK_ROLE");

    address public needStorageAddress;
    NeedStorage public needStorageConstact;
    address public voucherAddress;

    mapping(address => bool) private operatorStatus;

    event Minted(
        uint256 needId,
        address socialWorker,
        uint256 mintValue,
        address minter
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _needStorageAddress,
        address _voucherAddress,
        address _timeLockAddress
    ) public initializer {
        needStorageAddress = _needStorageAddress;
        voucherAddress = _voucherAddress;
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(TIME_LOCK_ROLE, _timeLockAddress);
        needStorageConstact = NeedStorage(needStorageAddress);
    }

    function mint(
        NeedStorage.SocialWorkerVoucher calldata voucher
    ) public payable {
        IVerifyVoucher verifyVoucher = IVerifyVoucher(voucherAddress);
        address signer = verifyVoucher._verify(voucher);

        require(voucher.signer == signer, "Not signed by family!");
        require(
            voucher.mintValue <= msg.value,
            "You must pay the voucher value"
        );

        // Send Eth tokens to Treasury
        address treasuryAddress = NeedStorage(needStorageAddress)
            .treasuryAddress();
        ITreasury(treasuryAddress)._moduleDeposit();

        emit Minted(
            voucher.needId,
            voucher.signer,
            voucher.mintValue,
            msg.sender
        );
    }

    function grantRole(
        bytes32 role,
        address account
    ) public override onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}
}
