// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract NeedStorage {
    string public needRatio;

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
}
