import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, getNamedAccounts, upgrades } from "hardhat";
import {
  ADDRESS_ZERO,
  developmentChains,
  networkConfig,
} from "../helpers/helper-hardhat-config";
import verify from "../helpers/helper-functions";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";

/**
 * @dev Delegate votes from the sender to `delegatee`.
 */
const delegate = async (governanceTokenAddress: string, delegatee: string) => {
  const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress)
  const transactionResponse = await governanceToken.delegate(delegatee)
  await transactionResponse.wait(1)
  console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatee)}`)
}

// Deployment
const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // from hardhat-config
  const { deployments, network } = hre;
  const { deployer } = await getNamedAccounts()
  const { deploy, log } = deployments;
  log(
    "------------------------- 1- VerifyVoucher Deployment ---------------------------"
  );
  const VerifyVoucher = await ethers.getContractFactory("VerifyVoucher");
  const verifyVoucher = await upgrades.deployProxy(VerifyVoucher, []);
  await verifyVoucher.deployed();
  await verifyVoucher.wait;
  log(`VerifyVoucher deployed at: ${verifyVoucher.address}`);


  const currentImplAddress = await getImplementationAddress(
    ethers.provider,
    verifyVoucher.address
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
      "contracts/governance/VerifyVoucher.sol:VerifyVoucher"
    );
  }

  log(
    "------------------------- 2- GovernanceToken Deployment ---------------------------"
  );


  const blockNumBefore = await ethers.provider.getBlockNumber();
  log(`BlockNumBefore: ${blockNumBefore}`);

  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    args: [],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })
  log(`GovernanceToken deployed at: ${governanceToken.address}`);

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(governanceToken.address, [], "contracts/tokens/ERC721/GovernanceToken.sol:GovernanceToken")
  }

  const blockNumAfter = await ethers.provider.getBlockNumber();
  console.log(`BlockNumAfter: ${blockNumAfter}`);

  log(
    `------------------------- 2- 3- Delegating to ${deployer} ---------------------------`
  );

  await delegate(governanceToken.address, deployer)
  log("Delegated!")




  /**
   * @dev Note that for proxies you do not need to include constructor arguments
   * for the verify task if your implementation contract only uses initializers.
   * However, if your implementation contract has an actual constructor with
   *  arguments (such as to set immutable variables), then include constructor
   *  arguments in your code.
   */
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ["all", "governanceToken"];
