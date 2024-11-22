import { IAudience } from "./Audience";
import { ISignal } from "./Signal";

export interface IManifest {
  audiences: IAudience[];
  signals: ISignal[];
  version: IManifestVersion;
}

export interface IManifestVersion {
  published: Date;
  publishedBy: string;
  versionNo: string;
}
