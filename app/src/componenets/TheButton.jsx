import Button from "@mui/material/Button";
import { useDispatch } from "react-redux";
import { makeProposal } from "../redux/actions/governanceAction";

function TheButton() {
  const dispatch = useDispatch();

  const handlePropose = () => {
    console.log("now");
    dispatch(makeProposal());
  };
  return (
    <Button onClick={handlePropose} variant="contained">
      Propose
    </Button>
  );
}

export default TheButton;
