# Test apps

These projects are not part of the package source but each contains rudimentary personalization examples that can be used to test / evaluate package features, scenarios or specific configuration combinations.

- [`/apps/html`](https://github.com/contensis/experience-engine/tree/main/apps/html)
  <br> Serving static HTML with some use-case examples
- [`/apps/react`](https://github.com/contensis/experience-engine/tree/main/apps/react)
  <br> A simple React project created with the [`create-vite` CLI](https://github.com/vitejs/vite/tree/main/packages/create-vite) and the `react-ts` template
  - contains debugging tools
  - connect the app to your environment and debug your manifest rules
- [`/apps/react-router`](https://github.com/contensis/experience-engine/tree/main/apps/react-router)
  <br> A React project created with the [`create-react-router` CLI](https://reactrouter.com/start/framework/installation).
  - contains examples to activate audiences
  - served via `https` and you will need to approve/bypass the security warning in the browser
  - this is the project we use in the Cypress e2e tests
