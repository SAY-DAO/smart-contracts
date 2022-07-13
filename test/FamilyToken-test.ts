import { upgrades, ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import Voucher from "../scripts/Voucher";

async function deployTokenFixture() {
  // Contracts are deployed using the first signer/account by default
  const [owner, familyMember, friend] = await ethers.getSigners();
  // const VerifyVoucher = await ethers.getContractFactory("VerifyVoucher");
  // const verifyVoucher = await upgrades.deployProxy(VerifyVoucher, []);
  // const TheNeed = await ethers.getContractFactory("TheNeed");
  // const theNeed = await upgrades.deployProxy(TheNeed, []);
  // const FamilyToken = await ethers.getContractFactory("FamilyToken");
  // const familyToken = await upgrades.deployProxy(FamilyToken, []);
  // const FamilyTokenV2 = await ethers.getContractFactory("FamilyTokenV2");
  // const familyTokenV2 = await upgrades.upgradeProxy(
  //   familyToken.address,
  //   FamilyTokenV2
  // );
  const FamilyToken = await ethers.getContractFactory("FamilyToken");
  const familyToken = await upgrades.deployProxy(FamilyToken, []);

  const VerifyVoucher = await ethers.getContractFactory("VerifyVoucher");
  const verifyVoucher = await VerifyVoucher.deploy();

  const TheNeed = await ethers.getContractFactory("TheNeed");
  const theNeed = await TheNeed.deploy();

  const friendContract = familyToken.connect(friend);
  // const friendContract = FriendFactory.attach(familyToken.address);

  return {
    familyToken,
    friendContract,
    theNeed,
    verifyVoucher,
    owner,
    familyMember,
    friend,
  };
}

async function deployLockFixture() {
  // const TimeLock = await ethers.getContractFactory("TimeLock");
  // const timeLock = await upgrades.deployProxy(TimeLock, []);
  // return { timeLock };
}

describe("Deployment", function () {
  it("Should deploy the NFT tokens", async function () {
    const { familyToken } = await loadFixture(deployTokenFixture);
    // expect(await familyToken.owner()).to.equal(await familyTokenV2.owner());
  });

  it("Should count virtual families NFT tokens on V1 and V2", async function () {
    const {
      familyToken,
      friendContract,
      theNeed,
      verifyVoucher,
      familyMember,
      friend,
    } = await loadFixture(deployTokenFixture);

    const mintValue = ethers.utils.parseUnits("0.054", "ether");

    const voucher = new Voucher();
    const { ...theVoucher } = await voucher.signTransaction({
      needId: 13,
      mintValue: mintValue,
      tokenUri: "nothing",
      signer: familyMember,
      contract: verifyVoucher,
    });

    // before mint set the voucher contract
    await familyToken.setVoucherVerifier(verifyVoucher.address);
    console.log(familyMember.address, friend.address);

    console.log(friendContract);
    await expect(
      friendContract.safeMint(13, theNeed.address, theVoucher, {
        value: mintValue,
      })
    )
      .to.emit(familyToken, "Minted") // transfer from null address to minter
      .withArgs(theVoucher.needId, 1, 2, familyMember.address, friend.address);
    // .and.to.emit(familyToken, "Minted") // transfer from minter to redeemer
    // .withArgs(_needId, tokenId));
  });
  // expect(await familyToken._tokenIdCounter()).to.equal(
  //   await familyTokenV2._tokenIdCounter()
  // );
  // });
});
