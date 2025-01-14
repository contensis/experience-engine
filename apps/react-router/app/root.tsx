import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction } from "react-router";

import "./app.css";
import {
  PersonalizationProvider,
  usePersonalizationContext,
} from "@contensis/personalization-react";
import { MOCK_MANIFEST } from "./mocks/manifest-1";
import { ifCypressTest } from "./util";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <PersonalizationProvider
          // Use a specific alias to intercept manifest calls in Cypress tests
          alias={ifCypressTest("cypress-test")}
          // We need debug flag set to true when running Cypress tests
          debug={ifCypressTest(true, false)}
          // Use a mock manifest when running the app outside of Cypress tests
          manifest={ifCypressTest(undefined, MOCK_MANIFEST)}
        >
          {children}
        </PersonalizationProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { isAudience } = usePersonalizationContext();
  return (
    <>
      {isAudience(["loggedInUser"]) && (
        <div className="pr-6 text-right">
          <h2>Welcome back! 😎</h2>
          <p>A special message just for our users</p>
        </div>
      )}
      <Outlet />
    </>
  );
}
