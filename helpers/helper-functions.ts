import { run } from "hardhat";

const verify = async (
  contractAddress: string,
  args: any[],
  ContractPath: string
) => {
  // verify the source code for your Solidity contracts
  console.log("hardhat-etherscan :  Verifying contract ...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
      contract: ContractPath,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
};

export default verify;
