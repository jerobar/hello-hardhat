const { ethers } = require('hardhat')
const {
  loadFixture,
  time
} = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')

describe('BreakfastFoodsNFTStaking', function () {
  // Deploy 'BreakfastFoodsNFTStaking' contract and mint token 0
  async function deployBreakfastFoodsNFTStaking() {
    const [deployer] = await ethers.getSigners()

    // Deploy 'BreakfastCoinStaking' contract
    const BreakfastCoinStakingFactory = await ethers.getContractFactory(
      'BreakfastCoinStaking'
    )
    const breakfastCoinStaking = await BreakfastCoinStakingFactory.deploy()

    // Deploy 'BreakfastFoodsNFTStaking' contract with address of 'BreakfastCoinStaking' contract
    const BreakfastFoodsNFTStakingFactory = await ethers.getContractFactory(
      'BreakfastFoodsNFTStaking'
    )
    const breakfastFoodsNftStaking =
      await BreakfastFoodsNFTStakingFactory.deploy(breakfastCoinStaking.address)

    // Mint token 0
    const mintToken0Tx = await breakfastFoodsNftStaking.mint()
    mintToken0Tx.wait()

    // Add 'BreakfastFoodsNFTStaking' contract to 'BreakfastCoinStaking" minting adresses
    const addMinterTx = await breakfastCoinStaking.addMintingAddress(
      breakfastFoodsNftStaking.address
    )
    addMinterTx.wait()

    return { breakfastCoinStaking, breakfastFoodsNftStaking, deployer }
  }

  /**
   * Deployment
   *
   * - Should set breakfast coin contract
   */
  describe('Deployment', function () {
    it('Should set breakfast coin contract', async function () {
      const { breakfastFoodsNftStaking } = await loadFixture(
        deployBreakfastFoodsNFTStaking
      )

      // Test 'breakfastCoinContract' exists
      expect(await breakfastFoodsNftStaking.breakfastCoinContract()).not.to.be
        .reverted
    })
  })

  /**
   * Staking
   *
   * - Should allow token staking
   * - Should return whether token id is currently staked
   * - Should allow token unstaking
   * - Should properly revert when unstaking requested by wrong address
   * - Should calculate reward periods elapsed
   * - Should update withdrawal times
   */
  describe('Staking', function () {
    it('Should allow token staking', async function () {
      const { breakfastFoodsNftStaking } = await loadFixture(
        deployBreakfastFoodsNFTStaking
      )

      // Stake token 0
      const stakeTokenTx = await breakfastFoodsNftStaking.stake(0)
      stakeTokenTx.wait()

      // Test that token 0 is staked
      expect(await breakfastFoodsNftStaking.tokenIsStaked(0)).to.equal(true)
    })

    it('Should return whether token id is currently staked', async function () {
      const { breakfastFoodsNftStaking } = await loadFixture(
        deployBreakfastFoodsNFTStaking
      )

      // Test that token 0 is staked
      expect(await breakfastFoodsNftStaking.tokenIsStaked(0)).to.equal(false)
    })

    it('Should allow token unstaking', async function () {
      const { breakfastFoodsNftStaking } = await loadFixture(
        deployBreakfastFoodsNFTStaking
      )

      // Stake token 0
      const stakeTokenTx = await breakfastFoodsNftStaking.stake(0)
      stakeTokenTx.wait()

      // Unstake token 0
      const unstakeTokenTx = await breakfastFoodsNftStaking.unstake(0)
      unstakeTokenTx.wait()

      // Test that token 0 is staked
      expect(await breakfastFoodsNftStaking.tokenIsStaked(0)).to.equal(false)
    })

    it('Should properly revert when unstaking requested by wrong address', async function () {
      const { breakfastFoodsNftStaking } = await loadFixture(
        deployBreakfastFoodsNFTStaking
      )

      const [, wrongAddress] = await ethers.getSigners()

      // Stake token 0
      const stakeTokenTx = await breakfastFoodsNftStaking.stake(0)
      stakeTokenTx.wait()

      // Test unstaking by wrong address is properly reverted
      await expect(
        breakfastFoodsNftStaking.connect(wrongAddress).unstake(0)
      ).to.be.revertedWith(
        'BreakfastFoodsNFTStaking: Token not staked by this address'
      )
    })

    it('Should calculate reward periods elapsed', async function () {
      const { breakfastFoodsNftStaking, breakfastCoinStaking, deployer } =
        await loadFixture(deployBreakfastFoodsNFTStaking)

      // Stake token 0
      const stakeTokenTx = await breakfastFoodsNftStaking.stake(0)
      stakeTokenTx.wait()

      // Increase time 48 hours and 1 second (2 reward periods)
      await time.increase(60 * 60 * 24 * 2 + 1)

      // Withdraw breakfast coins
      const withdrawBreakfastCoinsTx =
        await breakfastFoodsNftStaking.withdrawBreakfastCoins(0)
      withdrawBreakfastCoinsTx.wait()

      // Test 2 reward periods worth of coins minted
      expect(await breakfastCoinStaking.balanceOf(deployer.address)).to.equal(
        20n * 10n ** 18n
      )
    })

    // it('Should update withdrawal times', async function () {
    //   const { breakfastFoodsNftStaking } = await loadFixture(
    //     deployBreakfastFoodsNFTStaking
    //   )
    // })
  })

  /**
   * Withdrawal
   *
   * - Should allow token withdrawal
   * - Should properly revert when withdrawl of unstaked token requested
   * - Should properly revert when withdrawal requested too early
   */
  describe('Withdraw', function () {
    // it('Should allow token withdrawal', async function () {

    // })

    it('Should properly revert when withdrawl of unstaked token requested', async function () {
      const { breakfastFoodsNftStaking } = await loadFixture(
        deployBreakfastFoodsNFTStaking
      )

      // Test attempt to withdraw from unstaked token properly reverted
      await expect(
        breakfastFoodsNftStaking.withdrawBreakfastCoins(0)
      ).to.be.revertedWith('BreakfastFoodsNFTStaking: Token not staked')
    })

    it('Should properly revert when withdrawal requested too early', async function () {
      const { breakfastFoodsNftStaking, breakfastCoinStaking, deployer } =
        await loadFixture(deployBreakfastFoodsNFTStaking)

      // Stake token 0
      const stakeTokenTx = await breakfastFoodsNftStaking.stake(0)
      stakeTokenTx.wait()

      // Increase time 23 hours (< 1 reward period)
      await time.increase(60 * 60 * 23)

      // Test early withdrawal of rewards properly reverted
      await expect(
        breakfastFoodsNftStaking.withdrawBreakfastCoins(0)
      ).to.be.revertedWith(
        'BreakfastFoodsNFTStaking: Can only withdraw coins every 24 hours'
      )
    })
  })
})
