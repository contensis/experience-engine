import { ILocationSignalAttributes } from "../ISignalAttributes";
import { IAudience } from "./Audience";
import { ISignal } from "./Signal";

export interface IManifest {
  audiences: IAudience[];
  signals: ISignal[];
  location?: ILocationSignalAttributes;
  version: IManifestVersion;
}

export interface IManifestVersion {
  published: Date;
  publishedBy: string;
  versionNo: string;
}
