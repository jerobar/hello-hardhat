const { ethers } = require('hardhat')
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')

describe('BreakfastFoodsNFT', function () {
  // Deploy 'BreakfastFoodsNFT' contract
  async function deployBreakfastFoodsNFT() {
    const [deployer] = await ethers.getSigners()
    const ContractFactory = await ethers.getContractFactory('BreakfastFoodsNFT')
    const breakfastFoodsNftContract = await ContractFactory.deploy()

    return { breakfastFoodsNftContract, deployer }
  }

  // Deploy 'TestBreakfastFoodsNFT' contract
  async function deployTestBreakfastFoodsNFT() {
    const [deployer] = await ethers.getSigners()
    const ContractFactory = await ethers.getContractFactory(
      'TestBreakfastFoodsNFT'
    )
    const testBreakfastFoodsNftContract = await ContractFactory.deploy()

    return { testBreakfastFoodsNftContract, deployer }
  }

  /**
   * Deployment
   *
   * - Should set proper name
   * - Should set proper symbol
   * - Should set proper token supply
   * - Should set proper max token supply
   */
  describe('Deployment', function () {
    it('Should set proper name', async function () {
      const { breakfastFoodsNftContract } = await loadFixture(
        deployBreakfastFoodsNFT
      )

      expect(await breakfastFoodsNftContract.name()).to.equal('BreakfastFoods')
    })

    it('Should set proper symbol', async function () {
      const { breakfastFoodsNftContract } = await loadFixture(
        deployBreakfastFoodsNFT
      )

      expect(await breakfastFoodsNftContract.symbol()).to.equal('BRKFST')
    })

    it('Should set proper token supply', async function () {
      const { breakfastFoodsNftContract } = await loadFixture(
        deployBreakfastFoodsNFT
      )

      expect(await breakfastFoodsNftContract.tokenSupply()).to.equal(0)
    })

    it('Should set proper max token supply', async function () {
      const { breakfastFoodsNftContract } = await loadFixture(
        deployBreakfastFoodsNFT
      )

      expect(await breakfastFoodsNftContract.MAX_TOKEN_SUPPLY()).to.equal(10)
    })
  })

  /**
   * NFT
   *
   * - Should return proper base URI
   */
  describe('NFT', function () {
    it('Should return proper base URI', async function () {
      const { testBreakfastFoodsNftContract } = await loadFixture(
        deployTestBreakfastFoodsNFT
      )

      expect(await testBreakfastFoodsNftContract.test_baseURI()).to.equal(
        'ipfs://QmaPrXV1mGXxNKyyuSjBKDAwwfmjYbkDn5wvDWMaKSWg9M/'
      )
    })
  })
})
