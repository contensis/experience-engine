import { ISignal } from "./api/Signal";

export type ComputedSignal = ISignal & { times: number; matched: boolean };

// export type AppSignal = string | number | boolean | null | undefined;
export type SignalValue = string | number | boolean | null | undefined;

export type AppSignals = {
  [key: string]: SignalValue | SignalValue[];
};

export type AppOverrideSignals = {
  [key: string]: SignalValue | SignalValue[];
};