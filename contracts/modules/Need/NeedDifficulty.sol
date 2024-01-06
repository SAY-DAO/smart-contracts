// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract NeedDifficulty {
    address public owner;

    enum NeedTypeEnum {
        SERVICE,
        PRODUCT
    }

    enum NeedKindEnum {
        COMMON,
        PERSONAL,
        UNIQUE
    }

    struct Difficulty {
        uint8 creation;
        uint8 audit;
        uint8 logistic;
        uint8 communityPrority;
    }

    mapping(NeedTypeEnum => mapping(NeedKindEnum => Difficulty))
        public difficulties;

    modifier onlyOwner() {
        require(msg.sender == address(owner), "only need difficulty owner!");
        _;
    }

    constructor(
        Difficulty memory _difficultyCP,
        Difficulty memory _difficultyPP,
        Difficulty memory _difficultyUP,
        Difficulty memory _difficultyCS,
        Difficulty memory _difficultyPS,
        Difficulty memory _difficultyUS
    ) {
        owner = msg.sender;
        updateNeedDifficulty(
            _difficultyCP,
            NeedKindEnum.COMMON,
            NeedTypeEnum.PRODUCT
        );
        updateNeedDifficulty(
            _difficultyPP,
            NeedKindEnum.PERSONAL,
            NeedTypeEnum.PRODUCT
        );
        updateNeedDifficulty(
            _difficultyUP,
            NeedKindEnum.UNIQUE,
            NeedTypeEnum.PRODUCT
        );
        updateNeedDifficulty(
            _difficultyCS,
            NeedKindEnum.COMMON,
            NeedTypeEnum.SERVICE
        );
        updateNeedDifficulty(
            _difficultyPS,
            NeedKindEnum.PERSONAL,
            NeedTypeEnum.SERVICE
        );
        updateNeedDifficulty(
            _difficultyUS,
            NeedKindEnum.UNIQUE,
            NeedTypeEnum.SERVICE
        );
    }

    function updateNeedDifficulty(
        Difficulty memory _difficulty,
        NeedKindEnum _kind,
        NeedTypeEnum _type
    ) public onlyOwner returns (Difficulty memory) {
        Difficulty memory difficulty = difficulties[_type][_kind];
        if (difficulty.creation <= 0) {
            difficulty = Difficulty({
                creation: _difficulty.creation,
                audit: _difficulty.audit,
                logistic: _difficulty.logistic,
                communityPrority: _difficulty.communityPrority
            });
            difficulties[_type][_kind] = difficulty;
        } else {
            difficulty = difficulties[_type][_kind];
            difficulty.creation = _difficulty.creation;
            difficulty.audit = _difficulty.audit;
            difficulty.logistic = _difficulty.logistic;
            difficulty.communityPrority = _difficulty.communityPrority;
            difficulties[_type][_kind] = difficulty;
        }
        return difficulties[_type][_kind];
    }

    function getNeedDifficulty(
        NeedKindEnum _kind,
        NeedTypeEnum _type
    ) public view returns (Difficulty memory) {
        return difficulties[_type][_kind];
    }

    function transferOwnerShip(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}
