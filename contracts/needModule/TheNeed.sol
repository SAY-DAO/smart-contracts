// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract TheNeed is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant TIME_LOCK_ROLE = keccak256("TIME_LOCK_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory ratio, address timeLock)
        public
        initializer
    {
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(TIME_LOCK_ROLE, timeLock);

        needRatio = ratio;
    }

    string private needRatio;

    struct NGO {
        uint256 ngoId;
        string name;
        string emailAddress;
    }

    struct ServiceProvider {
        string name;
        string website;
    }

    struct SocialWorker {
        uint256 swId;
        NGO ngo;
        address wallet;
    }

    struct Child {
        uint256 childId;
        string childSayName;
        string voiceUrl;
        string avatarUrl;
        string country;
    }

    struct FamilyMember {
        uint256 userId;
        address wallet;
    }

    enum Status {
        REGISTERED,
        DONE,
        DELIVERED,
        AUDITED
    }

    struct Need {
        uint256 _needId;
        NGO ngo;
        SocialWorker socialWorker;
        Child child;
        FamilyMember[] contributors;
        uint256 paid;
        string receiptUrl;
        Status status;
        ServiceProvider serviceProvider;
        bool isMintable; // by operator
    }

    mapping(uint256 => Need) private needById;
    mapping(address => bool) private operatorStatus;

    function setOperator(address _address, bool _isOperator)
        public
        onlyRole(UPGRADER_ROLE)
    {
        operatorStatus[_address] = _isOperator;
    }

    function prepareToMint(address _address, uint256 needId)
        public
        onlyRole(UPGRADER_ROLE)
    {
        Need memory need = needById[needId];
        require(
            need.status == Status.DELIVERED,
            "Not received by the child yet"
        );
        needById[needId].isMintable = true;
    }

    function isNeedMintable(uint256 _needId) external view returns (bool) {
        Need memory need = needById[_needId];
        // return need.isMintable;
        return true;
    }

    function updateNeedRatio(string memory newRatio)
        public
        onlyRole(TIME_LOCK_ROLE)
    {
        needRatio = newRatio;
    }

    function fetchNeedRatio() public view virtual returns (string memory) {
        return (needRatio);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}
}
