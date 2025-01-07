import { usePersonalizationContext } from "@contensis/personalization-react";

const Audiences = () => {
  const { active, matched, pageViews } = usePersonalizationContext();

  // context.handlers.onPageView = () => {
  //   setPvc(context.pageViews.length);
  // };

  console.log(`render AudiencesJSX`);

  const className =
    "flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700";

  const activeAudiencesJSX = active.audiences.length ? (
    <div className={className}>
      <h3>Active audiences: {active.audiences.length}</h3>
      <ul>
        {active.audiences.map((audienceId) => (
          <li key={audienceId}>- {audienceId}</li>
        ))}
      </ul>
    </div>
  ) : null;

  const activeSignalsJSX = active.signals.length ? (
    <div className={className}>
      <h3>Active signals: {active.signals.length}</h3>
      <ul>
        {active.signals.map((signalId) => (
          <li key={signalId}>- {signalId}</li>
        ))}
      </ul>
    </div>
  ) : null;

  const signalsJSX = matched?.length ? (
    <div className={className}>
      <h3>Matched signals: {matched.length}</h3>
      <ul>
        {matched.map((signal) => (
          <li key={signal.id}>
            - {signal.id}
            <span>
              ({signal.times}/{signal.minMatches})
            </span>
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
      <div className="flex justify-center gap-4">
        {activeAudiencesJSX}
        {activeSignalsJSX}
        {signalsJSX}
      </div>
    </div>
  );
};
export default Audiences;
