import { IManifest } from "../models";
import { isObject, tryParse } from "../util";

export const ManifestClient = (alias: string, projectId = "website") => {
  const rootUrl = alias.startsWith("http")
    ? alias
    : `https://cms-${alias}.cloud.contensis.com`;

  const get = async (): Promise<IManifest | undefined> => {
    try {
      const response = await fetch(
        `${rootUrl}/api/delivery/projects/${projectId}/personalization/manifest/current`
      );

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
