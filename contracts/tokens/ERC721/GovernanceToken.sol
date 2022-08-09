// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/draft-ERC721VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "../../interfaces/ITheNeed.sol";

contract GovernanceToken is
    Initializable,
    ERC721Upgradeable,
    AccessControlUpgradeable,
    EIP712Upgradeable,
    ERC721VotesUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant SAY_ADMIN_ROLE = keccak256("SAY_ADMIN_ROLE");

    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIdCounter;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address sayAdmin, address voucherContract)
        public
        initializer
    {
        __ERC721_init("GovernanceToken", "gSAY");
        __EIP712_init("SAY-DAO", "1");
        __ERC721Votes_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(SAY_ADMIN_ROLE, sayAdmin);
        voucherAddress = voucherContract;
    }

    event Minted(
        uint256 needId,
        uint256 tokenId,
        uint256 tokenId2,
        address familyMember,
        address friend
    );

    address public voucherAddress;

    mapping(address => uint256) private needById;

    // Collabration between a virtual family memebr and a friend
    modifier verifier(uint256 _needId, address _needContract) {
        ITheNeed n = ITheNeed(_needContract);
        bool isMintable = n.isNeedMintable(_needId);
        if (isMintable) {
            _;
        } else {
            revert("This Need is not minatable!");
        }
    }

    // to resolve the signature and retrieve family address
    function setVoucherVerifier(address newAddress)
        public
        onlyRole(SAY_ADMIN_ROLE)
    {
        voucherAddress = newAddress;
    }

    function safeFamilyMint(
        uint256 _needId,
        address _needContract,
        Voucher calldata _voucher
    ) public payable verifier(_needId, _needContract) {
        InterfaceVoucher voucherInterface = InterfaceVoucher(voucherAddress);
        address familyMember = voucherInterface._verify(_voucher);

        require(
            _voucher.mintValue <= msg.value,
            "You must pay the voucher value"
        );
        // 1 gSay for the family member
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(familyMember, tokenId);

        // 1 gSay for the minter the friend
        _tokenIdCounter.increment();
        uint256 tokenId2 = _tokenIdCounter.current();
        _safeMint(msg.sender, tokenId2);
        // TODO: transfer the value to the treasury?

        emit Minted(
            _voucher.needId,
            tokenId,
            tokenId2,
            familyMember,
            msg.sender
        );
    }

    function safeSocialWorkerMint() public payable {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
    }

    function _burn(uint256 tokenId) internal override(ERC721Upgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721VotesUpgradeable) {
        super._afterTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
