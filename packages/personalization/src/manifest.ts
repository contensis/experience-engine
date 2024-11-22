import { IManifestClient, ManifestClient } from "./manifest-client";
import { IAudience } from "./models/api/Audience";
import { IManifest, IManifestVersion } from "./models/api/Manifest";
import { ISignal } from "./models/api/Signal";

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
    onReady: IManifestOnReady
  );
  constructor(client: IManifestClient, onReady: IManifestOnReady);
  constructor(manifest: IManifest, onReady: IManifestOnReady);

  constructor(
    client: IManifestClientArgs | IManifestClient | IManifest,
    public onReady: IManifestOnReady
  ) {
    if (client instanceof ManifestClient) this.client = client;
    else if ("alias" in client) {
      this.client = new ManifestClient(client.alias, client.projectId);
    } else {
      this.audiences = client.audiences || [];
      this.signals = client.signals || [];
      this.version = client.version || ({} as IManifestVersion);
    }
    this.init(); // not awaitable in constructor
  }

  init = async () => {
    if (this.client) {
      const manifest = await this.client.get();
      if (manifest) {
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
