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
  IPersonalizationStore,
  PersonalizationContext,
} from "@contensis/personalization";
import "cypress-wait-until";

type ContextWindow = typeof window & { cpcontext: PersonalizationContext };
/**
 * Custom getContext command is needed to wait for the personalisation
 * context to be added to the window global and then return the context
 * so we can use it later
 */
Cypress.Commands.add("getContext", () => {
  return cy.waitUntil(() =>
    cy
      .window()
      .then((window: ContextWindow) => (window.cpcontext ? window : false))
      .then(({ cpcontext }: ContextWindow) => (cpcontext ? cpcontext : false))
  );
});
/**
 * Custom getLocalStorage command to get the personalisation store
 * from localStorage, and parse it to a JSON object
 */
Cypress.Commands.add("getLocalStorage", (key = "cp") => {
  cy.window().then((window) => {
    const ls = window.localStorage.getItem(key);
    if (key !== "cp") return ls;
    const state = JSON.parse(ls || "") as IPersonalizationStore;
    return state;
  });
});
/**
 * Custom pageView command is needed to manually trigger the
 * pageView method in the personalisation context global as this
 * does not automatically trigger via the MutationObserver in Cypress
 */
Cypress.Commands.add("pageView", (url?: string) =>
  cy.getContext().then((context) =>
    cy.location("href").then((href) => {
      const nextUrl = url || href;
      const prevUrl = context.currentPage;
      const prevPageCount = context.pageViews.length;

      // Manually call the pageView method
      context.pageView(nextUrl);

      // Assert the pageView has been registered correctly
      expect(context.currentPage).equal(nextUrl);
      if (context.pageViews.length > 1)
        // Cannot assert a prevUrl on the first hit
        expect(context.previousPage).equal(prevUrl);

      // Check pageViews have been incremented
      expect(context.pageViews.length).equal(prevPageCount + 1);

      // Assert the current page has been saved in local storage state
      cy.getLocalStorage()
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
  // eslint-disable-next-line cypress/unsafe-to-chain-command
  (subject: keyof HTMLElementTagNameMap) => cy.get(subject).click().pageView()
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
