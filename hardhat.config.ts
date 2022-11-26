import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "dotenv/config";
import "solidity-coverage";
import "hardhat-deploy";
import "@openzeppelin/hardhat-upgrades";
import { eEthereumNetwork } from "./helpers/types";

import { HardhatUserConfig } from "hardhat/config";

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
const ALCHEMY_KEY = process.env.ALCHEMY_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const DEFAULT_BLOCK_GAS_LIMIT = 12450000;
const DEFAULT_GAS_PRICE = 10;
const HARDFORK = "istanbul";

const getCommonNetworkConfig = (
  networkName: eEthereumNetwork,
  networkId: number
) => {
  return {
    url: `https://eth-${networkName}.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    hardfork: HARDFORK,
    blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
    gasMultiplier: DEFAULT_GAS_PRICE,
    chainId: networkId,
    accounts: [PRIVATE_KEY],
  };
};

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      gasPrice: 8000000000,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
    },
    localhost: {
      chainId: 31337, // the hardhat node
    },
    rinkeby: getCommonNetworkConfig(eEthereumNetwork.rinkeby, 4),
    goerli: getCommonNetworkConfig(eEthereumNetwork.goerli, 5),
  },
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
      {
        version: "0.8.2",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // the index 0 will be the deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  mocha: {
    timeout: 2000, // 200 seconds max for running tests
  },
};

export default config;
