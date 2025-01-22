import { IManifest } from "../models";
import { GLOBAL } from "../personalization";
import { isObject, tryParse } from "../util";

export const ManifestClient = (
  alias: string,
  rootUrl?: string,
  projectId = "website",
  token?: string
) => {
  const hostname = rootUrl || `https://cms-${alias}.cloud.contensis.com`;

  const get = async (): Promise<IManifest | undefined> => {
    try {
      const uri = `${hostname}/api/delivery/projects/${projectId}/personalization/manifest/current`;

      const tempToken = token || globalThis[GLOBAL]?.token;

      const tempUri = tempToken
        ? `${hostname}/api/management/projects/${projectId}/personalization/manifest/preview`
        : uri;
      const headers = {
        ["x-alias"]: alias,
      } as Record<string, string>;

      if (tempToken) headers.Authorization = `Bearer ${tempToken}`;

      const response = await fetch(tempUri, {
        headers,
      });

      if (response.ok) {
        const body = await response.text();
        return tryParse(body);
      }
    } catch (ex: unknown) {
      const statusCode =
        isObject(ex) && "statusCode" in ex ? ex.statusCode : "";
      console.error(
        `Manifest[get]:${statusCode ? ` ${statusCode}` : ""} ${ex}`
      );
    }
  };
  return { alias, get, projectId };
};
