import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import { ADDRESS_ZERO, MIN_DELAY } from "../helpers/helper-hardhat-config";

const setupContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  log(
    "------------------------- Grant / Revoke Roles ---------------------------"
  );

  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = await upgrades.deployProxy(TimeLock, [MIN_DELAY, [], []]);

  // TO-DO: multicall
  const proposer = await timeLock.PROPOSER_ROLE();
  const executor = await timeLock.EXECUTOR_ROLE();
  const admin = await timeLock.TIMELOCK_ADMIN_ROLE();

  const isProposer = await timeLock.hasRole(proposer, timeLock.address);
  const isExecutor = await timeLock.hasRole(executor, ADDRESS_ZERO);
  const isAdmin = await timeLock.hasRole(admin, timeLock.address);
  const isTimeLockAdmin = await timeLock.hasRole(admin, timeLock.address);

  log(`isProposer : ${isProposer} - ${timeLock.address}`);
  log(`isExecutor : ${isExecutor} - ${ADDRESS_ZERO}`);
  log(`isDeployerAdmin: ${isAdmin} - ${deployer}`);
  log(`isTimeLockAdmin: ${isTimeLockAdmin} - ${timeLock.address}`);
  log("Granting TimeLock ...");

  if (!isProposer) {
    const proposerTx = await timeLock.grantRole(proposer, timeLock.address);
    await proposerTx.wait(1);
  }
  if (!isExecutor) {
    const executorTx = await timeLock.grantRole(executor, ADDRESS_ZERO); // anybody can execute not only deployer
    await executorTx.wait(1);
  }
  if (isAdmin) {
    const revokeTx = await timeLock.revokeRole(admin, deployer);
    await revokeTx.wait(1);
  }

  const isProposerNew = await timeLock.hasRole(proposer, timeLock.address);
  const isExecutorNew = await timeLock.hasRole(executor, ADDRESS_ZERO);
  const isAdminNew = await timeLock.hasRole(admin, deployer);
  const isTimeLockAdminNew = await timeLock.hasRole(admin, timeLock.address);

  log(`isProposer : ${isProposerNew} - ${timeLock.address}`);
  log(`isExecutor : ${isExecutorNew} - ${ADDRESS_ZERO}`);
  log(`isDeployerAdmin: ${isAdminNew} - ${deployer}`);
  log(`isTimeLockAdmin: ${isTimeLockAdminNew} - ${timeLock.address}`);
};

export default setupContracts;
setupContracts.tags = ["all", "setup"];
