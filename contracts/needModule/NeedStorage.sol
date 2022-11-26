// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract NeedStorage {
    string public needRatio;

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

    /// @dev FamilyMemberSignature: From a Family member signing a transaction using the signature from social worker and need data
    struct Voucher {
        Need need;
        address familyMember;
        address socialWorker;
        bytes FamilyMemberSignature;
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
}
