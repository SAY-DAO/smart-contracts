import { run } from "hardhat";

const verify = async (
  contractAddress: string,
  args: any[],
  contractPath: string
) => {
  // verify the source code for your Solidity contracts
  console.log("hardhat-etherscan :  Verifying contract ...");
  try {
    console.log(contractAddress, args, contractPath)
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
      contract: contractPath,
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
