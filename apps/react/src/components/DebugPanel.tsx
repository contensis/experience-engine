import { usePersonalizationContext } from "@contensis/personalization-react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import Collapsible from "./Collapsible";
import Overview from "./Overview";
import Manifest from "./Manifest";
import Audiences from "./Audiences";
import Signals from "./Signals";
import Attributes from "./Attributes";
import { useState } from "react";
import { getRelativeTime } from "../util";

const DebugPanel = () => {
  const { context, pageViews } = usePersonalizationContext();

  const [tabIndex, setTabIndex] = useState(
    Number(sessionStorage.getItem("cpdemo-tabIndex")) || 0
  );

  return (
    <div className="signal-attributes">
      <Collapsible
        header={
          <div>
            <div style={{ position: "relative", zIndex: "-1" }}>
              <h3>Session page views: {pageViews.session}</h3>
              <div
                className="small"
                style={{ position: "absolute", top: "1.7em", color: "#aaa" }}
              >
                Started{" "}
                {getRelativeTime(
                  +new Date() - context.session.state.duration * 1000
                )}
              </div>
            </div>
            <h3>Total page views: {pageViews.total}</h3>
          </div>
        }
        label="console"
        openState={
          (sessionStorage.getItem("cpdemo-debugOpen") || "").toLowerCase() ===
          "true"
        }
        onToggle={(state) => {
          sessionStorage.setItem("cpdemo-debugOpen", `${state}`);
        }}
      >
        <Tabs
          selectedIndex={tabIndex}
          onSelect={(index) => {
            setTabIndex(index);
            sessionStorage.setItem("cpdemo-tabIndex", `${index}`);
          }}
        >
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Audiences and Signals</Tab>
            <Tab>Attributes snapshot</Tab>
            <Tab>Manifest</Tab>
          </TabList>
          <TabPanel>
            <Overview />
          </TabPanel>
          <TabPanel>
            <div>
              <button
                className="collapsible"
                onClick={() => {
                  if (context) {
                    context.reset({ audiences: true, signals: true });
                    context.compute();
                  }
                }}
              >
                Reset audiences and signals
              </button>
              <button
                className="collapsible"
                onClick={() => {
                  if (context) {
                    context.reset({ audiences: true });
                  }
                }}
              >
                Reset audiences
              </button>
              <h4>Audiences</h4>
              <Audiences />
            </div>
            <div>
              <button
                className="collapsible"
                onClick={() => {
                  if (context) {
                    context.reset({ signals: true });
                  }
                }}
              >
                Reset signals
              </button>
              <h4>Signals</h4>
              <Signals />
            </div>
          </TabPanel>
          <TabPanel>
            <button
              style={{ top: "-4px" }}
              className="collapsible"
              onClick={() => {
                if (context) {
                  context.reset({ attributes: true });
                }
              }}
            >
              Reset attributes
            </button>
            <Attributes />
          </TabPanel>
          <TabPanel>
            <Manifest />
          </TabPanel>
        </Tabs>
      </Collapsible>
    </div>
  );
};

export default DebugPanel;
