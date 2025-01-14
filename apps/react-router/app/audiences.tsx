import { usePersonalizationContext } from "@contensis/personalization-react";

const Audiences = () => {
  const { audiences, isAudience, matched, manifest, pageViews, signals } =
    usePersonalizationContext();

  const className =
    "flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700";

  const activeAudiencesJSX = audiences.length ? (
    <div className={className}>
      <h3>Active audiences: {audiences.length}</h3>
      <ul>
        {audiences.map((audienceId) => {
          const m = manifest?.audiences.find((a) => a.id === audienceId);
          return (
            <li key={audienceId} className="text-sm pb-3">
              - {audienceId}
              <br />
              <span className="text-sm pl-3">{m?.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;

  const activeSignalsJSX = signals.length ? (
    <div className={className}>
      <h3>Active signals: {signals.length}</h3>
      <ul>
        {signals.map((signalId) => {
          const m = manifest?.signals.find((s) => s.id === signalId);
          return (
            <li key={signalId} className="text-sm pb-3">
              - {signalId}
              <br />
              <span className="text-sm pl-3">{m?.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;

  const signalsJSX = matched?.length ? (
    <div className={className}>
      <h3>Matched signals: {matched.length}</h3>
      <ul>
        {matched.map((signal) => (
          <li key={signal.id} className="text-sm pb-3">
            - {signal.id}
            <span>
              ({signal.times}/{signal.minMatches})
            </span>
            <br />
            <span className="text-sm pl-3">{signal.name}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  return (
    <div className="">
      <div className="flex flex-col items-center gap-1 p-6">
        <h2>Session page views: {pageViews.session}</h2>
        <h2>Total page views: {pageViews.total}</h2>
      </div>
      {isAudience(["loggedInUser"]) && (
        <div>
          <h2>Welcome back! 😎</h2>
          <p>A special message just for our users</p>
        </div>
      )}
      <div className="flex justify-center gap-4">
        {activeAudiencesJSX}
        {activeSignalsJSX}
        {signalsJSX}
      </div>
    </div>
  );
};
export default Audiences;
