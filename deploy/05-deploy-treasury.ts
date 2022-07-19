import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  developmentChains,
  NEED_RATIO,
  MIN_DELAY,
} from "../helpers/helper-hardhat-config";
import { ethers, upgrades } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";

const deployTreasury: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { deployments, network } = hre;
  const { log } = deployments;

  log(
    "------------------------- Treasury Deployment ---------------------------"
  );
  log("Deploying Treasury ...");

  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = await upgrades.deployProxy(TimeLock, [MIN_DELAY, [], []]);

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await upgrades.deployProxy(Treasury, [
    timeLock.address,
    NEED_RATIO,
  ]);

  log(`Treasury deployed at at ${treasury.address}`);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(
      treasury.address,
      [NEED_RATIO],
      "contracts/Treasury.sol:Treasury"
    );
  }
  const treasuryContract = await ethers.getContractAt(
    "Treasury",
    treasury.address
  );

  const TIME_LOCK_ROLE = keccak256(toUtf8Bytes("TIME_LOCK_ROLE"));
  const isTimeLockOwner = await treasuryContract.hasRole(
    TIME_LOCK_ROLE,
    timeLock.address
  );
  if (!isTimeLockOwner) {
    const transferTx = await treasuryContract.grantRole(
      TIME_LOCK_ROLE,
      timeLock.address
    );
    log(`Transfered ownership`);
    log(transferTx);

    await transferTx.wait(1);
  }
  log(`Treasury NOW is owned and governed by TimeLock: ${timeLock.address}`);
};

export default deployTreasury;
deployTreasury.tags = ["all", "treasury"];
