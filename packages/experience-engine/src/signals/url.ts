import { isSSR, objectFromEntriesPreserveMultiples } from "../util";

export const UrlSignals = (page: string) => {
  const url = !isSSR() ? new URL(page) : new URL("ssr://");
  return {
    url,
    href: () => url.href,
    domain: () => url.hostname,
    path: () => url.pathname,
    subdomain: () => {
      const parts = url.hostname.split(".");
      // searching for all valid tlds will add approx 40KB to the bundle
      // instead we will just return the first portion of the subdomain
      // my.example.company.co.uk will return just "my"
      return parts?.[0];
    },
    baseUrl: () => `${url.origin}${url.pathname}`,
    querystring: () => url.search,
    queryParam: (name: string) => {
      const params = url.searchParams.getAll(name);
      if (params.length)
        if (params.length > 1) return params;
        else return params[0];
      else return;
    },
    queryParams: () => {
      const params = url.searchParams;
      params.sort();
      return objectFromEntriesPreserveMultiples(params.entries());
    },
  };
};
