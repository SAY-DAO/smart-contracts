import "@typechain/hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-gas-reporter";
import "dotenv/config";
import chalk from "chalk";
import "solidity-coverage";
import "hardhat-deploy";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-ethers"; // This plugins adds an ethers object to the Hardhat Runtime Environment.
import "@nomicfoundation/hardhat-toolbox";
import fs from "fs";
import { eEthereumNetwork } from "./helpers/types";
import { task } from "hardhat/config";
import { Wallet } from "ethers";
import { HardhatUserConfig } from "hardhat/config";
import { networkConfig } from "./helpers/helper-hardhat-config";

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const DEFAULT_BLOCK_GAS_LIMIT = 12450000;
const DEFAULT_GAS_PRICE = 10;

const getCommonNetworkConfig = (
  networkName: eEthereumNetwork,
  networkId: number,
) => {
  return {
    url: networkConfig(networkName).url,
    gasMultiplier: DEFAULT_GAS_PRICE,
    chainId: networkId,
    accounts: [PRIVATE_KEY],
  };
};

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      gasPrice: 8000000000,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      hardfork: "istanbul",
    },
    localhost: {
      chainId: 31337, // the hardhat node,
    },
    // rinkeby: getCommonNetworkConfig(eEthereumNetwork.rinkeby, 4),
    goerli: getCommonNetworkConfig(eEthereumNetwork.goerli, 5),
    sepolia: getCommonNetworkConfig(eEthereumNetwork.sepolia, 11155111),
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
    enabled: false,
    currency: "USD",
    outputFile: "SAY-DAO-gas-report.txt",
    noColors: false,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // the index 0 will be the deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  mocha: {
    timeout: 20000, // 200 seconds max for running tests
  },
};

const DEBUG = true;

function debug(text: string) {
  if (DEBUG) {
    console.log(text);
  }
}

task(
  "account",
  "Get balance informations for the deployment account.",
  async (_, { ethers }) => {
    const bip39 = require("bip39");
    try {
      const mnemonic = fs
        .readFileSync("./generatedMnemonic.txt")
        .toString()
        .trim();
      if (DEBUG) console.log("mnemonic", mnemonic);
      const seed = await bip39.mnemonicToSeed(mnemonic);
      if (DEBUG) console.log("seed", seed);
      const hdwallet = hdkey.fromMasterSeed(seed);
      const wallet_hdpath = "m/44'/60'/0'/0/";
      const account_index = 0;
      const fullPath = wallet_hdpath + account_index;
      if (DEBUG) console.log("fullPath", fullPath);
      const wallet = hdwallet.derivePath(fullPath).getWallet();
      const privateKey = "0x" + wallet.getPrivateKeyString();
      if (DEBUG) console.log("privateKey", privateKey);
      const EthUtil = require("ethereumjs-util");
      console.log(wallet.getPrivateKey());

      const address =
        "0x" + EthUtil.privateToAddress(wallet.getPrivateKey()).toString("hex");
      const qrcode = require("qrcode-terminal");
      qrcode.generate(address);
      console.log("‍📬 Deployer Account is " + address);
      for (const n in config.networks) {
        try {
          let url = networkConfig(n)[n].url;
          console.log(url);

          const provider = new ethers.JsonRpcProvider(url);
          const balance = await provider.getBalance(address);
          console.log(" -- " + n + " --  -- -- 📡 ");
          console.log("   balance: " + ethers.formatEther(balance));
          console.log(
            "   nonce: " + (await provider.getTransactionCount(address)),
          );
        } catch (e) {
          if (DEBUG) {
            console.log(e);
          }
        }
      }
    } catch (err) {
      console.log(`--- Looks like there is no mnemonic file created yet.`);
      console.log(`--- Please run ${chalk.blue("hh generate")} to create one`);
    }
  },
);

task("generate", "Create a mnemonic ...", async (_, { ethers }) => {
  const bip39 = require("bip39");
  const hdkey = require("ethereumjs-wallet/hdkey");
  const mnemonic = bip39.generateMnemonic();
  if (DEBUG) console.log("mnemonic", mnemonic);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  if (DEBUG) console.log("seed", seed);
  const hdwallet = hdkey.fromMasterSeed(seed);
  const wallet_hdpath = "m/44'/60'/0'/0/";
  const account_index = 0;
  const fullPath = wallet_hdpath + account_index;
  if (DEBUG) console.log("fullPath", fullPath);
  const wallet = hdwallet.derivePath(fullPath).getWallet();
  const privateKey = "0x" + wallet._privKey.toString("hex");
  if (DEBUG) console.log("privateKey", privateKey);
  const EthUtil = require("ethereumjs-util");
  const address =
    "0x" + EthUtil.privateToAddress(wallet._privKey).toString("hex");
  console.log(
    "👝 Account Generated as " +
      address +
      " and set as mnemonic in packages/hardhat",
  );

  fs.writeFileSync("./generatedMnemonic.txt", mnemonic.toString());
});

export default config;
