// import { upgrades, ethers } from "hardhat";
// import { expect } from "chai";
// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import Voucher from "../scripts/Voucher";

// async function deployTokenFixture() {
//   // Contracts are deployed using the first signer/account by default
//   const [owner, familyMember, friend] = await ethers.getSigners();
//   const VerifyVoucher = await ethers.getContractFactory("VerifyVoucher");
//   const verifyVoucher = await upgrades.deployProxy(VerifyVoucher, []);

//   const TheNeed = await ethers.getContractFactory("TheNeed");
//   const theNeed = await upgrades.deployProxy(TheNeed, []);

//   const FamilyToken = await ethers.getContractFactory("FamilyToken");
//   const familyToken = await upgrades.deployProxy(FamilyToken, [
//     verifyVoucher.address,
//   ]);

//   const friendContract = familyToken.connect(friend);
//   const mintValue = ethers.utils.parseUnits("0.054", "ether");
//   const voucher = new Voucher();
//   const { ...theVoucher } = await voucher.signTransaction({
//     needId: 13,
//     mintValue: mintValue,
//     tokenUri: "nothing",
//     signer: familyMember,
//     contract: verifyVoucher,
//   });

//   return {
//     familyToken,
//     friendContract,
//     theNeed,
//     verifyVoucher,
//     owner,
//     familyMember,
//     friend,
//     mintValue,
//     theVoucher,
//   };
// }

// async function deployLockFixture() {
//   // const TimeLock = await ethers.getContractFactory("TimeLock");
//   // const timeLock = await upgrades.deployProxy(TimeLock, []);
//   // return { timeLock };
// }

// describe("Deployment", function () {
//   it("Should upgrade the NFT family tokens", async function () {
//     const { familyToken, theNeed, verifyVoucher, mintValue, theVoucher } =
//       await loadFixture(deployTokenFixture);

//     const FamilyTokenV2 = await ethers.getContractFactory("FamilyTokenV2");
//     const familyTokenV2 = await upgrades.upgradeProxy(
//       familyToken,
//       FamilyTokenV2
//     );

//     expect(await familyTokenV2.voucherAddress()).to.equal(
//       verifyVoucher.address
//     );

//     await familyTokenV2.setVoucherVerifier(
//       "0x0000000000000000000000000000000000000001"
//     );

//     expect(await familyToken.voucherAddress()).to.equal(
//       "0x0000000000000000000000000000000000000001"
//     );

//     expect(await familyTokenV2.version()).to.equal("v2");
//   });

//   it("Should mint a voucher and mint 2 gSay", async function () {
//     const {
//       familyToken,
//       friendContract,
//       theNeed,
//       verifyVoucher,
//       familyMember,
//       friend,
//       mintValue,
//       theVoucher,
//     } = await loadFixture(deployTokenFixture);

//     // // before mint set the voucher contract
//     // await familyToken.setVoucherVerifier(verifyVoucher.address);

//     expect(
//       await friendContract.safeMint(13, theNeed.address, theVoucher, {
//         value: mintValue,
//       })
//     )
//       .to.emit(familyToken, "Minted") // transfer from null address to minter
//       .withArgs(theVoucher.needId, 1, 2, familyMember.address, friend.address); // transfer from minter to redeemer
//     expect(await familyToken.ownerOf(1)).to.equal(familyMember.address);
//     expect(await familyToken.ownerOf(2)).to.equal(friend.address);

//     // Delegate
//     const delegate = async (
//       governanceTokenAddress: string,
//       delegatedAccount: string
//     ) => {
//       const familyToken = await ethers.getContractAt(
//         "FamilyToken",
//         governanceTokenAddress
//       );
//       const tx = await familyToken.delegate(delegatedAccount);
//       await tx.wait(1); // 1 block wait
//       console.log("Delegated!");
//       console.log(
//         `Checkpoints: ${await familyToken.getVotes(delegatedAccount)}`
//       );
//       return tx;
//     };

//     await familyToken.safeMint();
//     log("------------------------- Delegation ---------------------------");
//     log(`Delegating to deployer: ${deployer}`);
//     await delegate(familyToken.address, deployer);
//   });
// });
