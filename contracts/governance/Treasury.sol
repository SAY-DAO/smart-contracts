// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Treasury is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant TIME_LOCK_ROLE = keccak256("TIME_LOCK_ROLE");
    address private deployer;
    string private needRatio;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address timeLock, string memory ratio)
        public
        initializer
    {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        _grantRole(TIME_LOCK_ROLE, timeLock);
        // _grantRole(DEFAULT_ADMIN_ROLE, timeLock);
        needRatio = ratio;
    }

    uint256 private feeAllocation;
    event FeeChanged(uint256 newFee);

    function updateNeedRatio(string memory newRatio)
        public
        onlyRole(TIME_LOCK_ROLE)
    {
        needRatio = newRatio;
    }

    function fetchNeedRatio() public view virtual returns (string memory) {
        return (needRatio);
    }

    function grantRole(bytes32 role, address account)
        public
        override
        onlyRole(getRoleAdmin(role))
    {
        _grantRole(role, account);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(TIME_LOCK_ROLE)
    {}
}
