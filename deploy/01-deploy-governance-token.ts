import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import verify from "../helper-functions";
import { networkConfig, developmentChains } from "../app/src/helpers/helper-hardhat-config";

// CheckPoint
const checkPoint = async (
  governanceTokenAddress: string,
  delegatedAccount: string
) => {
  const governanceToken = await ethers.getContractAt(
    "GovernanceToken",
    governanceTokenAddress
  );
  console.log(
    `Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`
  );
};

// Delegate
const delegate = async (
  governanceTokenAddress: string,
  delegatedAccount: string
) => {
  const governanceToken = await ethers.getContractAt(
    "GovernanceToken",
    governanceTokenAddress
  );
  const tx = await governanceToken.delegate(delegatedAccount);
  await tx.wait(1); // 1 block wait
  console.log("Delegated!");
  await checkPoint(governanceTokenAddress, delegatedAccount);
};

// Deployment
const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // from hardhat-config
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log(
    "------------------------- GovernanceToken Deployment ---------------------------"
  );
  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    args: [],
    log: true,
    // number of the confirmations to wait after the transactions is included in the chain
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  log(`GovernanceToken deployed at: ${governanceToken.address}`);
  await checkPoint(governanceToken.address, deployer);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(
      governanceToken.address,
      [],
      "contracts/GovernanceToken.sol:GovernanceToken"
    );
  }
  log("------------------------- Delegation ---------------------------");
  log(`Delegating to deployer: ${deployer}`);
  await delegate(governanceToken.address, deployer);
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ["all", "governor"];
