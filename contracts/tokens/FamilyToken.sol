// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/draft-ERC721VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "hardhat/console.sol";

struct Voucher {
    uint256 needId;
    uint256 mintValue;
    string tokenUri;
    string content;
    bytes signature;
}

interface InterfaceTheNeed {
    function isNeedVerified(uint256 _needId) external returns (bool);
}

interface InterfaceVoucher {
    function _verify(Voucher calldata voucher) external view returns (address);
}

contract FamilyToken is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    EIP712Upgradeable,
    ERC721VotesUpgradeable,
    ERC721URIStorageUpgradeable,
    UUPSUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIdCounter;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    address private voucherAddress;
    event Minted(
        uint256 needId,
        uint256 tokenId,
        uint256 tokenId2,
        address familyMember,
        address friend
    );

    function initialize() public initializer {
        __ERC721_init("FamilyToken", "gSAY");
        __Ownable_init();
        __EIP712_init("SAY-DAO", "1");
        __ERC721Votes_init();
        __UUPSUpgradeable_init();
    }

    // Collabration between a virtual family memebr and a friend
    modifier verifier(uint256 _needId, address _needContract) {
        // InterfaceTheNeed n = InterfaceTheNeed(_needContract);
        // bool isVerified = n.isNeedVerified(_needId);
        // if (isVerified) {
        _;
        // }
    }

    function setVoucherVerifier(address newAddress) public onlyOwner {
        voucherAddress = newAddress;
    }

    function safeMint(
        uint256 _needId,
        address _needContract,
        Voucher calldata _voucher
    ) public payable verifier(_needId, _needContract) {
        InterfaceVoucher voucherInterface = InterfaceVoucher(voucherAddress);
        console.log(voucherAddress);
        address familyMember = voucherInterface._verify(_voucher);

        require(
            _voucher.mintValue <= msg.value,
            "You must pay the voucher value"
        );

        // 1 gSay for family member
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(familyMember, tokenId);
        _setTokenURI(tokenId, _voucher.tokenUri);

        // 1 gSay for the minter the friend
        _tokenIdCounter.increment();
        uint256 tokenId2 = _tokenIdCounter.current();
        _safeMint(msg.sender, tokenId2);
        _setTokenURI(tokenId, _voucher.tokenUri);

        emit Minted(
            _voucher.needId,
            tokenId,
            tokenId2,
            familyMember,
            msg.sender
        );

        // TODO: transfer the value to the treasury?
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721VotesUpgradeable) {
        super._afterTokenTransfer(from, to, tokenId);
    }
}
