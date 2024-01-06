import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helpers/helper-functions";
import {
  developmentChains,
  networkConfig,
} from "../helpers/helper-hardhat-config";
import { getNamedAccounts } from "hardhat";
import fs from "fs";
import { checkIfFileOrDirectoryExists, deleteFile } from "../helpers/file";

const deployVerifyVoucher: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, network } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log(
    "------------------------- VerifyVoucher Deployment ---------------------------"
  );
  const verifyVoucher = await deploy("VerifyVoucher", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig(network.name).blockConfirmations || 1,
  });

  log(`VerifyVoucher deployed at: ${verifyVoucher.address}`);

  let data = {
    verifyVoucher: verifyVoucher.address,
  };

  if (!checkIfFileOrDirectoryExists("network-settings.json")) {
    fs.appendFile(
      "network-settings.json",
      JSON.stringify({ [network.name]: data }),
      function (err) {
        if (err) {
          // append failed
        } else {
          // done
        }
      }
    );
  }

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
      "contracts/needModule/VerifyVoucher.sol:VerifyVoucher"
    );
  }
};
export default deployVerifyVoucher;
deployVerifyVoucher.tags = ["all", "verifyVoucher"];
module.exports.dependencies = ["GovernanceToken"]; // this ensure the Token script above is executed first, so `deployments.get('Token')` succeeds
