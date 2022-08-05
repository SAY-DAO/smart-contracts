import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helpers/helper-functions";
import { developmentChains, MIN_DELAY } from "../helpers/helper-hardhat-config";
import { ethers, upgrades } from "hardhat";

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

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(
      timeLock.address,
      [MIN_DELAY, [], []],
      "contracts/standards/TimeLock.sol:TimeLock"
    );
  }
  log(`TimeLock deployed at: ${timeLock.address}`);
};
export default deployTimeLock;
deployTimeLock.tags = ["all", "timelock"];
module.exports.dependencies = ["GovernanceToken"]; // this ensure the Token script above is executed first, so `deployments.get('Token')` succeeds
