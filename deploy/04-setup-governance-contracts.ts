import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ADDRESS_ZERO } from "../app/src/helpers/helper-hardhat-config";
import { ethers, upgrades } from "hardhat";

const setupContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;
  const {  log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const timeLockAddress = (await get("TimeLock")).address;
  const timeLock = await ethers.getContractAt("TimeLock", timeLockAddress);
  //   const governor = await ethers.getContract("GovernorContract", deployer);
    const mamad = await upgrades.admin.getInstance();
    console.log(mamad)

  log(
    "------------------------- Grant / Revoke Roles ---------------------------"
  );
  // TO-DO: multicall
  const proposer = await timeLock.PROPOSER_ROLE();
  const executor = await timeLock.EXECUTOR_ROLE();
  const admin = await timeLock.TIMELOCK_ADMIN_ROLE();

  const isProposer = await timeLock.hasRole(proposer, mamad.address);
  const isExecutor = await timeLock.hasRole(executor, ADDRESS_ZERO);
  const isAdmin = await timeLock.hasRole(admin, deployer);

  log(`isProposer : ${isProposer} - ${mamad.address}`);
  log(`isExecutor : ${isExecutor} - ${ADDRESS_ZERO}`);
  log(`isAdmin: ${isAdmin} - ${deployer}`);

  if (!isProposer) {
    const proposerTx = await timeLock.grantRole(proposer, mamad.address);
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

  const isProposerNew = await timeLock.hasRole(proposer, mamad.address);
  const isExecutorNew = await timeLock.hasRole(executor, ADDRESS_ZERO);
  const isAdminNew = await timeLock.hasRole(admin, deployer);

  log(`isProposer : ${isProposerNew} - ${mamad.address}`);
  log(`isExecutor : ${isExecutorNew} - ${ADDRESS_ZERO}`);
  log(`isAdmin: ${isAdminNew} - ${deployer}`);
};

export default setupContracts;
setupContracts.tags = ["all", "setup"];
