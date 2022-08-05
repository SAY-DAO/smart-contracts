import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  developmentChains,
  NEED_RATIO,
  MIN_DELAY,
} from "../helpers/helper-hardhat-config";
import { ethers, upgrades } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";

const deployTheNeed: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { deployments, network } = hre;
  const { log } = deployments;

  log(
    "------------------------- TheNeed Deployment ---------------------------"
  );
  log("Deploying TheNeed ...");

  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = await upgrades.deployProxy(TimeLock, [MIN_DELAY, [], []]);

  const TheNeed = await ethers.getContractFactory("TheNeed");
  const theNeed = await upgrades.deployProxy(TheNeed, [
    [NEED_RATIO, timeLock.address],
  ]);

  log(`TheNeed deployed at at ${theNeed.address}`);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(
      theNeed.address,
      [NEED_RATIO, timeLock.address],
      "contracts/TheNeed.sol:TheNeed"
    );
  }

  const TIME_LOCK_ROLE = keccak256(toUtf8Bytes("TIME_LOCK_ROLE"));
  const isTimeLockOwner = await theNeed.hasRole(
    TIME_LOCK_ROLE,
    timeLock.address
  );

  if (!isTimeLockOwner) {
    const transferTx = await theNeed.grantRole(
      TIME_LOCK_ROLE,
      timeLock.address
    );
    log(`Transferred ownership`);
    log(transferTx);

    await transferTx.wait(1);
  }
  log(`TheNeed NOW is owned and governed by TimeLock: ${timeLock.address}`);
};

export default deployTheNeed;
deployTheNeed.tags = ["all", "theNeed"];
