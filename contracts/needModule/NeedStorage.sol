// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../Helpers.sol";

contract NeedStorage {
    address public treasuryAddress;
    uint256 public targetNeedRatio = 1;
    address public timeLockAddress;
    uint256 public socialWorkerShare;
    uint256 public supervisor;
    uint256 public contributorShare;

    // with needId store participants for that need
    mapping(uint256 => mapping(address => FamilyMember)) participants;

    struct Need {
        uint256 needId;
        uint256 paidInEth;
        NGO ngo;
        Contributor socialWorker;
        Contributor auditor;
        Contributor obtainer;
        Miner minter;
        TheChild child;
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
    enum ContributorType {
        SOCIAL_WORKER,
        OBTAINER,
        AUDITOR
    }

    /// @dev signature: From a Family member signing a transaction using the existing signature from social worker and need data
    struct SocialWorkerVoucher {
        Need need;
        bytes signature;
        uint256 mintAmount;
        string content;
    }

    struct NGO {
        uint256 ngoId;
        string name;
        string url;
    }

    struct ServiceProvider {
        string name;
        string url;
    }

    struct Contributor {
        uint256 id;
        ContributorType role;
        NGO ngo;
        address wallet;
    }

    struct TheChild {
        string SayName;
        string voiceIpfsHash;
        string avatarIpfsHash;
    }

    struct FamilyMember {
        uint256 userId;
        address wallet;
    }

    struct Miner {
        address wallet;
    }

    mapping(address => TheChild) private ChildByToken;

    mapping(uint256 => Need) private needById;
    mapping(uint256 => NeedType) private needTypes;

    constructor(address _timeLockAddress) {
        timeLockAddress = _timeLockAddress;
    }

    modifier onlyOwner() {
        require(msg.sender == timeLockAddress, "Only the owner can do this.");
        _;
    }

    function updateTrasury(address _treasuryAddress) external onlyOwner {
        treasuryAddress = _treasuryAddress;
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
