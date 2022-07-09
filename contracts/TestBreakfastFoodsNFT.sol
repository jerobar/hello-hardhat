// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "./BreakfastFoodsNFT.sol";

/**
 * @dev Test contract for 'BreakfastFoodsNFT'.
 */
contract TestBreakfastFoodsNFT is BreakfastFoodsNFT {
    function test_baseURI() external pure returns (string memory) {
        return _baseURI();
    }
}
