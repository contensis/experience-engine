import { usePersonalizationContext } from "@contensis/personalization-react";
import { useEffect, useState } from "react";
import { getRelativeTime } from "./util";

const Audiences = () => {
  const { context } = usePersonalizationContext();

  const [getSignals, setSignals] = useState<[string, number, number][]>([]);
  const [getAudiences, setAudiences] = useState<[string, number][]>([]);
  const [getSession, setSession] = useState<number>(0);
  const [getTotal, setTotal] = useState<number>(0);

  useEffect(() => {
    if (
      context.audiences?.matched &&
      context.audiences.matched.length !== getAudiences?.length
    )
      setAudiences(
        context.audiences.matched.map((a) => [
          a.id,
          context.state.audiences?.matched?.[a.id]?.[0].t || 0,
        ])
      );
    if (
      context.signals?.matched &&
      context.signals.matched.length !== getSignals?.length
    ) {
      setSignals(
        context.signals.matched.map((s) => [
          s.id,
          context.state.signals?.matched?.[s.id]?.length || 0,
          s.minMatches,
        ])
      );
    }
    setSession(context.pageViews.length);
    setTotal(context.state.pageViews);
  }, [context.pageViews, context.audiences?.matched, context.signals?.matched]);

  const audiencesJSX = getAudiences?.length ? (
    <>
      <div>
        <h3>Active audiences: {getAudiences.length}</h3>
        <ul>
          {getAudiences.map(([audienceId, timestamp]) => (
            <li key={audienceId}>
              - {audienceId} <span>({getRelativeTime(timestamp)})</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  ) : null;

  const signalsJSX = getSignals?.length ? (
    <>
      <div>
        <h3>Matched signals: {getSignals.length}</h3>
        <ul>
          {getSignals.map(([signalId, numMatches, minMatches]) => (
            <li key={signalId}>
              - {signalId}{" "}
              <span>
                ({numMatches}/{minMatches})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  ) : null;
  return (
    <div className="justify-center">
      <h2>Session page views: {getSession}</h2>
      <h2>Total page views: {getTotal}</h2>
      {audiencesJSX}
      {signalsJSX}
    </div>
  );
};
export default Audiences;
