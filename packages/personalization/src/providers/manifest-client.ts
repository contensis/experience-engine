import { IManifest } from "../models";
import { tryParse } from "../util";

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
        ex && typeof ex === "object" && "statusCode" in ex ? ex.statusCode : "";
      console.error(
        `ManifestClient[get]:${
          statusCode ? ` ${statusCode}` : ""
        } failed with ${ex}`
      );
    }
  };
  return { alias, get, projectId };
};
// export class ManifestClient implements IManifestClient {
//   get rootUrl() {
//     // alias could be supplied as a full url
//     if (this.alias.startsWith("http")) return this.alias;
//     return `https://cms-${this.alias}.cloud.contensis.com`;
//   }

//   constructor(public alias: string, public projectId = "website") {}

//   get = async (): Promise<IManifest | undefined> => {
//     try {
//       const response = await fetch(
//         `${this.rootUrl}/api/delivery/projects/${this.projectId}/personalization/manifest/current`
//       );

//       if (response.ok) {
//         const body = await response.text();
//         return tryParse(body);
//       }
//     } catch (ex: unknown) {
//       const statusCode =
//         ex && typeof ex === "object" && "statusCode" in ex ? ex.statusCode : "";
//       console.error(
//         `ManifestClient[get]:${
//           statusCode ? ` ${statusCode}` : ""
//         } failed with ${ex}`
//       );
//     }
//   };
// }
