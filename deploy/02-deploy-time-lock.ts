import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helpers/helper-functions";
import { developmentChains, MIN_DELAY, networkConfig } from "../helpers/helper-hardhat-config";
import { getNamedAccounts } from "hardhat";
import fs from "fs";

const deployTimeLock: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { deployments, network } = hre;
  const { deployer } = await getNamedAccounts()
  const { deploy, log } = deployments;
  log(
    "------------------------- TimeLock Deployment ---------------------------"
  );
  log("Deploying TimeLock ...");
  const timeLock = await deploy('TimeLock', {
    from: deployer,
    args: [MIN_DELAY, [], [], deployer],
    log: true,
    waitConfirmations: networkConfig(network.name).blockConfirmations || 1,
  })

  log(`TimeLock deployed at: ${timeLock.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(
      timeLock.address,
      [],
      "contracts/governance/TimeLock.sol:TimeLock"
    );
  }

  log(
    "------------------------- VerifyVoucher Deployment ---------------------------"
  );
  const verifyVoucher = await deploy('VerifyVoucher', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig(network.name).blockConfirmations || 1,
  })


  log(`VerifyVoucher deployed at: ${verifyVoucher.address}`);

  let data = {
    timeLock: timeLock.address,
    verifyVoucher: verifyVoucher.address
  }

  let dictstring = JSON.stringify(data);
  fs.writeFileSync("network-settings.json", dictstring);
  console.log(dictstring)

  /**
   * @dev Note that you do not need to include constructor arguments
   * for the verify task if your implementation contract only uses initializers.
   * However, if your implementation contract has an actual constructor with
   *  arguments (such as to set immutable variables), then include constructor
   *  arguments in the command
   */
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(
      verifyVoucher.address,
      [],
      "contracts/governance/VerifyVoucher.sol:VerifyVoucher"
    );
  }


};
export default deployTimeLock;
deployTimeLock.tags = ["all", "timelock"];
module.exports.dependencies = ["GovernanceToken"]; // this ensure the Token script above is executed first, so `deployments.get('Token')` succeeds
