import { ILocationSignalAttributes } from "../models";

export const extractLocationHeaders = (response?: Response) => {
  const location: ILocationSignalAttributes = {};

  for (const [header, value] of response?.headers || []) {
    // Look for specific header name
    if (header === "LOC_IP") location.ip = value;
    if (header === "LOC_COUNTRY") location.country = value;
    if (header === "LOC_REG") location.region = value;
    if (header === "LOC_CIT") location.city = value;
    if (header === "LOC_TZ") location.timezone = value;
    if (header === "LOC_LAT") location.latitude = Number(value);
    if (header === "LOC_LON") location.longitude = Number(value);
    if (header === "LOC_ZIP") location.postalCode = value;
  }

  // TODO: Remove - returned test data
  const mockGeoIpResponse = {
    ip: "209.93.238.8",
    country_code: "GB",
    country_name: "United Kingdom",
    region_code: null,
    region_name: "Greater London",
    city: "London",
    zip_code: "WC2N",
    time_zone: "Europe/London",
    latitude: 51.50852966308594,
    longitude: -0.12574000656604767,
    metro_code: 0,
  };

  location.ip = mockGeoIpResponse.ip;
  location.country = mockGeoIpResponse.country_code;
  location.region = mockGeoIpResponse.region_name;
  location.city = mockGeoIpResponse.city;
  location.timezone = mockGeoIpResponse.time_zone;
  location.latitude = mockGeoIpResponse.latitude;
  location.longitude = mockGeoIpResponse.longitude;
  location.postalCode = mockGeoIpResponse.zip_code;

  return location;
};
