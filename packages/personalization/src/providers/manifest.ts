import { IManifestClient, ManifestClient } from "./manifest-client";
import { IAudience, IManifest, IManifestVersion, ISignal } from "../models";
import { PersonalizationContext } from "../personalization";

export type IManifestClientArgs = {
  alias: string;
  projectId: string;
};

export type IManifestOnReady = (manifest: IManifest) => unknown;

export class Manifest implements IManifest {
  private _isReady = false;
  client?: ManifestClient;
  audiences: IAudience[] = [];
  signals: ISignal[] = [];
  version: IManifestVersion = {} as IManifestVersion;

  get isReady() {
    return this._isReady;
  }

  constructor(
    { alias, projectId }: IManifestClientArgs,
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
    private log: PersonalizationContext["log"],
    state?: IManifest
  ) {
    // Fallback to manifest from state while we initialise if available
    if (state) {
      this.log(
        `[Manifest] Fallback to manifest found in state while we initialise`
      );
      this.audiences = state.audiences || [];
      this.signals = state.signals || [];
      this.version = state.version || ({} as IManifestVersion);
      this._isReady = (state as Manifest)._isReady;
    }

    // Initialise with an instance of ManifestClient
    if (client instanceof ManifestClient) this.client = client;
    // Initialise with a new client (alias and projectId supplied)
    else if ("alias" in client) {
      this.client = new ManifestClient(client.alias, client.projectId);
    } else {
      // Initialise with an IManifest object
      this.audiences = client.audiences || this.audiences;
      this.signals = client.signals || this.signals;
      this.version = client.version || this.version;
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
