import { AppSignals, IAppSignalAttributes } from "../models";

/** A call to AppSignalsSnapshot will return a snapshot of the signals for a given url */
export const AppSignalsSnapshot = (
  signals: AppSignals
): IAppSignalAttributes => {
  const attributes: IAppSignalAttributes = {
    app: signals,
  };

  return attributes;
};
