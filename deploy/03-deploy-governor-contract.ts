import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY,
  VOTING_THRESHOLD,
  MIN_DELAY,
  ADDRESS_ZERO,
  developmentChains,
  networkConfig,
} from "../helpers/helper-hardhat-config";
import { ethers, getNamedAccounts, upgrades } from "hardhat";
import verify from "../helpers/helper-functions";
import fs from "fs";

const deployGovernorContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await getNamedAccounts()
  const { deployments, network } = hre;
  const { log, deploy } = deployments;

  log(
    "------------------------- GovernorContract Deployment ---------------------------"
  );
  log("Deploying GovernanceToken ...");
  const governanceToken = await deploy('GovernanceToken', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig(network.name).blockConfirmations || 1,
  })

  log("Deploying GovernorContract ...");
  const { timeLock } = JSON.parse(fs.readFileSync("./network-settings.json", 'utf8'));
  const governorContract = await deploy('GovernorContract', {
    from: deployer,
    args: [
      governanceToken.address,
      timeLock,
      VOTING_DELAY,
      VOTING_PERIOD,
      VOTING_THRESHOLD,
      QUORUM_PERCENTAGE,
    ],
    log: true,
    waitConfirmations: networkConfig(network.name).blockConfirmations || 1,
  })

  const stringFile = fs.readFileSync("network-settings.json", "utf8");
  const file = JSON.parse(stringFile);

  if (typeof(file.verifyVoucher) !== 'string' || typeof(file.governor) !== 'string') {
    let data = {
      governor: governorContract.address,
      timeLock: file.timeLock,
      verifyVoucher: file.verifyVoucher,
    };
    let dictstring = JSON.stringify(data);
    fs.writeFileSync("network-settings.json", dictstring);
  }
  log(`GovernorContract deployed at: ${governorContract.address}`);
  const blockNumBefore = await ethers.provider.getBlockNumber();
  log(`BlockNumBefore: ${blockNumBefore}`);
};

export default deployGovernorContract;
deployGovernorContract.tags = ["all", "governor"];
