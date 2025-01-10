import { IManifest } from "../models";
import { isObject, tryParse } from "../util";

export const ManifestClient = (
  alias: string,
  projectId = "website",
  token?: string
) => {
  const rootUrl = alias.startsWith("http")
    ? alias
    : `https://cms-${alias}.cloud.contensis.com`;

  const get = async (): Promise<IManifest | undefined> => {
    try {
      const uri = `${rootUrl}/api/delivery/projects/${projectId}/personalization/manifest/current`;
      const tempToken = token || globalThis.CONTENSIS_PERSONALIZATION?.token;
      const tempUri = tempToken
        ? `${rootUrl}/api/management/projects/${projectId}/personalization/manifest/preview`
        : uri;
      const headers = tempToken
        ? {
            Authorization: `Bearer ${tempToken}`,
            ["x-alias"]: "develop",
          }
        : undefined;

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
        `ManifestClient[get]:${statusCode ? ` ${statusCode}` : ""} ${ex}`
      );
    }
  };
  return { alias, get, projectId };
};
