const { ethers } = require('hardhat')
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')

describe('BreakfastCoinStaking', function () {
  // Deploy 'BreakfastCoinStaking' contract
  async function deployBreakfastCoinStaking() {
    const [deployer] = await ethers.getSigners()
    const ContractFactory = await ethers.getContractFactory(
      'BreakfastCoinStaking'
    )
    const breakfastCoinStakingContract = await ContractFactory.deploy()

    return { breakfastCoinStakingContract, deployer }
  }

  // Deploy 'TestBreakfastCoinStaking' contract
  async function deployTestBreakfastCoinStaking() {
    const [deployer] = await ethers.getSigners()
    const ContractFactory = await ethers.getContractFactory(
      'TestBreakfastCoinStaking'
    )
    const testBreakfastCoinStakingContract = await ContractFactory.deploy()

    return { testBreakfastCoinStakingContract, deployer }
  }

  /**
   * Deployment
   *
   * - Should set proper name
   * - Should set proper symbol
   * - Should add deployer to add minting addresses
   */
  describe('Deployment', function () {
    it('Should set proper name', async function () {
      const { breakfastCoinStakingContract } = await loadFixture(
        deployBreakfastCoinStaking
      )

      expect(await breakfastCoinStakingContract.name()).to.equal(
        'BreakfastCoin'
      )
    })

    it('Should set proper symbol', async function () {
      const { breakfastCoinStakingContract } = await loadFixture(
        deployBreakfastCoinStaking
      )

      expect(await breakfastCoinStakingContract.symbol()).to.equal('BRKFST')
    })

    it('Should add deployer to add minting addresses', async function () {
      const { testBreakfastCoinStakingContract, deployer } = await loadFixture(
        deployTestBreakfastCoinStaking
      )

      // Test 'BreakfastCoinStaking' `canMint` modifier via helper contract
      await expect(
        testBreakfastCoinStakingContract.testCanMintModifier(deployer.address)
      ).not.to.be.reverted
    })
  })

  /**
   * Minting
   * - Should add minting address
   * - Should mint to address
   * - Should properly revert non-minting address mint attempt
   */
  describe('Minting', function () {
    it('Should add minting address', async function () {
      const { testBreakfastCoinStakingContract } = await loadFixture(
        deployTestBreakfastCoinStaking
      )
      const [, minter] = await ethers.getSigners()
      const minterAddress = minter.address

      // Add minting address `minterAddress`
      const addMintingAddressTx =
        await testBreakfastCoinStakingContract.addMintingAddress(minterAddress)
      await addMintingAddressTx.wait()

      // Test 'minterAddress' can mint via helper contract
      await expect(
        testBreakfastCoinStakingContract.testCanMintModifier(minterAddress)
      ).not.to.be.reverted
    })

    it('Should mint to address', async function () {
      const { breakfastCoinStakingContract } = await loadFixture(
        deployBreakfastCoinStaking
      )
      const [, mintTo] = await ethers.getSigners()
      const mintToAddress = mintTo.address

      // Mint 1 token to `mintToAddress`
      const mintToAddressTx = await breakfastCoinStakingContract.mintToAddress(
        1,
        mintToAddress
      )
      mintToAddressTx.wait()

      // Test `mintToAddress` now has a balance of 1 token
      expect(
        await breakfastCoinStakingContract.balanceOf(mintToAddress)
      ).to.equal(1)
    })

    it('Should properly revert non-minting address mint attempt', async function () {
      const { breakfastCoinStakingContract } = await loadFixture(
        deployBreakfastCoinStaking
      )
      const [, nonMinting, mintTo] = await ethers.getSigners()
      const mintToAddress = mintTo.address

      // Test non-minting address is blocked from minting
      await expect(
        breakfastCoinStakingContract
          .connect(nonMinting)
          .mintToAddress(1, mintToAddress)
      ).to.be.revertedWith(
        'BreakfastCoinStaking: Feature only available to minting addresses'
      )
    })
  })
})
