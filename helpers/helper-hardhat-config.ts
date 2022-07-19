export interface networkConfigItem {
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
  // Default one is ETH/USD contract on Kovan
  rinkeby: {
    blockConfirmations: 3,
  },
};

export const developmentChains = ["hardhat", "localhost"];
export const proposalsFile = "proposals.json";

// Governor Values
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const QUORUM_PERCENTAGE = 70; // Require 50% of voters to pass
export const MIN_DELAY = 3600; // 1 hour
export const VOTING_PERIOD = 10; // Blocks 45818 = 1 week in live network
export const VOTING_DELAY = 1; // 1 Block - proposal vote becomes active
export const VOTING_THRESHOLD = 1; // Minimum number of votes an account must have to create a proposal.
export const NEED_RATIO = "0.5";

export const NEW_NEED_RATIO = "0.7";
export const FUNC = "updateNeedRatio";
export const PROPOSAL_DESCRIPTION = "Proposal #1 Changed Need_Ratio to 0.7!";
