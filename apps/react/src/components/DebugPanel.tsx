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

const DebugPanel = () => {
  const { pageViews } = usePersonalizationContext();

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
            <Tab>Audiences</Tab>
            <Tab>Signals</Tab>
            <Tab>Signal attributes</Tab>
            <Tab>Manifest</Tab>
          </TabList>
          <TabPanel>
            <Summary />
          </TabPanel>
          <TabPanel>
            <Audiences />
          </TabPanel>
          <TabPanel>
            <Signals />
          </TabPanel>
          <TabPanel>
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
