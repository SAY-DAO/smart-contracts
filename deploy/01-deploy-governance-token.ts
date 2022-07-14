import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import verify from "../helper-functions";
import {
  networkConfig,
  developmentChains,
} from "../app/src/helpers/helper-hardhat-config";

// Delegate
// const delegate = async (
//   governanceTokenAddress: string,
//   delegatedAccount: string
// ) => {
//   const familyToken = await ethers.getContractAt(
//     "FamilyToken",
//     governanceTokenAddress
//   );
//   const tx = await familyToken.delegate(delegatedAccount);
//   await tx.wait(1); // 1 block wait
//   console.log("Delegated!");
// };

// Deployment
const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // from hardhat-config
  const { getNamedAccounts, deployments, network } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  log(
    "------------------------- GovernanceToken Deployment ---------------------------"
  );
  const VerifyVoucher = await ethers.getContractFactory("VerifyVoucher");
  const verifyVoucher = await upgrades.deployProxy(VerifyVoucher, []);

  const FamilyToken = await ethers.getContractFactory("FamilyToken");
  const familyToken = await upgrades.deployProxy(FamilyToken, [
    verifyVoucher.address,
  ]);

  log(`FamilyToken deployed at: ${familyToken.address}`);
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
  // log("------------------------- Delegation ---------------------------");
  // log(`Delegating to deployer: ${deployer}`);
  // await delegate(familyToken.address, deployer);
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ["all", "governor"];
