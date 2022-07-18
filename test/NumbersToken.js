const { ethers } = require('hardhat')
const {
  loadFixture,
  time
} = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')

describe('NumbersToken', function () {
  // Deploy 'NumbersToken' contract
  async function deployNumbersToken() {
    const [deployer] = await ethers.getSigners()
    const ContractFactory = await ethers.getContractFactory('NumbersToken')
    const numbersToken = await ContractFactory.deploy()

    return { numbersToken, deployer }
  }

  /**
   * Deployment
   *
   * -
   */
  describe('Deployment', function () {})

  /**
   * Token
   *
   * - Should return the correct URI for a given token id
   */
  describe('Token', function () {
    it('Should return the correct URI for a given token id', async function () {
      const { numbersToken } = await loadFixture(deployNumbersToken)

      // Test token 0 returns correct URI
      expect(await numbersToken.uri(0)).to.equal(
        'ipfs://QmatCE4zpiVEHnjQar8c4DUx8quXzDj2YtcycXUawuH6qz/0.json'
      )
    })
  })

  /**
   * Minting
   *
   * - Should allow token minting
   * - Should properly revert attempts to mint invalid ids
   * - Should properly revert attempts to mint multiple tokens
   * - Should properly revert attempts to mint tokens within cooldown period
   */
  describe('Minting', function () {
    it('Should allow token minting', async function () {
      const { numbersToken, deployer } = await loadFixture(deployNumbersToken)

      // Mint additional 0 token to deployer
      const mintTx = await numbersToken.mint(deployer.address, 0, 1)
      mintTx.wait()

      // Test that deployer now has two 0 tokens
      expect(await numbersToken.balanceOf(deployer.address, 0)).to.equal(2)
    })

    it('Should properly revert attempts to mint invalid ids', async function () {
      const { numbersToken, deployer } = await loadFixture(deployNumbersToken)

      // Test attempt to mint invalid id properly reverted
      await expect(
        numbersToken.mint(deployer.address, 3, 1)
      ).to.be.revertedWith('NumbersToken: Token cannot be minted')
    })

    it('Should properly revert attempts to mint multiple tokens', async function () {
      const { numbersToken, deployer } = await loadFixture(deployNumbersToken)

      // Test attempt to mint invalid id properly reverted
      await expect(
        numbersToken.mint(deployer.address, 0, 2)
      ).to.be.revertedWith(
        'NumbersToken: Cannot mint more than one token at a time'
      )
    })

    it('Should properly revert attempts to mint tokens within cooldown period', async function () {
      const { numbersToken, deployer } = await loadFixture(deployNumbersToken)

      // Mint additional 0 token to deployer
      const mintTx = await numbersToken.mint(deployer.address, 0, 1)
      mintTx.wait()

      // Test attempt to mint token within cooldown period properly reverted
      await expect(
        numbersToken.mint(deployer.address, 0, 1)
      ).to.be.revertedWith('NumbersToken: Token in cooldown period')
    })
  })

  /**
   * Forging
   *
   * - Should correctly forge token 3
   * - Should correctly forge token 4
   * - Should correctly forge token 5
   * - Should correctly forge token 6
   */
  describe('Forging', function () {
    it('Should correctly forge token 3', async function () {
      const { numbersToken, deployer } = await loadFixture(deployNumbersToken)

      // Forge tokens 0 and 1
      const forgeTx = await numbersToken.burnBatch(
        deployer.address,
        [0, 1],
        [1, 1]
      )
      forgeTx.wait()

      // Test that deployer now has 2 token id 3's
      expect(await numbersToken.balanceOf(deployer.address, 3)).to.equal(2)
    })

    it('Should correctly forge token 4', async function () {
      const { numbersToken, deployer } = await loadFixture(deployNumbersToken)

      // Forge tokens 0 and 1
      const forgeTx = await numbersToken.burnBatch(
        deployer.address,
        [1, 2],
        [1, 1]
      )
      forgeTx.wait()

      // Test that deployer now has 2 token id 3's
      expect(await numbersToken.balanceOf(deployer.address, 4)).to.equal(2)
    })

    it('Should correctly forge token 5', async function () {
      const { numbersToken, deployer } = await loadFixture(deployNumbersToken)

      // Forge tokens 0 and 1
      const forgeTx = await numbersToken.burnBatch(
        deployer.address,
        [0, 2],
        [1, 1]
      )
      forgeTx.wait()

      // Test that deployer now has 2 token id 3's
      expect(await numbersToken.balanceOf(deployer.address, 5)).to.equal(2)
    })

    it('Should correctly forge token 6', async function () {
      const { numbersToken, deployer } = await loadFixture(deployNumbersToken)

      // Forge tokens 0 and 1
      const forgeTx = await numbersToken.burnBatch(
        deployer.address,
        [0, 1, 2],
        [1, 1, 1]
      )
      forgeTx.wait()

      // Test that deployer now has 2 token id 3's
      expect(await numbersToken.balanceOf(deployer.address, 6)).to.equal(2)
    })
  })

  /**
   * Trading
   *
   * - Should successfully handle a token trade
   * - Should properly revert on trade request for token 0
   * - Should properly revert on trade request for token 1
   * - Should properly revert on trade request for token 2
   */
  describe('Trading', function () {
    it('Should successfully handle a token trade', async function () {
      const { numbersToken, deployer } = await loadFixture(deployNumbersToken)

      const tradeTx = await numbersToken.trade(0, 1)
      tradeTx.wait()

      // Test that deployer now has 2 token id 1's
      expect(await numbersToken.balanceOf(deployer.address, 1)).to.equal(2)
    })

    it('Should properly revert on trade request for token 0', async function () {
      const { numbersToken } = await loadFixture(deployNumbersToken)

      // Test that invalid trade request is inverted
      await expect(numbersToken.trade(0, 0)).to.not.be.revertedWith(
        'NumbersToken: Cannot trade for that token'
      )
    })

    it('Should properly revert on trade request for token 1', async function () {
      const { numbersToken } = await loadFixture(deployNumbersToken)

      // Test that invalid trade request is inverted
      await expect(numbersToken.trade(0, 1)).to.not.be.revertedWith(
        'NumbersToken: Cannot trade for that token'
      )
    })

    it('Should properly revert on trade request for token 2', async function () {
      const { numbersToken } = await loadFixture(deployNumbersToken)

      // Test that invalid trade request is inverted
      await expect(numbersToken.trade(0, 2)).to.not.be.revertedWith(
        'NumbersToken: Cannot trade for that token'
      )
    })
  })

  /**
   * Burning
   *
   * - Should handle token burning
   */
  describe('Burning', function () {
    it('Should handle token burning', async function () {
      const { numbersToken, deployer } = await loadFixture(deployNumbersToken)

      // Burn deployer's token 0
      const burnTx = await numbersToken.burn(deployer.address, 0, 1)
      burnTx.wait()

      // Test that deployer now has 0 token 0's
      expect(await numbersToken.balanceOf(deployer.address, 0)).to.equal(0)
    })
  })
})
