import { usePersonalizationContext } from "@contensis/personalization-react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import Collapsible from "./Collapsible";
import Summary from "./Summary";
import Manifest from "./Manifest";
import Audiences from "./Audiences";
import Signals from "./Signals";
import Attributes from "./Attributes";
import { useState } from "react";
import { recalculateSignals } from "../util";

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
            <h3>
              Session page views: {pageViews.session}
              <br />
              Total page views: {pageViews.total}
            </h3>
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
            <Tab>Summary</Tab>
            <Tab>Audiences and Signals</Tab>
            <Tab>Signal attributes</Tab>
            <Tab>Manifest</Tab>
          </TabList>
          <TabPanel>
            <Summary />
          </TabPanel>
          <TabPanel>
            <div>
              <button
                className="collapsible"
                onClick={() => {
                  if (context) {
                    const state = context.state;
                    state.audiences = { active: [] };
                    state.signals = { active: [] };
                    recalculateSignals(context, state);
                  }
                }}
              >
                Reset audiences and signals
              </button>
              <button
                className="collapsible"
                onClick={() => {
                  if (context) {
                    const state = context.state;
                    state.audiences = { active: [] };
                    recalculateSignals(context, state);
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
                    const state = context.state;
                    state.signals = { active: [] };
                    recalculateSignals(context, state);
                  }
                }}
              >
                Reset signals
              </button>
              <h4>Signals</h4>
            </div>
            <Signals />
          </TabPanel>
          {/* <TabPanel>
          </TabPanel> */}
          <TabPanel>
            <button
              style={{ top: "-4px" }}
              className="collapsible"
              onClick={() => {
                if (context) {
                  const state = context.state;
                  delete state.overrides;
                  recalculateSignals(context, state);
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
