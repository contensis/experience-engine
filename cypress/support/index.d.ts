/// <reference types="cypress" />
/// <reference types="@contensis/experience-engine" />

declare namespace Cypress {
  interface Chainable<Subject> {
    getContext(): Chainable<ExperienceEngineContext>;
    getLocalStorage<T extends string = undefined>(
      key?: T
    ): typeof key extends undefined
      ? Chainable<IExperienceEngineStore>
      : Chainable<any>;
    getSessionStorage<T extends string = undefined>(
      key?: T
    ): typeof key extends undefined
      ? Chainable<IExperienceEngineSessionStore>
      : Chainable<any>;
    injectLink(innerHTML: string, href?: string): Chainable<Subject>;
    interceptManifest(fixture: string, preview?: boolean): Chainable<Subject>;
    pageView(url?: string): Chainable<ExperienceEngineContext>;
    pageViewClick(): Chainable<ExperienceEngineContext>;
    pageViewVisit(url: string): Chainable<ExperienceEngineContext>;
    waitManifest(fixture: string, versionNo: string): Chainable<Subject>;
    waitSignals(): Chainable<ExperienceEngineContext>;
  }
}
