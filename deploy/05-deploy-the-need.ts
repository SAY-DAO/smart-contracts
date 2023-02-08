import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helpers/helper-functions";
import {
  developmentChains,
  NEED_RATIO,
  networkConfig,
} from "../helpers/helper-hardhat-config";
import { ethers, upgrades } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import fs from "fs";

const deployTheNeed: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { deployer } = await getNamedAccounts()
  const { deployments, network } = hre;
  const { log, deploy } = deployments;

  log("------------------------- Need Deployment ---------------------------");
  const TimeLock = await ethers.getContractFactory("TimeLock");
  let { timeLock, verifyVoucher } = JSON.parse(fs.readFileSync("./network-settings.json", 'utf8'));

  log("\n");
  log("Deploying Need Storage ...");
  const needStorage = await deploy('NeedStorage', {
    from: deployer,
    args: [timeLock],
    log: true,
    waitConfirmations: networkConfig(network.name).blockConfirmations || 1,
  })
  log(`NeedStorage deployed at: ${needStorage.address}`);


  log("\n");
  log("Deploying Need ...");
  const Need = await ethers.getContractFactory("Need");
  const theNeed = await upgrades.deployProxy(Need, [
    needStorage.address,
    verifyVoucher,
    timeLock
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
    timeLock
  );

  if (!isTimeLockOwner) {
    const transferTx = await theNeed.grantRole(
      TIME_LOCK_ROLE,
      timeLock
    );
    log(`Transferred ownership`);

    await transferTx.wait(1);
  }
  log(`Need NOW is owned and governed by TimeLock: ${timeLock}`);
};

export default deployTheNeed;
deployTheNeed.tags = ["all", "theNeed"];
