// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "contracts/needModule/NeedStorage.sol";

contract Need is
    NeedStorage,
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant TIME_LOCK_ROLE = keccak256("TIME_LOCK_ROLE");
    mapping(address => bool) private operatorStatus;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory ratio,
        address timeLock
    ) public initializer {
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(TIME_LOCK_ROLE, timeLock);

        needRatio = ratio;
    }

    /// @dev Function updateNeedRatio
    /// @param newRatio timeLock will update whenever necessary
    function updateNeedRatio(
        string memory newRatio
    ) public onlyRole(TIME_LOCK_ROLE) {
        needRatio = newRatio;
    }

    function fetchNeedRatio() public view virtual returns (string memory) {
        return (needRatio);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}
}
