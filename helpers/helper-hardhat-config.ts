import { eEthereumNetwork } from "./types";

export interface networkConfigItem {
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
  url?: string
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: any = (networkName: string) => {
  return {
    // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
    // Default one is ETH/USD contract on Kovan
    rikenby: {
      blockConfirmations: 1,
      url: ''
    },
    goerli: {
      blockConfirmations: 5,
      url: `https://eth-${networkName}.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
    },
  }
};

export const developmentChains = ["hardhat", "localhost"];
export const proposalsFile = "proposals.json";

// Governor Values
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const QUORUM_PERCENTAGE = 10; // Require 50% of voters to pass
export const MIN_DELAY = 3600; // 1 hour
export const VOTING_PERIOD = 10; // Blocks 45818 = 1 week in live network
export const VOTING_DELAY = 1; // 1 Block - proposal vote becomes active
export const VOTING_THRESHOLD = 1; // Minimum number of votes an account must have to create a proposal.
export const NEED_RATIO = 0;

export const NEW_NEED_RATIO = 0.7;
export const FUNC = "updateNeedRatio";
export const PROPOSAL_DESCRIPTION = "Proposal #1 Changed Need_Ratio to 0.7!";

// 0 = Against, 1 = For, 2 = Abstain
export const SUPPORT = 1;
export const REASON = "my reasons!";

export const SIGNING_DOMAIN_NAME = 'SAY-DAO';
export const SIGNING_DOMAIN_VERSION = '1';
