// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./BreakfastCoinStaking.sol";

/**
 * @dev Test contract for 'BreakfastCoinStaking'.
 */
contract TestBreakfastCoinStaking is BreakfastCoinStaking {
    function testCanMintModifier(address minter)
        external
        view
        canMint(minter)
        returns (bool)
    {
        return true;
    }
}
