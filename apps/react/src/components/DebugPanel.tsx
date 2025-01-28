import { usePersonalizationContext } from "@contensis/personalization-react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import Collapsible from "./Collapsible";
import Summary from "./Summary";
import Manifest from "./Manifest";
import Audiences from "./audiences";
import Signals from "./Signals";
import Attributes from "./Attributes";

const DebugPanel = () => {
  const { pageViews } = usePersonalizationContext();
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
        label="more"
      >
        <Tabs>
          <TabList>
            <Tab>Summary</Tab>
            <Tab>Audiences</Tab>
            <Tab>Manifest</Tab>
            <Tab>Signals</Tab>
            <Tab>Signal attributes</Tab>
          </TabList>
          <TabPanel>
            <Summary />
          </TabPanel>
          <TabPanel>
            <Audiences />
          </TabPanel>
          <TabPanel>
            <Manifest />
          </TabPanel>
          <TabPanel>
            <Signals />
          </TabPanel>
          <TabPanel>
            <Attributes />
          </TabPanel>
        </Tabs>
      </Collapsible>
    </div>
  );
};

export default DebugPanel;
