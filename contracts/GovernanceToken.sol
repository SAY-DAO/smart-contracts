// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    uint256 public maxSupply = 1000000000000000000;

    // ERC20Permit: Initializes the EIP712 domain separator using the name parameter, and setting version to "1".
    constructor()
        ERC20("GovernanceToken", "gSAY")
        ERC20Permit("GovernanceToken")
    {
        _mint(msg.sender, maxSupply);
    }

    // The following functions are overrides required by Solidity. (OpenZeppelin)
    // To update snapshots - how many people and token each block?
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20Votes)
    {
        super._burn(account, amount);
    }
}
