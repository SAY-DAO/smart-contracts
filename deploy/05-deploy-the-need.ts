import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helpers/helper-functions";
import {
  developmentChains,
  NEED_RATIO,
  MIN_DELAY,
} from "../helpers/helper-hardhat-config";
import { ethers, upgrades } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";

const deployTheNeed: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { deployments, network } = hre;
  const { log } = deployments;

  log("------------------------- Need Deployment ---------------------------");
  log("Deploying Need ...");

  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = await upgrades.deployProxy(TimeLock, [MIN_DELAY, [], []]);
  await timeLock.deployed();
  await timeLock.wait;
  
  const Need = await ethers.getContractFactory("Need");
  const theNeed = await upgrades.deployProxy(Need, [
    NEED_RATIO,
    timeLock.address,
  ]);
  await theNeed.deployed();
  await theNeed.wait;
  

  log(`Need deployed at at ${theNeed.address}`);

  const currentImplAddress = await getImplementationAddress(
    ethers.provider,
    theNeed.address
  );

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(currentImplAddress, [], "contracts/needModule/Need.sol:Need");
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

    await transferTx.wait(1);
  }
  log(`Need NOW is owned and governed by TimeLock: ${timeLock.address}`);
};

export default deployTheNeed;
deployTheNeed.tags = ["all", "theNeed"];
