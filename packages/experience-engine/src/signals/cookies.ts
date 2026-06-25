import { cookieStore } from "../providers/store";

export const CookieSignals = () => {
  const string = cookieStore.getString() || "";
  const cookies = cookieStore.getAll() || ({} as { [key: string]: string });

  return {
    cookies,
    get: (name: string) => cookies[name],
    string,
  };
};
