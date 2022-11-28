// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract NeedStorage {
    uint256 public targetNeedRatio;
    address public timeLockAddress;
    uint256 public socialWorkerShare;
    uint256 public supervisor;
    uint256 public contributorShare;

    struct Need {
        uint256 needId;
        uint256 paid;
        NGO ngo;
        SocialWorker socialWorker;
        TheChild child;
        FamilyMember[] payers;
        ServiceProvider serviceProvider;
        string[] IpfsReceipts;
        NeedDetails details;
    }

    struct NeedDetails {
        NeedType needType;
        NeedDifficulty difficulty;
        uint256 socialWorkerShare;
        uint256 supervisor;
        uint256 contributorShare;
    }

    enum NeedType {
        SERVICE,
        PRODUCT
    }

    enum NeedDifficulty {
        COMMON,
        PERSONAL,
        UNIQUE
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

    mapping(address => TheChild) private ChildByToken;

    mapping(uint256 => Need) private needById;
    mapping(uint256 => NeedType) private needTypes;

    modifier onlyOwner() {
        require(msg.sender == timeLockAddress, "Only the owner can do this.");
        _;
    }

    /// @dev Function updateNeedRatio called from Need contract
    /// @param newRatio timeLock will update whenever necessary
    function _updateNeedRatio(uint256 newRatio) external onlyOwner {
        targetNeedRatio = newRatio;
    }

    /// @dev Function updateNeedRatio called from Need contract
    /// @param swShare social worker share of work
    /// @param svShare supervisor share of work
    /// @param cShare contributor share fo work
    function _updateNeedContribution(
        uint256 swShare,
        uint256 svShare,
        uint256 cShare
    ) external onlyOwner {
        socialWorkerShare = swShare;
        supervisor = svShare;
        contributorShare = cShare;

        // emit ()
    }
}
