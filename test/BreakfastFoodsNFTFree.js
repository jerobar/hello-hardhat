const { ethers } = require('hardhat')
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')

describe('BreakfastFoodsNFTFree', function () {
  // Deploy 'BreakfastFoodsNFTFree' contract
  async function deployBreakfastFoodsNFTFree() {
    const [deployer] = await ethers.getSigners()
    const ContractFactory = await ethers.getContractFactory(
      'BreakfastFoodsNFTFree'
    )
    const breakfastFoodsNftFreeContract = await ContractFactory.deploy()

    return { breakfastFoodsNftFreeContract, deployer }
  }

  /**
   * Minting
   *
   * - Should require mint result be less than max token supply
   * - Should allow token minting
   */
  describe('Minting', function () {
    it('Should require mint result be less than max token supply', async function () {
      const { breakfastFoodsNftFreeContract } = await loadFixture(
        deployBreakfastFoodsNFTFree
      )

      // Mint 10 tokens (max token supply)
      for (let i = 1; i <= 10; i++) {
        const mintTokenTx = await breakfastFoodsNftFreeContract.mint()
        mintTokenTx.wait()
      }

      // Test minting token #11
      await expect(breakfastFoodsNftFreeContract.mint()).to.be.revertedWith(
        'BreakfastFoodsNFTFree: Token supply cap met'
      )
    })

    it('Should allow token minting', async function () {
      const { breakfastFoodsNftFreeContract } = await loadFixture(
        deployBreakfastFoodsNFTFree
      )

      // Mint 1 token
      const mintTokenTx = await breakfastFoodsNftFreeContract.mint()
      mintTokenTx.wait()

      // Test token supply is now 1
      expect(await breakfastFoodsNftFreeContract.tokenSupply()).to.equal(1)
    })
  })
})
