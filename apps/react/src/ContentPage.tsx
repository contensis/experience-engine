import { useState } from "react";
import { Experiment, Personalize } from "@contensis/personalization-react";
import LeadText from "./components/LeadText";

import { abTestContent, audienceContent } from "./mock/mock-content";

const ContentPage = () => {
  const [experiment] = useState(abTestContent);
  const [personalized] = useState(audienceContent);

  return (
    <>
      <h1>{audienceContent.title}</h1>
      <h2>{audienceContent.subtitle}</h2>

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
