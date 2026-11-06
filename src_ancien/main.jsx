import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* BrowserRouter active la navigation entre les pages, sans recharger le site */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);