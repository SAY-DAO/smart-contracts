import { ethers } from "hardhat";
import { use, expect } from "chai";
import Voucher from "../scripts/Voucher";
import { ADDRESS_ZERO } from "../helpers/helper-hardhat-config";
import need from "../helpers/needExample.json";
import { Contract } from "ethers";

enum NeedTypeEnum {
  SERVICE,
  PRODUCT,
}

enum NeedKindEnum {
  COMMON,
  PERSONAL,
  UNIQUE,
}

async function deployLockFixture() {
  const [owner, familyMember, sayAdmin] = await ethers.getSigners();
  const DifficultyFactory = await ethers.getContractFactory("NeedDifficulty");
  const difficultyContract = await DifficultyFactory.deploy(
    [2, 8, 5, 3], // CP
    [6, 2, 3, 7], // PP
    [1, 1, 8, 5], // UP
    [2, 8, 1, 5], // CS
    [2, 5, 9, 2], // PS
    [8, 5, 2, 3], // US
  );
  await difficultyContract.waitForDeployment();

  return {
    sayAdmin,
    owner,
    familyMember,
    difficultyContract,
  };
}

describe("Deployment", function () {
  it("Should deploy difficulty contract", async function () {
    const { difficultyContract } = await deployLockFixture();
    expect(difficultyContract.address).is.not.equal(ADDRESS_ZERO);
  });

  it("Should get the difficulty", async function () {
    const [deployer] = await ethers.getSigners();
    // deploy
    const { difficultyContract } = await deployLockFixture();
    expect(
      String(
        await difficultyContract.getNeedDifficulty(
          NeedKindEnum.COMMON,
          NeedTypeEnum.SERVICE,
        ),
      ),
    ).is.equal(String([2n, 8n, 1n, 5n]));
    expect(
      String(
        await difficultyContract.getNeedDifficulty(
          NeedKindEnum.PERSONAL,
          NeedTypeEnum.SERVICE,
        ),
      ),
    ).is.equal(String([2n, 5n, 9n, 2n]));
    expect(
      String(
        await difficultyContract.getNeedDifficulty(
          NeedKindEnum.UNIQUE,
          NeedTypeEnum.SERVICE,
        ),
      ),
    ).is.equal(String([8n, 5n, 2n, 3n]));
    expect(
      String(
        await difficultyContract.getNeedDifficulty(
          NeedKindEnum.COMMON,
          NeedTypeEnum.PRODUCT,
        ),
      ),
    ).is.equal(String([2n, 8n, 5n, 3n]));
    expect(
      String(
        await difficultyContract.getNeedDifficulty(
          NeedKindEnum.PERSONAL,
          NeedTypeEnum.PRODUCT,
        ),
      ),
    ).is.equal(String([6n, 2n, 3n, 7n]));
    expect(
      String(
        await difficultyContract.getNeedDifficulty(
          NeedKindEnum.UNIQUE,
          NeedTypeEnum.PRODUCT,
        ),
      ),
    ).is.equal(String([1n, 1n, 8n, 5n]));
  });

  it("Should allow only owner to update", async function () {
    const [deployer] = await ethers.getSigners();
    // deploy
    const { difficultyContract } = await deployLockFixture();
    expect(
      String(
        await difficultyContract.getNeedDifficulty(
          NeedKindEnum.UNIQUE,
          NeedTypeEnum.SERVICE,
        ),
      ),
    ).is.equal(String([8n, 5n, 2n, 3n]));

    await difficultyContract.updateNeedDifficulty(
      [3n, 3n, 3n, 1n],
      NeedKindEnum.UNIQUE,
      NeedTypeEnum.SERVICE,
    );

    expect(
      String(
        await difficultyContract.getNeedDifficulty(
          NeedKindEnum.UNIQUE,
          NeedTypeEnum.SERVICE,
        ),
      ),
    ).is.equal(String([3n, 3n, 3n, 1n]));
  });
});
