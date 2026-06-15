import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/index.css";

const storedTheme = localStorage.getItem("maisha.theme");
const storedLang = localStorage.getItem("maisha.lang");
const prefersDark =
  storedTheme === "dark" ||
  (!storedTheme &&
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.lang = storedLang === "sw" ? "sw" : "en";
if (prefersDark) document.documentElement.classList.add("dark");

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
