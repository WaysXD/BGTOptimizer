import React from "react";
import ReactDOM from "react-dom/client";
import { Providers } from "./providers";
import App from "./App";
import SwapPage from "./pages/SwapPage";
import "@rainbow-me/rainbowkit/styles.css";

const path = window.location.pathname;
const Page = path === "/swap" ? SwapPage : App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Providers>
      <Page />
    </Providers>
  </React.StrictMode>
);
