import { usePersonalizationContext } from "@contensis/personalization-react";
import { useState } from "react";
import ReactSwitch from "react-switch";

const Summary = () => {
  const { audiences, context,  matched, signals } =
    usePersonalizationContext();

  const [debug, setDebug] = useState(!!context?.debug);

  const className =
    "";

  const activeAudiencesJSX = (
    <div className={className}>
      <h4>Active audiences: {audiences.length}</h4>
      <ul>
        {audiences.map((audienceId) => (
          <li key={audienceId}>
            <code>{audienceId}</code>{" "}
          </li>
        ))}
      </ul>
    </div>
  );

  const activeSignalsJSX = (
    <div className={className}>
      <h4>Active signals: {signals.length}</h4>
      <ul>
        {signals.map((signalId) => (
          <li key={signalId}>
            <code>{signalId}</code>
          </li>
        ))}
      </ul>
    </div>
  );

  const signalsJSX = (
    <div className={className}>
      <h4>Matched signals: {matched.length}</h4>
      <ul>
        {matched.map((signal) => (
          <li key={signal.id}>
            <code>
              {signal.id}
              <span>
                ({signal.times}/{signal.minMatches})
              </span>
            </code>{" "}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="">
      {signals.includes("isLoggedIn") && (
        <div>
          <h2>Welcome back! 😎</h2>
          <p>A special message just for our users</p>
        </div>
      )}
      <div>
        {activeAudiencesJSX}
        {activeSignalsJSX}
        {signalsJSX}
        <h4>
          <label>
            <span>Console logging</span>
            <ReactSwitch
              onChange={() => {
                if (context) {
                  setDebug(!context.debug);
                  context.debug = !context.debug;
                }
              }}
              height={22}
              className="react-switch"
              checked={debug}
            />
          </label>
        </h4>
      </div>
    </div>
  );
};
export default Summary;
