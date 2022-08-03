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
  NEW_NEED_RATIO,
  FUNC,
  PROPOSAL_DESCRIPTION,
  SUPPORT,
  REASON,
} from "../helpers/helper-hardhat-config";
import { moveBlocks } from "../helpers/utils/move-blocks";
import { moveTime } from "../helpers/utils/move-time";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";

async function deployLockFixture() {
  const [owner, familyMember, friend] = await ethers.getSigners();
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
    familyMember,
    verifyVoucher,
    theNeed,
    familyToken,
    timeLock,
    governorContract,
    treasury,
  };
}

async function signTransaction(familyToken: Contract, verifyVoucher: Contract) {
  // Contracts are deployed using the first signer/account by default
  const [owner, familyMember, friend] = await ethers.getSigners();
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
    familyMember,
    friend,
    verifyVoucher,
    friendContract,
    mintValue,
    theVoucher,
  };
}

async function delegateAndPropose(
  friendContract: Contract,
  friend: SignerWithAddress,
  governorContract: Contract,
  treasury: Contract
) {
  //delegate to be able vote
  const tx = await friendContract.delegate(await friendContract.ownerOf(2));
  await tx.wait(1); // 1 block wait

  const encodedFunctionCall = treasury.interface.encodeFunctionData(FUNC, [
    NEW_NEED_RATIO,
  ]);

  // friend has voting power
  const proposeTx = await governorContract.connect(friend).propose(
    [treasury.address], // target
    [0], // Eth values
    [encodedFunctionCall], // calldata
    PROPOSAL_DESCRIPTION
  );

  const proposeReceipt = await proposeTx.wait(1);
  const proposalId = proposeReceipt.events[0].args.proposalId;
  expect(await governorContract.state(proposalId)).to.equal(0); // pending
  const proposalSnapShot = await governorContract.proposalSnapshot(proposalId);
  const proposalDeadline = await governorContract.proposalDeadline(proposalId);

  //  we will speed up voting period by moving blocks froward.
  await moveBlocks(VOTING_DELAY + 1);

  expect(await governorContract.state(proposalId)).to.equal(1); // active
  expect(proposalDeadline - proposalSnapShot).to.equal(VOTING_PERIOD);
  return {
    proposalId,
    proposalSnapShot,
    proposalDeadline,
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

  it("Should mint, delegate, propose and vote", async function () {
    // deploy
    const { verifyVoucher, theNeed, familyToken, governorContract, treasury } =
      await loadFixture(deployLockFixture);

    // sign & mint
    const { familyMember, friend, friendContract, mintValue, theVoucher } =
      await signTransaction(familyToken, verifyVoucher);

    expect(
      await friendContract.safeMint(13, theNeed.address, theVoucher, {
        value: mintValue,
      })
    )
      .to.emit(familyToken, "Minted")
      .withArgs(theVoucher.needId, 1, 2, familyMember.address, friend.address);
    expect(await familyToken.ownerOf(1)).to.equal(familyMember.address);
    expect(await familyToken.ownerOf(2)).to.equal(friend.address);

    // delegate & propose
    const { proposalId, proposalSnapShot, proposalDeadline } =
      await delegateAndPropose(
        friendContract,
        friend,
        governorContract,
        treasury
      );

    expect(proposalDeadline - proposalSnapShot).is.equal(VOTING_PERIOD);
    //   enum ProposalState: Pending,Active,Canceled,Defeated,Succeeded,Queued,Expired,Executed
    expect(await governorContract.state(proposalId)).is.equal(1);
  });

  it("Should add to queue and execute!", async function () {
    // deploy
    const {
      owner,
      verifyVoucher,
      theNeed,
      familyToken,
      timeLock,
      governorContract,
      treasury,
    } = await loadFixture(deployLockFixture);

    // sign & mint
    const { familyMember, friend, friendContract, mintValue, theVoucher } =
      await signTransaction(familyToken, verifyVoucher);

    await friendContract.safeMint(13, theNeed.address, theVoucher, {
      value: mintValue,
    });

    console.log("Proposing...");
    const { proposalId } = await delegateAndPropose(
      friendContract,
      friend,
      governorContract,
      treasury
    );

    console.log("Voting...");
    const voteTx = await governorContract
      .connect(friend)
      .castVoteWithReason(proposalId, SUPPORT, REASON);

    const voteTxReceipt = await voteTx.wait(1); // wait for transaction being confirmed
    // console.log(voteTxReceipt.events[0].args);

    await moveBlocks(VOTING_PERIOD + 1);

    console.log(await treasury.fetchNeedRatio()); // before execution

    expect(await governorContract.state(proposalId)).is.equal(4); // succeeded state
    console.log("Queueing...");

    const encodedFunctionCall = treasury.interface.encodeFunctionData(FUNC, [
      NEW_NEED_RATIO,
    ]);

    const descriptionHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION)
    );

    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    const proposerTx = await timeLock.grantRole(
      proposerRole,
      governorContract.address
    );
    await proposerTx.wait(1);
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
    await executorTx.wait(1);
    const revokeTx = await timeLock.revokeRole(adminRole, owner.address);
    await revokeTx.wait(1);

    expect(
      await timeLock.hasRole(proposerRole, governorContract.address)
    ).to.equal(true);
    expect(await timeLock.hasRole(proposerRole, ADDRESS_ZERO)).to.equal(false);
    expect(await timeLock.hasRole(adminRole, owner.address)).to.equal(false);

    // queue a proposal by the governor.
    const queueTx = await governorContract.queue(
      [treasury.address], // address[] memory targets
      [0], // uint256[] memory values
      [encodedFunctionCall], // bytes[] memory calldatas
      descriptionHash //bytes32 descriptionHash
    );
    await queueTx.wait(1);

    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);

    console.log("Executing...");
    console.log(await governorContract.quorum(10));

    // this will fail on a testnet because you need to wait for the MIN_DELAY!
    const executeTx = await governorContract.execute(
      [treasury.address], // address[] memory targets,
      [0], // uint256[] memory values,
      [encodedFunctionCall], // bytes[] memory calldatas,
      descriptionHash // bytes32 descriptionHash
    );
    await executeTx.wait(1);

    expect(await treasury.fetchNeedRatio()).to.equal(NEW_NEED_RATIO); // after execution
  });
});
