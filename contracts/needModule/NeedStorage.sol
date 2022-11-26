// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract NeedStorage {
    uint256 public targetNeedRatio;
    address public timeLockAddress;

    struct Need {
        uint256 needId;
        uint256 paid;
        NGO ngo;
        SocialWorker socialWorker;
        TheChild child;
        FamilyMember[] contributors;
        ServiceProvider serviceProvider;
        Status status;
        string[] receipts;
    }

    /// @dev signature: From a Family member signing a transaction using the existing signature from social worker and need data
    struct Voucher {
        Need need;
        address familyMember;
        address socialWorker;
        bytes signature;
        uint256 mintAmount;
        string tokenUri;
        string content;
    }

    struct NGO {
        uint256 ngoId;
        string name;
        string contact;
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

    struct TheChild {
        uint256 childId;
        string SayName;
        uint8 age;
        string country;
        string city;
        string voiceIpfsHash;
        string avatarIpfsHash;
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

    mapping(address => TheChild) private ChildByToken;

    mapping(uint256 => Need) private needById;

    modifier onlyOwner() {
        require(msg.sender == timeLockAddress, "Only the owner can do this.");
        _;
    }

    /// @dev Function updateNeedRatio called from Need contract
    /// @param newRatio timeLock will update whenever necessary
    function _updateNeedRatio(uint256 newRatio) external onlyOwner {
        targetNeedRatio = newRatio;
    }
}
