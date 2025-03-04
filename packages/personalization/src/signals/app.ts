import { ICustomAttributes } from "../models";

export interface IAppSignalAttributes {
  custom?: ICustomAttributes;
}
/** A call to AppSignalsSnapshot will return a snapshot of the signals for a given url */
export const AppSignalsSnapshot = (
  signals?: ICustomAttributes
): IAppSignalAttributes => {
  const attributes: IAppSignalAttributes = {
    custom: signals,
  };

  return signals ? attributes : {};
};
