import { useState } from "react";
import { abTestContent, audienceContent } from "./mock/mock-content";
import Experiment from "./components/Experiment";
import LeadText from "./components/LeadText";
import Personalize from "./components/Personalize";

const ContentPage = () => {
  const [experiment] = useState(abTestContent);
  const [personalized] = useState(audienceContent);

  // Add a cookie called `RefreshToken` to activate `isLoggedIn` audience
  // Add a cookie called `art` and refresh the page 3 times to activate `artsVisitor` audience

  return (
    <>
      <h2>{audienceContent.title}</h2>
      <h3>{audienceContent.subtitle}</h3>

      <Experiment experiments={experiment.content}>
        {(props) => <LeadText {...props} />}
      </Experiment>

      <Personalize variants={personalized.content}>
        {(props) => <LeadText {...props} />}
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
