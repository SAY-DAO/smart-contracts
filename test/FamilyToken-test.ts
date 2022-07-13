import { upgrades, ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function deployTokenFixture() {
  // Contracts are deployed using the first signer/account by default
  const [owner, addr1, addr2] = await ethers.getSigners();
  const TheNeed = await ethers.getContractFactory("TheNeed");
  const theNeed = await upgrades.deployProxy(TheNeed, []);
  const FamilyToken = await ethers.getContractFactory("FamilyToken");
  const familyToken = await upgrades.deployProxy(FamilyToken, []);
  const FamilyTokenV2 = await ethers.getContractFactory("FamilyTokenV2");
  const familyTokenV2 = await upgrades.upgradeProxy(
    familyToken.address,
    FamilyTokenV2
  );
  return { familyToken, familyTokenV2, theNeed, owner, addr1, addr2 };
}

async function deployLockFixture() {
  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = await upgrades.deployProxy(TimeLock, []);
  return { timeLock };
}

describe("Deployment", function () {
  it("Should deploy the NFT tokens", async function () {
    const { familyToken, familyTokenV2 } = await loadFixture(
      deployTokenFixture
    );
    expect(await familyToken.owner()).to.equal(await familyTokenV2.owner());
  });

  it("Should count virtual families NFT tokens on V1 and V2", async function () {
    const { familyToken, familyTokenV2, theNeed, addr1, addr2 } =
      await loadFixture(deployTokenFixture);
    await familyToken.safeMint(1, theNeed.address);

    expect(await familyToken._tokenIdCounter()).to.equal(
      await familyTokenV2._tokenIdCounter()
    );
  });
});
