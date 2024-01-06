import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, getNamedAccounts, upgrades } from "hardhat";
import {
  ADDRESS_ZERO,
  developmentChains,
  networkConfig,
} from "../helpers/helper-hardhat-config";
import verify from "../helpers/helper-functions";


const delegate = async (governanceTokenAddress: string, delegatee: string) => {
  const governanceToken = await ethers.getContractAt(
    "GovernanceToken",
    governanceTokenAddress
  );
  
  const tx = await governanceToken.delegate(delegatee);
  await tx.wait(1);
  console.log(
    `Checkpoints: ${await governanceToken.numCheckpoints(delegatee)}`
  );
};

// Deployment
const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  //   from hardhat-config
  const { deployments, network } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log(
    "------------------------- GovernanceToken Deployment ---------------------------",
  );
    const blockNumBefore = await ethers.provider.getBlockNumber();
    log(`BlockNumBefore: ${blockNumBefore}`);

    const governanceToken = await deploy("GovernanceToken", {
      from: deployer,
      args: [],
      log: true,
      // we need to wait if on a live network so we can verify properly
      waitConfirmations: networkConfig(network.name).blockConfirmations || 1,
    });

    log(`1 - GovernanceToken deployed at: ${governanceToken.address}`);

    if (
      !developmentChains.includes(network.name) &&
      process.env.ETHERSCAN_API_KEY
    ) {
      await verify(
        governanceToken.address,
        [],
        "contracts/governance/GovernanceToken.sol:GovernanceToken"
      );
    }

    const blockNumAfter = await ethers.provider.getBlockNumber();
    console.log(`BlockNumAfter: ${blockNumAfter}`);

    log(
      `---------- Delegating to ${deployer} -------------`
    );

    await delegate(governanceToken.address, deployer);
    log("Delegated!");

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
