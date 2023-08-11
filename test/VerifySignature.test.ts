import { ethers } from "hardhat";
import { use, expect } from "chai";
import Voucher from "../scripts/Voucher";
import { ADDRESS_ZERO } from "../helpers/helper-hardhat-config";
import need from "../helpers/needExample.json";
import { Contract } from "ethers";

async function deployLockFixture() {
  const [owner, familyMember, sayAdmin] = await ethers.getSigners();
  const VerifyFactory = await ethers.getContractFactory("VerifyVoucher");
  const verifyVoucherContract = await VerifyFactory.deploy();
  await verifyVoucherContract.waitForDeployment();
  const huh = await verifyVoucherContract.getChainID();

  return {
    sayAdmin,
    owner,
    familyMember,
    verifyVoucherContract,
  };
}

async function signSocialWorkerTransaction(verifyVoucher: Contract) {
  // Contracts are deployed using the first signer/account by default
  const [owner] = await ethers.getSigners();
  const voucher = new Voucher();
  const { ...swVoucher } = await voucher.signSwTransaction({
    need,
    signer: owner,
    contract: verifyVoucher,
  });
  return {
    swVoucher,
  };
}

async function signFamilyTransaction(verifyVoucher: Contract) {
  // Contracts are deployed using the first signer/account by default
  const [owner] = await ethers.getSigners();
  const voucher = new Voucher();
  const { ...vfVoucher } = await voucher.signVFamilyTransaction({
    need,
    signer: owner,
    contract: verifyVoucher,
  });
  return {
    vfVoucher,
  };
}

describe("Deployment", function () {
  it("Should voucher verifier contract", async function () {
    const { verifyVoucherContract } = await deployLockFixture();
    expect(verifyVoucherContract.address).is.not.equal(ADDRESS_ZERO);
  });

  it("Should use signature to mint token for all contributors", async function () {
    const [owner] = await ethers.getSigners();
    // deploy
    const { verifyVoucherContract } = await deployLockFixture();

    // 1- social worker 
    const { swVoucher } = await signSocialWorkerTransaction(
      verifyVoucherContract,
    );

    const signer = await verifyVoucherContract._verify(swVoucher);
    expect(signer).is.equal(swVoucher.signer);

    
  });
});
