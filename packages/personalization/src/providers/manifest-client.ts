import { IManifest } from "../models";
import { GLOBAL } from "../personalization";
import { extractLocationHeaders } from "../signals/location";
import { isObject, tryParse } from "../util";

export const ManifestClient = (
  alias: string,
  rootUrl?: string,
  projectId = "website",
  token?: string,
  preview?: boolean
) => {
  const hostname = rootUrl || `https://cms-${alias}.cloud.contensis.com`;

  // Hoist return object above get function so it can access altered args/members
  const returnArgs = { alias, preview, projectId } as {
    alias: string;
    get: () => Promise<IManifest | undefined>;
    preview: boolean | undefined;
    projectId: string;
  };

  returnArgs.get = async (): Promise<IManifest | undefined> => {
    try {
      const bearerToken = token || globalThis[GLOBAL]?.token;

      const uri = `${hostname}/api/${
        bearerToken ? "management" : "delivery"
      }/projects/${projectId}/personalization/manifest/${
        returnArgs.preview && !bearerToken ? "preview" : "current"
      }`;

      const headers = {
        ["x-alias"]: alias,
      } as Record<string, string>;

      if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;

      const response = await fetch(uri, {
        headers,
      });

      if (response.ok) {
        const body = await response.text();
        const location = extractLocationHeaders(response);
        const parsed = tryParse(body);
        return { ...(isObject(parsed) ? parsed : {}), location } as IManifest;
      }
    } catch (ex: unknown) {
      const statusCode =
        isObject(ex) && "statusCode" in ex ? ex.statusCode : "";
      console.error(
        `Manifest[get]:${statusCode ? ` ${statusCode}` : ""} ${ex}`
      );
    }
  };

  return returnArgs;
};
