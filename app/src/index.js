import React, { Suspense } from "react";
import App from "./App";
import * as ReactDOMClient from "react-dom/client";
import { CircularProgress } from "@mui/material";
import { Router } from "react-router";
import { Provider } from "react-redux";
import history from "./history";
import store from "../src/redux/store";

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

const loadingMarkup = <CircularProgress />;
root.render(
  <Suspense fallback={loadingMarkup}>
    <h1>HI SAY</h1>
    <Provider store={store}>
      <App />
    </Provider>
  </Suspense>
);
