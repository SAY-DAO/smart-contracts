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
    NeedStorage public needStorage;
    address public voucherAddress;

    mapping(address => bool) private operatorStatus;

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
        needStorage = NeedStorage(needStorageAddress);
    }

    event Minted(
        uint256 needId,
        address auditor,
        address familyMember,
        address socialWorker,
        uint256 mintAmount,
        address friend
    );

    modifier verifier(
        NeedStorage.Need memory need,
        NeedStorage.SocialWorkerVoucher memory voucher
    ) {
        // KingVampire kv = KingVampire(kingVampireAddress);
        require(need.needId == 1, "Only the owner can do this.");
        _;
    }

    function mint(
        NeedStorage.Need memory need,
        NeedStorage.SocialWorkerVoucher calldata voucher
    ) public payable verifier(need, voucher) {
        IVerifyVoucher verifyVoucher = IVerifyVoucher(voucherAddress);
        address socialWorker = verifyVoucher._verify(voucher);

        require(
            voucher.need.socialWorker.wallet == socialWorker,
            "Not signed by family!"
        );
        require(
            voucher.mintAmount <= msg.value,
            "You must pay the voucher value"
        );

        // Send Eth tokens to Treasury
        address treasuryAddress = NeedStorage(needStorageAddress)
            .treasuryAddress();
        ITreasury(treasuryAddress)._moduleDeposit();

        emit Minted(
            voucher.need.needId,
            voucher.need.auditor.wallet,
            voucher.need.obtainer.wallet,
            voucher.need.socialWorker.wallet,
            voucher.mintAmount,
            msg.sender
        );
    }

    /// @dev Function updateNeedRatio
    /// @param newRatio timeLock will update the target ratio whenever necessary
    function updateNeedRatio(uint256 newRatio) public onlyRole(TIME_LOCK_ROLE) {
        needStorage = NeedStorage(needStorageAddress);
        needStorage._updateNeedRatio(newRatio);
    }

    /// @dev Function fetchNeedRatio - for current ratio
    function fetchNeedRatio() public view virtual returns (uint256) {
        return (needStorage.targetNeedRatio());
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
