import { ISignal } from "./api/Signal";

export type ComputedSignal = ISignal & { times: number; matched: boolean };

export type MatchedSignal = ISignal & { times: number; matched: true };

export type SignalValue = string | number | boolean | null | undefined;
