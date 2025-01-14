import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PersonalizationProvider } from "@contensis/personalization-react";
import "./index.css";
import App from "./App.tsx";
import { MOCK_MANIFEST } from "./mock/mock-manifest.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersonalizationProvider manifest={MOCK_MANIFEST}>
      <App />
    </PersonalizationProvider>
  </StrictMode>
);
