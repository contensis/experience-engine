/// <reference types="cypress" />
/// <reference types="@contensis/personalization" />

declare namespace Cypress {
  interface Chainable<Subject> {
    getContext(): Chainable<PersonalizationContext>;
    getLocalStorage<T extends string = undefined>(
      key?: T
    ): typeof key extends undefined
      ? Chainable<IPersonalizationStore>
      : Chainable<any>;
    injectLink(innerHTML: string, href?: string): Chainable<Subject>;
    interceptManifest(fixture: string): Chainable<Subject>;
    pageView(url?: string): Chainable<PersonalizationContext>;
    pageViewClick(): Chainable<PersonalizationContext>;
    pageViewVisit(url: string): Chainable<PersonalizationContext>;
  }
}
