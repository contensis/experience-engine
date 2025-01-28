import { AppSignals, SignalValue } from "../models";

export interface IAppSignalAttributes {
  app?: { [key: string]: SignalValue | SignalValue[] };
}
/** A call to AppSignalsSnapshot will return a snapshot of the signals for a given url */
export const AppSignalsSnapshot = (
  signals?: AppSignals
): IAppSignalAttributes => {
  const attributes: IAppSignalAttributes = {
    app: signals,
  };

  return signals ? attributes : {};
};
