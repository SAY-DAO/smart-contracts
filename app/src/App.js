import React from "react";
// import { Route, Switch, BrowserRouter } from "react-router";
import { BrowserRouter } from "react-router-dom";
import TheButton from "./componenets/TheButton";
import { Container, CssBaseline } from "@mui/material";
function App() {
  return (
    <div id="direction" dir="">
      <BrowserRouter>
        <CssBaseline />
        <Container
          sx={{
            margin: "auto",
            paddingLeft: "0px !important",
            paddingRight: "0px !important",
            paddingBottom: 10,
          }}
          maxWidth="lg"
        >
          <React.StrictMode>
              <TheButton />
          </React.StrictMode>
        </Container>
      </BrowserRouter>
    </div>
  );
}

export default App;
