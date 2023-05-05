import { upgrades, ethers } from "hardhat";
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

async function deployLockFixture() {
  const [owner, familyMember, friend, sayAdmin] = await ethers.getSigners();
  const VerifyVoucher = await ethers.getContractFactory("VerifyVoucher");
  const verifyVoucherContract = await VerifyVoucher.deploy();

  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceTokenContract = await GovernanceToken.deploy();

  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLockContract = await TimeLock.deploy(MIN_DELAY, [], [], owner.address);

  const GovernorContract = await ethers.getContractFactory("GovernorContract");
  const governorContract = await GovernorContract.deploy(
    governanceTokenContract.address,
    timeLockContract.address,
    VOTING_DELAY,
    VOTING_PERIOD,
    VOTING_THRESHOLD,
    QUORUM_PERCENTAGE
  );


  const NeedStorage = await ethers.getContractFactory("NeedStorage");
  const storageContract = await NeedStorage.deploy(timeLockContract.address);

  const Need = await ethers.getContractFactory("Need");
  const theNeed = await upgrades.deployProxy(Need, [
    storageContract.address,
    verifyVoucherContract.address,
    timeLockContract.address
  ]);

  return {
    sayAdmin,
    owner,
    familyMember,
    verifyVoucherContract,
    theNeed,
    governanceTokenContract,
    timeLockContract,
    governorContract,
  };
}

async function signTransaction(
  governanceToken: Contract,
  verifyVoucher: Contract
) {
  // Contracts are deployed using the first signer/account by default
  const [owner, familyMember, friend] = await ethers.getSigners();
  const friendContract = governanceToken.connect(friend);
  const mintAmount = ethers.utils.parseUnits("0.054", "ether");
  const voucher = new Voucher();
  const { ...theVoucher } = await voucher.signTransaction({
    needId: 13,
    mintAmount: mintAmount,
    tokenUri: "nothing",
    signer: familyMember,
    contract: verifyVoucher,
  });

  return {
    familyMember,
    friend,
    verifyVoucher,
    friendContract,
    mintAmount,
    theVoucher,
  };
}

async function delegateAndPropose(
  friendContract: Contract,
  friend: SignerWithAddress,
  governorContract: Contract,
  theNeed: Contract
) {
  //delegate to be able vote - token 1 for familyMember, 2 for friend
  const tx = await friendContract.delegate(await friendContract.ownerOf(2));
  await tx.wait(1); // wait until the transaction is mined

  const encodedFunctionCall = theNeed.interface.encodeFunctionData(FUNC, [
    NEW_NEED_RATIO,
  ]);

  // friend has voting power
  const proposeTx = await governorContract.connect(friend).propose(
    [theNeed.address], // target
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
    const { verifyVoucherContract, governanceTokenContract, timeLockContract, governorContract } =
      await loadFixture(deployLockFixture);
    expect(verifyVoucherContract.address).is.not.equal(ADDRESS_ZERO);
    expect(governanceTokenContract.address).is.not.equal(ADDRESS_ZERO);
    expect(timeLockContract.address).is.not.equal(ADDRESS_ZERO);
    expect(governorContract.address).is.not.equal(ADDRESS_ZERO);
  });

  it("Should set up TimeLock roles", async function () {
    const { owner, timeLockContract } = await loadFixture(deployLockFixture);

    const proposerRole = await timeLockContract.PROPOSER_ROLE();
    const executorRole = await timeLockContract.EXECUTOR_ROLE();
    const adminRole = await timeLockContract.TIMELOCK_ADMIN_ROLE();

    const proposerTx = await timeLockContract.grantRole(proposerRole, timeLockContract.address);
    await proposerTx.wait(1);
    const executorTx = await timeLockContract.grantRole(executorRole, ADDRESS_ZERO); // anybody can execute not only deployer
    await executorTx.wait(1);
    // revoke
    const revokeTx = await timeLockContract.revokeRole(adminRole, owner.address);
    await revokeTx.wait(1);

    expect(await timeLockContract.hasRole(proposerRole, timeLockContract.address)).to.be.true;
    expect(await timeLockContract.hasRole(executorRole, ADDRESS_ZERO)).to.be.true;
    expect(await timeLockContract.hasRole(adminRole, timeLockContract.address)).to.be.true;
    expect(await timeLockContract.hasRole(adminRole, owner.address)).to.be.false;
  });

  // it("Should mint, delegate and propose", async function () {
  //   // deploy
  //   const { verifyVoucherContract, theNeed, governanceTokenContract, governorContract } =
  //     await loadFixture(deployLockFixture);

  //   // sign & mint
  //   const { familyMember, friend, friendContract, mintAmount, theVoucher } =
  //     await signTransaction(governanceTokenContract, verifyVoucherContract);

  //   expect(
  //     await friendContract.safeFamilyMint(13, theNeed.address, theVoucher, {
  //       value: mintAmount,
  //     })
  //   )
  //     .to.emit(governanceTokenContract, "Minted")
  //     .withArgs(theVoucher.needId, 1, 2, familyMember.address, friend.address);
  //   expect(await governanceTokenContract.ownerOf(1)).to.equal(familyMember.address);
  //   expect(await governanceTokenContract.ownerOf(2)).to.equal(friend.address);

  //   // delegate & propose
  //   const { proposalId, proposalSnapShot, proposalDeadline } =
  //     await delegateAndPropose(
  //       friendContract,
  //       friend,
  //       governorContract,
  //       theNeed
  //     );

  //   expect(proposalDeadline - proposalSnapShot).is.equal(VOTING_PERIOD);
  //   //   enum ProposalState: Pending,Active,Canceled,Defeated,Succeeded,Queued,Expired,Executed
  //   expect(await governorContract.state(proposalId)).is.equal(1);
  // });

  // it("Should vote, queue and only upgrader role execute!", async function () {
  //   // deploy
  //   const {
  //     owner,
  //     verifyVoucherContract,
  //     theNeed,
  //     governanceTokenContract,
  //     timeLockContract,
  //     governorContract,
  //   } = await loadFixture(deployLockFixture);

  //   // sign & mint
  //   const { familyMember, friend, friendContract, mintAmount, theVoucher } =
  //     await signTransaction(governanceTokenContract, verifyVoucherContract);

  //   await friendContract.safeFamilyMint(13, theNeed.address, theVoucher, {
  //     value: mintAmount,
  //   });

  //   console.log("Proposing...");
  //   const { proposalId } = await delegateAndPropose(
  //     friendContract,
  //     friend,
  //     governorContract,
  //     theNeed
  //   );

  //   console.log("Voting...");
  //   const voteTx = await governorContract
  //     .connect(friend)
  //     .castVoteWithReason(proposalId, SUPPORT, REASON);

  //   const voteTxReceipt = await voteTx.wait(1); // wait for transaction being confirmed

  //   // weight of the vote
  //   expect(
  //     await friendContract.getPastVotes(friend.address, voteTx.blockNumber - 1)
  //   ).to.equal(voteTxReceipt.events[0].args.weight);

  //   // total supply of votes available at the end of a past block
  //   expect(
  //     await friendContract.getPastTotalSupply(voteTx.blockNumber - 1)
  //   ).to.equal(2);

  //   console.log(
  //     await friendContract.getPastTotalSupply(voteTx.blockNumber - 1)
  //   );
  //   await moveBlocks(VOTING_PERIOD + 1);
  //   expect(await governorContract.state(proposalId)).is.equal(4); // succeeded state

  //   expect(await theNeed.fetchNeedRatio()).to.equal(NEED_RATIO); // before execution

  //   console.log("Queueing...");

  //   const encodedFunctionCall = theNeed.interface.encodeFunctionData(FUNC, [
  //     NEW_NEED_RATIO,
  //   ]);

  //   const descriptionHash = ethers.utils.keccak256(
  //     ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION)
  //   );

  //   const proposerRole = await timeLockContract.PROPOSER_ROLE();
  //   const executorRole = await timeLockContract.EXECUTOR_ROLE();
  //   const adminRole = await timeLockContract.TIMELOCK_ADMIN_ROLE();

  //   const proposerTx = await timeLockContract.grantRole(
  //     proposerRole,
  //     governorContract.address
  //   );
  //   await proposerTx.wait(1);
  //   const executorTx = await timeLockContract.grantRole(executorRole, ADDRESS_ZERO);
  //   await executorTx.wait(1);
  //   const revokeTx = await timeLockContract.revokeRole(adminRole, owner.address);
  //   await revokeTx.wait(1);

  //   expect(
  //     await timeLockContract.hasRole(proposerRole, governorContract.address)
  //   ).to.equal(true);
  //   expect(await timeLockContract.hasRole(proposerRole, ADDRESS_ZERO)).to.equal(false);
  //   expect(await timeLockContract.hasRole(adminRole, owner.address)).to.equal(false);

  //   // queue a proposal by the governor.
  //   const queueTx = await governorContract.queue(
  //     [theNeed.address], // address[] memory targets
  //     [0], // uint256[] memory values
  //     [encodedFunctionCall], // bytes[] memory calldatas
  //     descriptionHash //bytes32 descriptionHash
  //   );
  //   await queueTx.wait(1);

  //   await moveTime(MIN_DELAY + 1);
  //   await moveBlocks(1);

  //   console.log("Executing...");
  //   console.log(await governorContract.quorum(queueTx.blockNumber - 1));

  //   // this will fail on a testnet because you need to wait for the MIN_DELAY!
  //   const executeTx = await governorContract.execute(
  //     [theNeed.address], // address[] memory targets,
  //     [0], // uint256[] memory values,
  //     [encodedFunctionCall], // bytes[] memory calldatas,
  //     descriptionHash // bytes32 descriptionHash
  //   );
  //   await executeTx.wait(1);
  //   // expect(await theNeed.fetchNeedRatio()).to.equal(NEW_NEED_RATIO); // after execution
  // });

  // it("Should upgrade the Governance token", async function () {
  //   const { sayAdmin, verifyVoucherContract, governanceTokenContract } = await loadFixture(
  //     deployLockFixture
  //   );

  //   const GovernanceToken = await ethers.getContractFactory(
  //     "GovernanceToken"
  //   );
  //   const governanceTokenV2 = await upgrades.upgradeProxy(
  //     governanceTokenContract,
  //     GovernanceToken
  //   );

  //   expect(await governanceTokenV2.voucherAddress()).to.equal(
  //     verifyVoucherContract.address
  //   );

  //   await governanceTokenV2
  //     .connect(sayAdmin) // only say admin
  //     .setVoucherVerifier("0x0000000000000000000000000000000000000001");

  //   await expect(
  //     governanceTokenV2.setVoucherVerifier(
  //       "0x0000000000000000000000000000000000000002"
  //     )
  //   ).to.be.reverted;

  //   expect(await governanceTokenContract.voucherAddress()).to.equal(
  //     "0x0000000000000000000000000000000000000001"
  //   );

  //   expect(await governanceTokenV2.version()).to.equal("v2");
  // });
});
