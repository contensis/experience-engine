import { IManifestClient, ManifestClient } from "./manifest-client";
import { IAudience, IManifest, IManifestVersion, ISignal } from "../models";
import { PersonalizationContext } from "../personalization";
import { isManifestClient } from "../util";

export type IManifestClientArgs =
  | {
      alias: string;
      projectId?: string;
    }
  | {
      rootUrl: string;
      projectId?: string;
    };

export type IManifestOnReady = (manifest: IManifest) => unknown;

export class Manifest implements IManifest {
  private _isReady = false;
  client?: ReturnType<typeof ManifestClient>;
  audiences: IAudience[] = [];
  signals: ISignal[] = [];
  version: IManifestVersion = {} as IManifestVersion;

  get isReady() {
    return this._isReady;
  }

  constructor(
    client: IManifestClientArgs,
    onReady: IManifestOnReady,
    log: PersonalizationContext["log"],
    state?: IManifest
  );
  constructor(
    client: IManifestClient,
    onReady: IManifestOnReady,
    log: PersonalizationContext["log"],
    state?: IManifest
  );
  constructor(
    manifest: IManifest,
    onReady: IManifestOnReady,
    log: PersonalizationContext["log"],
    state?: IManifest
  );

  constructor(
    client: IManifestClientArgs | IManifestClient | IManifest,
    public onReady: IManifestOnReady,
    log: PersonalizationContext["log"],
    state?: IManifest
  ) {
    // Initialise with an instance of ManifestClient
    if (isManifestClient(client)) this.client = client;
    // Initialise with a new client (alias and projectId supplied)
    else if ("alias" in client)
      this.client = ManifestClient(client.alias, client.projectId);
    else if ("rootUrl" in client)
      this.client = ManifestClient(client.rootUrl, client.projectId);
    else {
      // Initialise with an IManifest object
      this.audiences = client.audiences || this.audiences;
      this.signals = client.signals || this.signals;
      this.version = client.version || this.version;
    }

    // Fallback to manifest from state if available before we initialise any client
    if (state && this.client) {
      log(
        `[Manifest] Fallback to manifest found in state while we initialise`
      );
      this.audiences = state.audiences || [];
      this.signals = state.signals || [];
      this.version = state.version || ({} as IManifestVersion);
      this._isReady = (state as Manifest)._isReady;
    }

    this.init(); // not awaitable in constructor
  }

  init = async () => {
    if (this.client) {
      const manifest = await this.client.get();
      if (manifest) {
        // Initialise with an API response
        this.audiences = manifest.audiences;
        this.signals = manifest.signals;
        this.version = manifest.version;
      }
    }

    this._isReady = true;

    // On Ready callback
    this.onReady(this);
  };
}
