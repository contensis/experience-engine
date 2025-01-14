import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ContentPage from "./ContentPage";
import {
  PersonalizationProvider,
  usePersonalizationContext,
} from "@contensis/personalization-react";
import { MOCK_MANIFEST } from "./mock/mock-manifest";

const App = () => {
  return (
    <PersonalizationProvider manifest={MOCK_MANIFEST}>
      <MainLayout />
      <ContentPage />
    </PersonalizationProvider>
  );
};

const MainLayout = () => {
  const [count, setCount] = useState(0);
  const { percentile } = usePersonalizationContext();
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => setCount((count) => count + 1)}>
          percentile is {percentile}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMRxx
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
};

export default App;
