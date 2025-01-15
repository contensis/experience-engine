import { useEffect, useState } from "react";
import {
  PersonalizationProvider,
  usePersonalizationContext,
} from "@contensis/personalization-react";
import "./App.css";
import ContentPage from "./ContentPage";

import contensisLogo from "./assets/contensis.svg";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import { MOCK_MANIFEST } from "./mock/mock-manifest";

const App = () => {
  return (
    <PersonalizationProvider
      debug={true}
      manifest={MOCK_MANIFEST}
      // rootUrl="https://personalization-api-contensis-dev.services.contensis.com"
    >
      <MainLayout />
    </PersonalizationProvider>
  );
};

const MainLayout = () => {
  const { percentile } = usePersonalizationContext();

  // Track state so we can toggle via the test buttons
  const [isLoggedIn, setLoggedIn] = useState(
    document.cookie.includes("RefreshToken=")
  );
  const [isArt, setArt] = useState(document.cookie.includes("art="));

  // Add a cookie to this page so we can match the signals defined in the manifest
  useEffect(() => {
    if (isLoggedIn) document.cookie = "RefreshToken=any;";
    else
      document.cookie =
        "RefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }, [isLoggedIn]);

  // Add a cookie to this page so we can match the signals defined in the manifest
  useEffect(() => {
    if (isArt) document.cookie = "art=any;";
    else
      document.cookie = "art=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }, [isArt]);

  return (
    <>
      <div>
        <a href="https://www.contensis.com" target="_blank">
          <img
            src={contensisLogo}
            className="logo contensis"
            alt="Contensis logo"
          />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>

      <ContentPage />

      <div
        className="card"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          textAlign: "left",
        }}
      >
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("cp");
            location.reload();
          }}
        >
          Reset localStorage and refresh
        </button>
        <button type="button">percentile is {percentile}</button>
        <br />
        <button type="button" onClick={() => setArt(!isArt)}>
          {isArt ? "Remove" : "Add"} "art" cookie
        </button>
        <button type="button" onClick={() => setLoggedIn(!isLoggedIn)}>
          {isLoggedIn ? "Logout" : "Login"}
        </button>
      </div>
    </>
  );
};

export default App;
