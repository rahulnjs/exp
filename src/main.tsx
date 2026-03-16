import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ToastContainer } from "react-toastify";
import SpeechToText from "./components/ui/speech-to-text";
import { Router } from "./router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
    <ToastContainer />
  </React.StrictMode>
);
