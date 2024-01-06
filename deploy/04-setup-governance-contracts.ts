import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import { ADDRESS_ZERO, MIN_DELAY } from "../helpers/helper-hardhat-config";
import fs from "fs";

const setupContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  log(
    "------------------------- Grant / Revoke Roles ---------------------------"
  );
  let { governor: governorAddress, timeLock: timeLockAddress } = JSON.parse(fs.readFileSync("./network-settings.json", 'utf8'));
  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = TimeLock.attach(timeLockAddress)

  // TO-DO: multicall
  log("\n");
  log("Current roles ...");
  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.DEFAULT_ADMIN_ROLE();

  const isGovernorProposer = await timeLock.hasRole(proposerRole, governorAddress);
  const isAllExecutor = await timeLock.hasRole(executorRole, ADDRESS_ZERO);
  const isDeployerAdmin = await timeLock.hasRole(adminRole, deployer);

  log(`isGovernorProposer : ${isGovernorProposer} - ${governorAddress}`);
  log(`isAllExecutor : ${isAllExecutor} - ${ADDRESS_ZERO}`);
  log(`isDeployerAdmin: ${isDeployerAdmin} - ${deployer}`);

  log("\n");
  log("Granting TimeLock ...");
  if (!isGovernorProposer) {
    const proposerTx = await timeLock.grantRole(proposerRole, governorAddress);
    await proposerTx.wait(1);
  }
  if (!isAllExecutor) {
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO); // anybody can execute not only deployer
    await executorTx.wait(1);
  }
    const revokeTx = await timeLock.revokeRole(adminRole, deployer);
    await revokeTx.wait(1);

  const isGovernorProposerNew = await timeLock.hasRole(proposerRole, governorAddress);
  const isExecutorNew = await timeLock.hasRole(executorRole, ADDRESS_ZERO);
  const isDeployerAdminNew = await timeLock.hasRole(adminRole, deployer);
  const isTimeLockAdmin = await timeLock.hasRole(adminRole, timeLockAddress);

  log(`isGovernorProposer : ${isGovernorProposerNew} - ${governorAddress}`);
  log(`isAllExecutor : ${isExecutorNew} - ${ADDRESS_ZERO}`);
  log(`isDeployerAdmin: ${isDeployerAdminNew} - ${deployer}`);
  log(`isTimeLockAdmin: ${isTimeLockAdmin} - ${timeLockAddress}`);
};

export default setupContracts;
setupContracts.tags = ["all", "setup"];
