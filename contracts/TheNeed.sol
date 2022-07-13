// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract TheNeed is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    struct NGO {
        uint256 ngoId;
        string name;
        string emailAddress;
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
        bool isVerified; // by operator
    }

    mapping(uint256 => Need) private needById;
    mapping(address => bool) private operatorStatus;

    function initialize() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    modifier onlyOperator(address _address) {
        bool isOperator = operatorStatus[_address];
        require(isOperator, "Only operator is allowed");
        _;
    }

    function setOperator(address _address, bool _isOperator) public onlyOwner {
        operatorStatus[_address] = _isOperator;
    }

    function storeVerifiedNeed(address _address, uint256 needId)
        public
        onlyOperator(_address)
    {
        Need memory need = needById[needId];
        require(
            need.status == Status.DELIVERED,
            "Not received by the child yet"
        );
        needById[needId].isVerified = true;
    }

    function isNeedVerified(uint256 _needId) external view returns (bool) {
        Need memory need = needById[_needId];
        return need.isVerified;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
