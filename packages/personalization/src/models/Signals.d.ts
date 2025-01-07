import { ISignal } from "./api/Signal";

export type ComputedSignal = ISignal & { times: number; matched: boolean };
