/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import {
  IExperienceEngineSessionStore,
  IExperienceEngineStore,
  ExperienceEngineContext,
} from "@contensis/experience-engine";
import "cypress-wait-until";

/**
 * Custom interceptManifest command intercepts the ManifestClient request
 * for the current manifest and stubs the response with the given fixture
 */
Cypress.Commands.add("interceptManifest", (fixture: string, preview = false) =>
  cy
    .intercept(
      "GET",
      `https://cms-cypress-test.cloud.contensis.com/api/delivery/projects/website/personalization/manifest/${
        preview ? "preview" : "current"
      }`,
      {
        fixture,
        headers: {
          "x-geoip-country-code": "GB",
          "x-geoip-ip": "192.168.0.100",
        },
      }
    )
    .as(`${preview ? "preview." : ""}${fixture}`)
);

/**
 * Custom waitManifest command waits for the manifest stub to be called
 */
Cypress.Commands.add("waitManifest", (alias: string, versionNo: string) =>
  cy
    .wait(`@${alias}`) // wait for manifest stub to be called
    .then(({ response }) => {
      // validate that we have loaded the intended manifest stub version
      expect(response.body?.version).to.have.property("versionNo", versionNo);
    })
);
/**
 * Custom waitSignals command waits for the signals to be computed and persisted
 */
Cypress.Commands.add("waitSignals", () =>
  cy
    .waitUntil(() =>
      cy.getContext().then((c: ExperienceEngineContext) => {
        return (
          // ensure we have computed signals
          (c.signals?.computed?.length > 0 &&
            // ensure the computed signals matches the number of signals in the manifest
            c.signals.computed.length === c.manifest.signals.length &&
            // ensure the computed signals have been persisted to local storage
            Object.keys(c.state.signals?.computed || {}).length ===
              c.signals.computed.length) ||
          +new Date() - c.signals?.t > 1000
        );
      })
    )
    .getContext()
);

/**
 * Custom injectLink command injects a link into the current document
 * so we can link back from an external site to populate document.referrer
 * otherwise it is usually blank
 */
Cypress.Commands.add(
  "injectLink",
  {
    prevSubject: "optional",
  },
  <T>(subject: T, innerHTML: string, href = Cypress.config("baseUrl")) =>
    cy.document().then((doc) => {
      const a = doc.createElement("a");
      a.setAttribute("href", href);
      a.innerHTML = innerHTML;
      doc.body.prepend(a);
      return subject;
    })
);

type ContextWindow = typeof window & {
  CONTENSIS_XP: { context?: ExperienceEngineContext };
};

/**
 * Custom getContext command is needed to wait for the personalisation
 * context to be added to the window global and then return the context
 * so we can use it later
 */
Cypress.Commands.add("getContext", () => {
  return cy.waitUntil(() =>
    cy
      .window()
      .then((window: ContextWindow) =>
        window.CONTENSIS_XP &&
        window.CONTENSIS_XP.context
          ? window
          : false
      )
      .then(({ CONTENSIS_XP: { context } = {} }: ContextWindow) =>
        context ? context : false
      )
  );
});
/**
 * Custom getLocalStorage command to get the personalisation store
 * from localStorage, and parse it to a JSON object
 */
Cypress.Commands.add("getLocalStorage", (key = "cxp") => {
  cy.window().then((window) => {
    const ls = window.localStorage.getItem(key);
    if (key !== "cxp") return ls;
    const state = JSON.parse(ls || "") as IExperienceEngineStore;
    return state;
  });
});
/**
 * Custom getSessionStorage command to get the personalisation store
 * from sessionStorage, and parse it to a JSON object
 */
Cypress.Commands.add("getSessionStorage", (key = "cxp") => {
  cy.window().then((window) => {
    const ls = window.sessionStorage.getItem(key);
    if (key !== "cxp") return ls;
    const state = JSON.parse(ls || "") as IExperienceEngineSessionStore;
    return state;
  });
});
/**
 * Custom pageView command is needed to manually trigger the
 * pageView method in the personalisation context global as this
 * does not automatically trigger via the MutationObserver in Cypress
 */
Cypress.Commands.add("pageView", () =>
  cy.getContext().then((context) =>
    cy.location("href").then((nextUrl) => {
      const prevUrl = context.currentPage;
      const prevPageCount = context.pageViews.length;

      // Manually call the pageView method
      context.pageView();

      // Assert the pageView has been registered correctly
      expect(context.currentPage).equal(nextUrl);

      if (context.pageViews.length > 1)
        // Cannot assert a previousPage on the first hit
        expect(context.previousPage).equal(prevUrl);

      // Check pageViews have been incremented
      expect(context.pageViews.length).equal(prevPageCount + 1);

      // Assert the current page has been saved in local storage state
      cy.waitSignals()
        .getLocalStorage()
        .then((state) => state.currentPage)
        .should("equal", nextUrl)
        // .log(`[pageView] This: ${context.page}`)
        // .log(`[pageView] Current: ${context.currentPage}`)
        // .log(`[pageView] Previous: ${context.previousPage}`)
        .then(() => context);
    })
  )
);
/**
 * Custom pageViewClick command combines a click and a pageView
 */
Cypress.Commands.add(
  "pageViewClick",
  {
    prevSubject: true,
  },
  (subject: keyof HTMLElementTagNameMap) =>
    // cy.get(subject).click().pageView();
    // This is better because we assert the href has updated before we record the
    // pageView avoiding occasional flaky tests
    cy.location("href").then((prevUrl) => {
      // eslint-disable-next-line cypress/unsafe-to-chain-command
      cy.get(subject)
        .click()
        .location("href")
        .should("not.equal", prevUrl)
        .pageView();
    })
);

/**
 * Custom pageViewClick command combines a visit and a pageView
 */
Cypress.Commands.add("pageViewVisit", (url: string) =>
  cy.visit(url).pageView()
);

// Overwiting the commands doesn't work as we need to wait for the result in
// the original command for the location.href to be updated with the next page url
// and we can't do that here
// /** Overwrite the visit command to call our pageView command after we visit a page in Cypress */
// Cypress.Commands.overwrite("visit", (originalFn, url) => {
//   // originalFn is the existing `visit` command that you need to call
//   // and it will receive whatever you pass in here.
//   //
//   // make sure to add a return here!
//   const visitResult = originalFn(url);
//   cy.pageView().then(() => visitResult);
// });
// /** Overwrite the click command to call our pageView command after we visit a page in Cypress */
// Cypress.Commands.overwrite("click", (originalClick, subject, ...args) => {
//   const clickResult = originalClick(subject, ...args);
//   return cy.pageView().then(() => clickResult);
// });
