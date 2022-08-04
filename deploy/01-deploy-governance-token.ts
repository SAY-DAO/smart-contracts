import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import verify from "../helpers/helper-functions";
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

  const FamilyToken = await ethers.getContractFactory("FamilyToken");
  const familyToken = await upgrades.deployProxy(FamilyToken, [
    verifyVoucher.address,
  ]);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(
      familyToken.address,
      [],
      "contracts/FamilyToken.sol:FamilyToken"
    );
  }
  log(`FamilyToken deployed at: ${familyToken.address}`);
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ["all", "FamilyToken"];
