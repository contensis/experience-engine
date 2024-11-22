import { IManifest } from "./models";
import { tryParse } from "./util";

export interface IManifestClientConstructor {
  new (alias: string, projectId: string): IManifestClient;
}

export interface IManifestClient {
  alias: string;
  projectId: string;
}

export class ManifestClient implements IManifestClient {
  constructor(public alias: string, public projectId: string) {}
  get = async (): Promise<IManifest | undefined> => {
    try {
      const response = await fetch(
        `https://cms-${this.alias}.cloud.contensis.com/api/management/projects/${this.projectId}/personalization/manifest/current`
      );

      if (response.ok) {
        const body = await response.text();
        return tryParse(body);
      }
    } catch (ex: unknown) {
      const statusCode =
        ex && typeof ex === "object" && "statusCode" in ex ? ex.statusCode : "";
      console.error(
        `ManifestClient[get]:${
          statusCode ? ` ${statusCode}` : ""
        } failed with ${ex}`
      );
    }
  };
}
