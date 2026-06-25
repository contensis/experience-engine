import { ManifestClient } from "./manifest-client";
import {
  IAudience,
  ILocationSignalAttributes,
  IManifest,
  IManifestVersion,
  ISignal,
} from "../models";
import { ExperienceEngineContext } from "../experience-engine";
import { isManifestClient } from "../util";

export type IManifestClientArgs = {
  alias: string;
  rootUrl?: string;
  projectId?: string;
  preview?: boolean;
  token?: string;
};

export type IManifestOnReady = (manifest: IManifest) => unknown;

export interface IManifestClient {
  alias: string;
  projectId?: string;
}

export const findSignal = (id: string, signals?: ISignal[]) =>
  signals?.find((signal) => signal.id === id);

/** The Manifest contains the working rules for this context */
export class Manifest implements IManifest {
  client?: ReturnType<typeof ManifestClient>;
  audiences: IAudience[] = [];
  signals: ISignal[] = [];
  location?: ILocationSignalAttributes;
  version: IManifestVersion = {} as IManifestVersion;
  isReady = false;

  constructor(
    client: IManifestClientArgs,
    onReady: IManifestOnReady,
    log: ExperienceEngineContext["l"],
    state?: IManifest,
    preview?: boolean
  );
  constructor(
    client: IManifestClient,
    onReady: IManifestOnReady,
    log: ExperienceEngineContext["l"],
    state?: IManifest,
    preview?: boolean
  );
  constructor(
    manifest: IManifest,
    onReady: IManifestOnReady,
    log: ExperienceEngineContext["l"],
    state?: IManifest,
    preview?: boolean
  );

  constructor(
    client: IManifestClientArgs | IManifest,
    onReady: IManifestOnReady,
    log: ExperienceEngineContext["l"],
    state?: IManifest,
    preview?: boolean
  ) {
    // Initialise with an instance of ManifestClient
    if (isManifestClient(client)) this.client = client;
    // Initialise with a new client (alias and projectId supplied)
    else if ("alias" in client)
      this.client = ManifestClient(
        client.alias,
        client.rootUrl,
        client.projectId,
        client.token,
        preview
      );
    else {
      // Initialise with an IManifest object
      this.audiences = client.audiences || [];
      this.signals = client.signals || [];
      this.location = client.location || {};
      this.version = client.version || ({} as IManifestVersion);
    }

    // Fallback to manifest from state if available before we initialise any client
    if (state && this.client) {
      log("m");
      this.audiences = state.audiences || [];
      this.signals = state.signals || [];
      this.location = state.location || {};
      this.version = state.version || ({} as IManifestVersion);
      this.isReady = (state as Manifest).isReady;
    }

    this.init(onReady); // not awaitable in constructor
  }

  init = async (onReady: IManifestOnReady) => {
    if (this.client) {
      const manifest = await this.client.get();
      if (manifest) {
        // Initialise with an API response
        this.audiences = manifest.audiences;
        this.signals = manifest.signals;
        this.location = manifest.location;
        this.version = manifest.version;

        this.isReady = true;

        // PersonalizatonContent.onManifestReady callback
        onReady(this);
      }
    } else {
      this.isReady = true;

      // PersonalizatonContent.onManifestReady callback
      onReady(this);
    }
  };
}
