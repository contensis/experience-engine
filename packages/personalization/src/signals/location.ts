import { ILocationSignalAttributes, IManifest } from "../models";
import { isObject } from "../util";

export const extractLocationHeaders = (
  response?: Response,
  body?: IManifest
) => {
  let location: ILocationSignalAttributes = {};

  for (const [header, value] of response?.headers || []) {
    // Look for specific header name
    if (header === "x-geoip-ip") location.ip = value;
    if (header === "x-geoip-country-code") location.country = value;
  }

  // Add in any location keys hardcoded in manifest body
  if (body && "location" in body) {
    const bl = body.location;
    if (isObject(bl)) location = { ...location, ...bl };
  }

  return location;
};
