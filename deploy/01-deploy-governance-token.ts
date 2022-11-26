import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import {
  ADDRESS_ZERO,
  developmentChains,
} from "../helpers/helper-hardhat-config";
import verify from "../helpers/helper-functions";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";

// Deployment
const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // from hardhat-config
  const { deployments, network } = hre;
  const { log } = deployments;
  log(
    "------------------------- GovernanceToken Deployment ---------------------------"
  );
  const VerifyVoucher = await ethers.getContractFactory("VerifyVoucher");
  const verifyVoucher = await upgrades.deployProxy(VerifyVoucher, []);
  await verifyVoucher.deployed();
  await verifyVoucher.wait;
  log(`VerifyVoucher deployed at: ${verifyVoucher.address}`);

  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await upgrades.deployProxy(GovernanceToken, [
    ADDRESS_ZERO,
    verifyVoucher.address,
  ]);
  await governanceToken.deployed();
  await governanceToken.wait;

  console.log("2");

  log(`GovernanceToken deployed at: ${governanceToken.address}`);
  const blockNumBefore = await ethers.provider.getBlockNumber();
  log(`BlockNumBeforeat: ${blockNumBefore}`);

  const currentImplAddress = await getImplementationAddress(
    ethers.provider,
    governanceToken.address
  );

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
      currentImplAddress,
      [],
      "contracts/tokens/ERC721/GovernanceToken.sol:GovernanceToken"
    );
  }
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ["all", "GovernanceToken"];
