import { upgrades, ethers, network } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import Voucher from "../scripts/Voucher";
import {
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY,
  VOTING_THRESHOLD,
  MIN_DELAY,
  ADDRESS_ZERO,
  NEED_RATIO,
  developmentChains,
  NEW_NEED_RATIO,
} from "../helpers/helper-hardhat-config";
import { moveBlocks } from "../helpers/utils/move-blocks";

async function deployLockFixture() {
  const [owner] = await ethers.getSigners();
  const VerifyVoucher = await ethers.getContractFactory("VerifyVoucher");
  const verifyVoucher = await upgrades.deployProxy(VerifyVoucher, []);

  const TheNeed = await ethers.getContractFactory("TheNeed");
  const theNeed = await upgrades.deployProxy(TheNeed, []);

  const FamilyToken = await ethers.getContractFactory("FamilyToken");
  const familyToken = await upgrades.deployProxy(FamilyToken, [
    verifyVoucher.address,
  ]);
  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = await upgrades.deployProxy(TimeLock, [MIN_DELAY, [], []]);

  const GovernorContract = await ethers.getContractFactory("GovernorContract");
  const governorContract = await upgrades.deployProxy(GovernorContract, [
    familyToken.address,
    timeLock.address,
    VOTING_DELAY,
    VOTING_PERIOD,
    VOTING_THRESHOLD,
    QUORUM_PERCENTAGE,
  ]);

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await upgrades.deployProxy(Treasury, [
    timeLock.address,
    NEED_RATIO,
  ]);

  return {
    owner,
    verifyVoucher,
    theNeed,
    familyToken,
    timeLock,
    governorContract,
    treasury,
  };
}

async function mintFamilyToken() {
  const {
    owner,
    verifyVoucher,
    theNeed,
    familyToken,
    timeLock,
    governorContract,
    treasury,
  } = await loadFixture(deployLockFixture);
  // Contracts are deployed using the first signer/account by default
  const [familyMember, friend] = await ethers.getSigners();

  const friendContract = familyToken.connect(friend);
  const mintValue = ethers.utils.parseUnits("0.054", "ether");
  const voucher = new Voucher();
  const { ...theVoucher } = await voucher.signTransaction({
    needId: 13,
    mintValue: mintValue,
    tokenUri: "nothing",
    signer: familyMember,
    contract: verifyVoucher,
  });

  return {
    owner,
    verifyVoucher,
    theNeed,
    familyToken,
    timeLock,
    governorContract,
    treasury,
    familyMember,
    friend,
    friendContract,
    mintValue,
    theVoucher,
  };
}

describe("Deployment", function () {
  it("Should deploy and setup governance", async function () {
    const { verifyVoucher, familyToken, timeLock, governorContract } =
      await loadFixture(deployLockFixture);
    expect(verifyVoucher.address).is.not.equal(ADDRESS_ZERO);
    expect(familyToken.address).is.not.equal(ADDRESS_ZERO);
    expect(timeLock.address).is.not.equal(ADDRESS_ZERO);
    expect(governorContract.address).is.not.equal(ADDRESS_ZERO);
  });

  it("Should set up TimeLock roles", async function () {
    const { owner, timeLock } = await loadFixture(deployLockFixture);

    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    const proposerTx = await timeLock.grantRole(proposerRole, timeLock.address);
    await proposerTx.wait(1);
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO); // anybody can execute not only deployer
    await executorTx.wait(1);
    // revoke
    const revokeTx = await timeLock.revokeRole(adminRole, owner.address);
    await revokeTx.wait(1);

    expect(await timeLock.hasRole(proposerRole, timeLock.address)).to.be.true;
    expect(await timeLock.hasRole(executorRole, ADDRESS_ZERO)).to.be.true;
    expect(await timeLock.hasRole(adminRole, timeLock.address)).to.be.true;
    expect(await timeLock.hasRole(adminRole, owner.address)).to.be.false;
  });

  it("Should deploy Treasury and transfer its ownership", async function () {
    const { timeLock, treasury } = await loadFixture(deployLockFixture);

    const TIME_LOCK_ROLE = await treasury.TIME_LOCK_ROLE();
    expect(await treasury.hasRole(TIME_LOCK_ROLE, timeLock.address)).to.be.true;
  });

  it("Should propose", async function () {
    const {
      theNeed,
      familyToken,
      governorContract,
      treasury,
      familyMember,
      friend,
      friendContract,
      mintValue,
      theVoucher,
    } = await loadFixture(mintFamilyToken);

    await friendContract.safeMint(13, theNeed.address, theVoucher, {
      value: mintValue,
    });

    const tx = await friendContract.delegate(await friendContract.ownerOf(2));
    await tx.wait(1); // 1 block wait
    console.log("Delegated!");

    await expect(friendContract.delegate(friend.address))
      .to.emit(friendContract, "DelegateChanged") // transfer from null address to minter
      .withArgs(
        friend.address,
        await friendContract.delegates(friend.address),
        friend.address
      );
    console.log(await governorContract.getVotes(familyToken.address, 2));

    // const encodedFunctionCall = treasury.interface.encodeFunctionData(
    //   "updateNeedRatio",
    //   [NEW_NEED_RATIO]
    // );
    // const proposalDescription = "This is my proposal description!";

    // const proposeTx = await governorContract.connect(friend).propose(
    //   [treasury.address],
    //   [0], // Eth values
    //   [encodedFunctionCall],
    //   proposalDescription
    // );

    // If working on a development chain, we will speed up voting period by moving blocks froward.
    // if (developmentChains.includes(network.name)) {
    //   await moveBlocks(VOTING_DELAY + 1);
    // }

    expect(
      await friendContract.safeMint(13, theNeed.address, theVoucher, {
        value: mintValue,
      })
    )
      .to.emit(familyToken, "Minted") // transfer from null address to minter
      .withArgs(theVoucher.needId, 1, 2, familyMember.address, friend.address); // transfer from minter to redeemer
    expect(await familyToken.ownerOf(1)).to.equal(familyMember.address);
    expect(await familyToken.ownerOf(2)).to.equal(friend.address);
  });
});
