import { useEffect, useState } from "react";

import {
  ExperienceEngineProvider,
  useExperienceEngineContext,
} from "@contensis/experience-engine-react";

import "./App.css";
import ContentPage from "./ContentPage";

import contensisLogo from "./assets/contensis.svg";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import { MOCK_MANIFEST } from "./mock/mock-manifest";
import { mockGeoIpResponse } from "./mock/mock-geoip";

const App = () => {
  return (
    <ExperienceEngineProvider
      debug={true}
      manifest={MOCK_MANIFEST}
      // rootUrl="https://personalization-api-contensis-dev.services.contensis.com"
    >
      <MainLayout />
    </ExperienceEngineProvider>
  );
};

/** Mock (third-party) geo location api response, delayed by ms */
const useGeoIP = () => {
  const [geoData, setGeoData] = useState<
    typeof mockGeoIpResponse | undefined
  >();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setGeoData(mockGeoIpResponse);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return geoData;
};

export const MainLayout = () => {
  const geoLocation = useGeoIP();
  const { audiences, computed, context, isAudience, setAttributes, signals } =
    useExperienceEngineContext();

  // This is to make the component re-render when the location has changed
  // (simulating client-side navigation to trigger MutationObserver callback)
  const [currentPage, setCurrentPage] = useState<string>("");
  const href = typeof location !== "undefined" ? location.href : "";

  const [, rerender] = useState(context?.t);

  useEffect(() => {
    if (context?.t) {
      rerender(context?.t);
      // console.log(context?.t);
    }
    if (href !== currentPage) setCurrentPage(href);
  }, [href, currentPage, context?.t, audiences, signals]);

  // Track state so we can toggle via the test buttons
  const [isLoggedIn, setLoggedIn] = useState(
    document.cookie.includes("RefreshToken=")
  );

  // Add a cookie to this page so we can match the signal defined in the manifest
  useEffect(() => {
    if (isLoggedIn) document.cookie = "RefreshToken=any; path=/;";
    else {
      document.cookie =
        "RefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }, [isLoggedIn]);

  // Take our own geo location attributes and set them as signal attributes
  useEffect(() => {
    if (geoLocation) {
      console.log(`GeoIP data:`, geoLocation);
      setAttributes({
        ...geoLocation,
        localTemperature: 20,
        avgTemperature: 12,
      });
    }
  }, [geoLocation, setAttributes]);

  const [blockSignIn, setBlockSignIn] = useState(
    isAudience("disallowWebsiteSignup")
  );
  useEffect(() => {
    setBlockSignIn(isAudience("disallowWebsiteSignup"));
  }, [isAudience]);

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
            history.pushState(
              {},
              "",
              location.href.includes("/arts") ? "/" : "/arts/"
            );
            setCurrentPage(location.href);
          }}
        >
          Navigate {location.href.includes("/arts") ? "Home" : `Arts`}
          {(() => {
            const signal = computed.find((s) => s.id === "artsVisitor");
            const remaining = (signal?.minMatches || 0) - (signal?.times || 0);
            return remaining ? ` +${remaining}` : "";
          })()}
        </button>
        <button
          type="button"
          onClick={() => {
            setAttributes({
              purchaseCategory: "sports",
              purchaseAmount: 50.01,
            });
          }}
        >
          Purchase sports gear
        </button>
        <button
          type="button"
          onClick={() => {
            if (!blockSignIn) {
              setLoggedIn(!isLoggedIn);
              location.reload();
            }
          }}
        >
          {isLoggedIn
            ? "Logout"
            : blockSignIn
            ? "Contact us :)"
            : "Login with cookie"}
        </button>
      </div>
    </>
  );
};

export default App;
