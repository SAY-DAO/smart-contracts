import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import verify from "../helper-functions";
import { developmentChains } from "../helpers/helper-hardhat-config";

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

  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await upgrades.deployProxy(GovernanceToken, [
    verifyVoucher.address,
  ]);

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
  log(`GovernanceToken deployed at: ${governanceToken.address}`);
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ["all", "GovernanceToken"];
