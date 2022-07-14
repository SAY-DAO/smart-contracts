import { upgrades, ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import Voucher from "../scripts/Voucher";

async function deployLockFixture() {
  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = await upgrades.deployProxy(TimeLock, []);
  return { timeLock };
}

describe("Deployment", function () {
  it("Should upgrade the NFT family tokens", async function () {
    // const { timeLock } = await loadFixture(deployLockFixture);
  });
});
