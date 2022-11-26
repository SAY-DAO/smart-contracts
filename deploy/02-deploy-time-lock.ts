import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helpers/helper-functions";
import { developmentChains, MIN_DELAY } from "../helpers/helper-hardhat-config";
import { ethers, upgrades } from "hardhat";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";

const deployTimeLock: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { deployments, network } = hre;
  const { log } = deployments;
  log(
    "------------------------- TimeLock Deployment ---------------------------"
  );
  log("Deploying TimeLock ...");
  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = await upgrades.deployProxy(TimeLock, [MIN_DELAY, [], []]);
  await timeLock.deployed();
  await timeLock.wait;
  
  log(`TimeLock deployed at: ${timeLock.address}`);

  const currentImplAddress = await getImplementationAddress(
    ethers.provider,
    timeLock.address
  );

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(
      currentImplAddress,
      [],
      "contracts/governance/TimeLock.sol:TimeLock"
    );
  }
};
export default deployTimeLock;
deployTimeLock.tags = ["all", "timelock"];
module.exports.dependencies = ["GovernanceToken"]; // this ensure the Token script above is executed first, so `deployments.get('Token')` succeeds
