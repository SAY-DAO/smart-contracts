// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "contracts/needModule/NeedStorage.sol";

contract Need is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant TIME_LOCK_ROLE = keccak256("TIME_LOCK_ROLE");
    mapping(address => bool) private operatorStatus;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _needStorageAddress,
        address timeLock
    ) public initializer {
        needStorageAddress = _needStorageAddress;
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(TIME_LOCK_ROLE, timeLock);
        needStorage = NeedStorage(needStorageAddress);
    }

    address public needStorageAddress;
    NeedStorage public needStorage;

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

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}
}
