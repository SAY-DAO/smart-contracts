// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "contracts/governance/VerifyVoucher.sol";

contract GovernanceToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes {
    constructor()
        ERC20("GovernanceToken", "gSAY")
        ERC20Permit("GovernanceToken")
    {}

    modifier verifier(NeedStorage.Need need, NeedStorage.Voucher voucher) {
        // KingVampire kv = KingVampire(kingVampireAddress);
        require(need.needId == 1, "Only the owner can do this.");
        _;
    }

    // The following functions are overrides required by Solidity.

    function safeFamilyMint(
        NeedStorage.Need need,
        address _needContract,
        NeedStorage.Voucher calldata voucher
    ) public payable verifier(need, voucher) {
        VerifyVoucher verifyVoucher = VerifyVoucher(voucherAddress);
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

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(
        address account,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
