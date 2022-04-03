import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  networkConfig,
  developmentChains,
  MIN_DELAY,
} from "../app/src/helpers/helper-hardhat-config";

const deployTimeLock: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log(
    "------------------------- TimeLock Deployment ---------------------------"
  );
  log("Deploying TimeLock ...");
  const timeLock = await deploy("TimeLock", {
    from: deployer,
    args: [MIN_DELAY, [], []],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  log(`TimeLock deployed at: ${timeLock.address}`);
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
};

export default deployTimeLock;
deployTimeLock.tags = ["all", "timelock"];
