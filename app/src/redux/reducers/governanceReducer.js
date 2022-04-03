import {
  VOTE_REQUEST,
  VOTE_SUCCESS,
  VOTE_FAIL,
  PROPOSE_REQUEST,
  PROPOSE_SUCCESS,
  PROPOSE_FAIL,
} from "../constants/governanceConstants";

export const proposalReducer = (state = { success: false }, action) => {
  switch (action.type) {
    case PROPOSE_REQUEST:
      return { loading: true };
    case PROPOSE_SUCCESS:
      return { loading: false, success: true, proposal: action.payload };
    case PROPOSE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const voteReducer = (state = { vote: {}, success: false }, action) => {
  switch (action.type) {
    case VOTE_REQUEST:
      return { loading: true, success: false };
    case VOTE_SUCCESS:
      return {
        loading: false,
        success: true,
        vote: action.payload,
      };
    case VOTE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
