import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY,
  VOTING_THRESHOLD,
  MIN_DELAY,
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

  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await upgrades.deployProxy(GovernanceToken, [
    verifyVoucher.address,
  ]);
  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = await upgrades.deployProxy(TimeLock, [MIN_DELAY, [], []]);
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

  log(`GovernorContract deployed at: ${governorContract.address}`);
};

export default deployGovernorContract;
deployGovernorContract.tags = ["all", "governor"];
