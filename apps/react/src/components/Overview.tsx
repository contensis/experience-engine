import { usePersonalizationContext } from "@contensis/personalization-react";
import { useState } from "react";
import ReactSlider from "react-slider";
import ReactSwitch from "react-switch";
import { abTestContent } from "../mock/mock-content";

const Overview = () => {
  const { audiences, context, matched, percentile, signals } =
    usePersonalizationContext();

  const [debug, setDebug] = useState(!!context?.debug);

  const setPercentile = (value: number) => {
    if (context) {
      context.percentile = value / 100;
      context.compute();
    }
  };

  const className = "";

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
      <h4>Activated signals: {signals.length}</h4>
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
      {matched.map((s) => s.id).includes("isLoggedIn") && (
        <div>
          <h2>Welcome back! 😎</h2>
          <p>A special message just for our users</p>
        </div>
      )}
      <div>
        {activeAudiencesJSX}
        {activeSignalsJSX}
        {signalsJSX}
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("cp");
            sessionStorage.removeItem("cp");
            location.reload();
          }}
        >
          Reset storage
        </button>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem("cp");
            location.reload();
          }}
        >
          Reset session
        </button>
        <button type="button">percentile is {percentile}</button>
        <h4>
          <label>
            <span>Update percentile </span>
            <div className="small" style={{ fontWeight: "normal" }}>
              (for experiment bucketing)
            </div>
            <div style={{ width: "60%" }}>
              <ReactSlider
                className="horizontal-slider"
                marks={abTestContent.content.map((c) => c.split * 100)}
                min={0}
                max={9999}
                onAfterChange={(value) => setPercentile(value)}
                renderThumb={(props, state) => {
                  return (
                    <div {...props} key={props.key}>
                      <span
                        style={{ textDecoration: "", fontSize: "xx-small" }}
                      >{`${Math.round(state.valueNow / 10) / 10}%`}</span>
                    </div>
                  );
                }}
                value={percentile * 100}
              />
            </div>
          </label>
        </h4>
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
export default Overview;
