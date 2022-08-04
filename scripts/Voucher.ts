import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";

const SIGNING_DOMAIN_NAME = "SAY-DAO";
const SIGNING_DOMAIN_VERSION = "1";

interface DomainData {
  name: string;
  version: string;
  verifyingContract: string;
  chainId: BigNumber;
}

class Voucher {
  constructor() {}

  async designDomain(contract: Contract) {
    let domainData: DomainData;

    const chainId = await contract.getChainID();
    domainData = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: contract.address,
      chainId,
    };
    return domainData;
  }

  async signTransaction({
    needId,
    mintValue,
    tokenUri,
    contract,
    signer,
  }: {
    needId: number;
    mintValue: BigNumber;
    tokenUri: string;
    contract: Contract;
    signer: SignerWithAddress;
  }) {
    const domain = await this.designDomain(contract);
    // define your data types
    const types = {
      Voucher: [
        { name: "needId", type: "uint256" },
        { name: "mintValue", type: "uint256" },
        { name: "tokenUri", type: "string" },
        { name: "content", type: "string" },
      ],
    };

    const voucher = {
      needId,
      mintValue,
      tokenUri,
      content: "You are authorizing this need to be minted by a friend!",
    };

    const signature = await signer._signTypedData(domain, types, voucher);
    return {
      ...voucher,
      signature,
    };
  }
}

export default Voucher;
