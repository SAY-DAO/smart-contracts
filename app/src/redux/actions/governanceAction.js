import { ethers } from "ethers";
import {
  VOTE_REQUEST,
  VOTE_SUCCESS,
  VOTE_FAIL,
} from "../constants/governanceConstants";
import GovernorArtifact from "../../build/artifacts/contracts/standards/GovernorContract.sol/GovernorContract.json";
import TreasuryArtifact from "../../build/artifacts/contracts/Treasury.sol/Treasury.json";

export const makeProposal =
  (functionToCall, args, proposalDescription) => async (dispatch) => {
    try {
      dispatch({ type: VOTE_REQUEST });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.getNetwork();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const governorFactory = new ethers.ContractFactory(
        GovernorArtifact.abi,
        GovernorArtifact.bytecode,
        provider.getSigner(0)
      );

      const TreasuryFactory = new ethers.ContractFactory(
        TreasuryArtifact.abi,
        TreasuryArtifact.bytecode,
        provider.getSigner(0)
      );


      const encodedFunctionCall = TreasuryFactory.interface.encodeFunctionData(functionToCall, args)

      console.log(governorFactory);

      const { chainId } = await provider.getNetwork();

      console.log(`chain Id here: ${chainId}`);
      console.log(
        `Proposing ${functionToCall} on ${governorFactory.address} with ${newValue}`
      );
      console.log(`Proposal Description:\n  ${proposalDescription}`);

      dispatch({
        type: VOTE_SUCCESS,
        payload: "data",
      });
    } catch (e) {
      dispatch({
        type: VOTE_FAIL,
        payload: e.response && e.response.status ? e.response : e.message,
      });
    }
  };

//   const governor = await ethers.getContractAt("GovernorContract")


//   const proposeTx = await governor.propose(
//     [box.address],
//     [0],
//     [encodedFunctionCall],
//     proposalDescription
//   )
//   // If working on a development chain, we will push forward till we get to the voting period.
//   if (developmentChains.includes(network.name)) {
//     await moveBlocks(VOTING_DELAY + 1)
//   }
//   const proposeReceipt = await proposeTx.wait(1)
//   const proposalId = proposeReceipt.events[0].args.proposalId
//   console.log(`Proposed with proposal ID:\n  ${proposalId}`)

//   const proposalState = await governor.state(proposalId)
//   const proposalSnapShot = await governor.proposalSnapshot(proposalId)
//   const proposalDeadline = await governor.proposalDeadline(proposalId)
//   // save the proposalId
//   let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
//   proposals[network.config.chainId!.toString()].push(proposalId.toString())
//   fs.writeFileSync(proposalsFile, JSON.stringify(proposals))

//   // The state of the proposal. 1 is not passed. 0 is passed.
//   console.log(`Current Proposal State: ${proposalState}`)
//   // What block # the proposal was snapshot
//   console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
//   // The block number the proposal voting expires
//   console.log(`Current Proposal Deadline: ${proposalDeadline}`)
// }

// propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error)
//     process.exit(1)
//   })
