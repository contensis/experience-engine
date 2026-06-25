import { useState } from "react";
import {
  Experiment,
  Personalize,
  useExperienceEngineContext,
} from "@contensis/experience-engine-react";
import LeadText from "./components/LeadText";

import { abTestContent, audienceContent } from "./mock/mock-content";
import DebugPanel from "./components/DebugPanel";

const Heading = ({ title }: { title: string }) => {
  const { matched } = useExperienceEngineContext();
  return matched.map((s) => s.id).includes("isLoggedIn") ? (
    <div>
      <h2>Welcome back! 😎</h2>
      <p>A special message just for our users</p>
    </div>
  ) : (
    <h2>{title}</h2>
  );
};

const ContentPage = () => {
  const [experiment] = useState(abTestContent);
  const [personalized] = useState(audienceContent);

  return (
    <>
      <h1>{audienceContent.title}</h1>
      <DebugPanel />
      <Heading title={audienceContent.subtitle} />
      <Experiment experiments={experiment.content}>
        {(props) => (
          <>
            <LeadText {...props} />
          </>
        )}
      </Experiment>

      <Personalize variants={personalized.content}>
        {(props) => (
          <>
            <LeadText {...props} />
          </>
        )}
      </Personalize>

      <hr />

      <Experiment
        experiments={experiment.content}
        splitKey="weirdSplitKey1"
        render={(props) => <LeadText {...props} />}
      />
      <Personalize
        variants={personalized.content}
        audienceKey="weirdAudienceKey1"
        render={(props) => <LeadText {...props} />}
      />

      <hr />

      <Experiment experiments={experiment.content} render={LeadText} />
      <Personalize variants={personalized.content} render={LeadText} />

      <hr />

      <Experiment experiments={experiment.content}>{LeadText}</Experiment>
      <Personalize
        variants={personalized.content}
        defaultContent={personalized.content.find((c) => !c.weirdAudienceKey1)}
        audienceKey="weirdAudienceKey1"
      >
        {LeadText}
      </Personalize>
    </>
  );
};

export default ContentPage;
