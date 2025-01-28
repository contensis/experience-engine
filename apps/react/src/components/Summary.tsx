import { usePersonalizationContext } from "@contensis/personalization-react";

const Summary = () => {
  const { audiences, isAudience, matched, signals } =
    usePersonalizationContext();

  const className =
    "flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700";

  const activeAudiencesJSX = audiences.length ? (
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
  ) : null;

  const activeSignalsJSX = signals.length ? (
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
  ) : null;

  const signalsJSX = matched?.length ? (
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
  ) : null;

  return (
    <div className="">
      {isAudience(["loggedInUser"]) && (
        <div>
          <h2>Welcome back! 😎</h2>
          <p>A special message just for our users</p>
        </div>
      )}
      <div>
        {activeAudiencesJSX}
        {activeSignalsJSX}
        {signalsJSX}
      </div>
    </div>
  );
};
export default Summary;
