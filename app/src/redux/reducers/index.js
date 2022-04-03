import { combineReducers } from "redux";

import { proposalReducer, voteReducer } from "./governanceReducer";

export default combineReducers({
  theProposal: proposalReducer,
  theVote: voteReducer,
});
