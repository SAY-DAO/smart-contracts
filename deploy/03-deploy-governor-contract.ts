import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  networkConfig,
  developmentChains,
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY,
  VOTING_THRESHOLD,
} from "../app/src/helpers/helper-hardhat-config";
import { getImplementationAddress } from '@openzeppelin/upgrades-core';

const deployGovernorContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const timeLock = await get("TimeLock");
//   const FamilyToken = await get("FamilyToken");

  log(
    "------------------------- GovernorContract Deployment ---------------------------"
  );
    log("Deploying GovernorContract ...");
    const governorContract = await deploy("GovernorContract", {
      from: deployer,
      args: [
        governanceToken.address,
        timeLock.address,
        VOTING_DELAY,
        VOTING_PERIOD,
        VOTING_THRESHOLD,
        QUORUM_PERCENTAGE,
      ],
      log: true,
      // we need to wait if on a live network so we can verify properly
      waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    });
  //   log(`GovernorContract at ${governorContract.address}`);
  //   if (
  //     !developmentChains.includes(network.name) &&
  //     process.env.ETHERSCAN_API_KEY
  //   ) {
  //     await verify(
  //       governorContract.address,
  //       [
  //         governanceToken.address,
  //         timeLock.address,
  //         VOTING_DELAY,
  //         VOTING_PERIOD,
  //         VOTING_THRESHOLD,
  //         QUORUM_PERCENTAGE,
  //       ],
  //       "contracts/standards/GovernorContract.sol:GovernorContract"
  //     );
  //   }
};

export default deployGovernorContract;
deployGovernorContract.tags = ["all", "governor"];
