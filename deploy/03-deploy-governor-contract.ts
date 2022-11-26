import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY,
  VOTING_THRESHOLD,
  MIN_DELAY,
  ADDRESS_ZERO,
} from "../helpers/helper-hardhat-config";
import { ethers, upgrades } from "hardhat";

const deployGovernorContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments } = hre;
  const { log } = deployments;

  log(
    "------------------------- GovernorContract Deployment ---------------------------"
  );
  const VerifyVoucher = await ethers.getContractFactory("VerifyVoucher");
  const verifyVoucher = await upgrades.deployProxy(VerifyVoucher, []);
  await verifyVoucher.deployed();
  await verifyVoucher.wait;

  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await upgrades.deployProxy(GovernanceToken, [
    ADDRESS_ZERO,
    verifyVoucher.address,
  ]);
  await governanceToken.deployed();
  await governanceToken.wait;

  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = await upgrades.deployProxy(TimeLock, [MIN_DELAY, [], []]);
  await timeLock.deployed();
  await timeLock.wait;
  
  log("Deploying GovernorContract ...");
  const GovernorContract = await ethers.getContractFactory("GovernorContract");
  const governorContract = await upgrades.deployProxy(GovernorContract, [
    governanceToken.address,
    timeLock.address,
    VOTING_DELAY,
    VOTING_PERIOD,
    VOTING_THRESHOLD,
    QUORUM_PERCENTAGE,
  ]);
  await governorContract.deployed();
  await governorContract.wait;

  log(`GovernorContract deployed at: ${governorContract.address}`);
  const blockNumBefore = await ethers.provider.getBlockNumber();
  log(`BlockNumBeforeat: ${blockNumBefore}`);
};

export default deployGovernorContract;
deployGovernorContract.tags = ["all", "governor"];
