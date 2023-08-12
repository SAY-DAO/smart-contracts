import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helpers/helper-functions";
import {
  developmentChains,
  MIN_DELAY,
  networkConfig,
} from "../helpers/helper-hardhat-config";
import { getNamedAccounts } from "hardhat";
import fs from "fs";

const deployTimeLock: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { deployments, network } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  log(
    "------------------------- TimeLock Deployment ---------------------------"
  );

//   log("Deploying TimeLock ...");
//   const timeLock = await deploy("TimeLock", {
//     from: deployer,
//     args: [MIN_DELAY, [], [], deployer],
//     log: true,
//     waitConfirmations: networkConfig(network.name).blockConfirmations || 1,
//   });

//   log(`TimeLock deployed at: ${timeLock.address}`);

//   if (
//     !developmentChains.includes(network.name) &&
//     process.env.ETHERSCAN_API_KEY
//   ) {
//     await verify(
//       timeLock.address,
//       [MIN_DELAY, [], [], deployer],
//       "contracts/governance/TimeLock.sol:TimeLock"
//     );
//   }
//   const stringFile = fs.readFileSync("network-settings.json", "utf8");
//   const file = JSON.parse(stringFile);

//   if (typeof(file.verifyVoucher) !== 'string' || typeof(file.timeLock) !== 'string') {
//     let data = {
//       timeLock: timeLock.address,
//       verifyVoucher: file.verifyVoucher,
//     };
//     let dictstring = JSON.stringify(data);
//     fs.writeFileSync("network-settings.json", dictstring);
//   }
};
export default deployTimeLock;
deployTimeLock.tags = ["all", "timelock"];
module.exports.dependencies = ["GovernanceToken"]; // this ensure the Token script above is executed first, so `deployments.get('Token')` succeeds
