describe(`Match Signals via session attributes`, () => {
  const manifestFixture = `signals.session-manifest.json`;
  context("Given I access the home page", () => {
    beforeEach(() => {
      cy.interceptManifest(manifestFixture);
      cy.pageViewVisit("/").waitManifest(manifestFixture, `session`);
    });

    context(`When the manifest has loaded`, () => {
      it("Then the session.isFirstVisit signal attribute is true", () => {
        cy.getContext()
          .its("signals.attributes['session.isFirstVisit']")
          .should("equal", true);
      });
      it("And the session.duration signal attribute is 0", () => {
        cy.getContext()
          .its("signals.attributes['session.duration']")
          .should("equal", 0);
      });
      it("And the attributes are saved in session storage", () => {
        cy.getSessionStorage().its("isFirstVisit").should("equal", true);
        cy.getSessionStorage().its("duration").should("equal", 0);
      });
    });
  });
  context("Given I browse the site", () => {
    beforeEach(() => {
      cy.interceptManifest(manifestFixture);
      cy.pageViewVisit("/").waitManifest(manifestFixture, `session`);
      // Do navigations to activate a signal and audience
      cy.contains("Navigate to Arts Home Page").pageViewClick();
      cy.contains("Navigate to Home Page").pageViewClick();
    });

    context(`When the signals have been calculated`, () => {
      it("Then the session.pageViews signal attribute is 3", () => {
        cy.getContext()
          .its("signals.attributes['session.pageViews']")
          .should("equal", 3);
      });
      it("And session.duration has increased", () => {
        cy.getContext()
          .its("signals.attributes['session.duration']")
          .should("be.greaterThan", 0);
      });
      it("And pageViews attribute is greater than 1", () => {
        cy.getLocalStorage().its("pageViews").should("be.greaterThan", 1);
      });
      it("And the returning visitor audience is not activated", () => {
        cy.getLocalStorage()
          .its("signals.active")
          .should("not.include", "isNotFirstVisit");

        cy.getLocalStorage()
          .its("audiences.active")
          .should("not.include", "returningVisitor");
      });
    });
  });
  context("Given I leave the site", () => {
    beforeEach(() => {
      cy.interceptManifest(manifestFixture);
      cy.intercept("https://google.com/test_page?test_query=test_value", {
        fixture: "google.html",
      });
      cy.pageViewVisit("/").waitManifest(manifestFixture, `session`);
      // Do navigations to activate a signal and audience
      cy.contains("Navigate to Arts Home Page").pageViewClick();
      cy.contains("Navigate to Home Page").pageViewClick();

      // Leave the site
      cy.visit("https://google.com/test_page?test_query=test_value");

      // We need to cheat here and manually clear the session storage
      cy.clearAllSessionStorage();
    });

    context(`When I return to the site`, () => {
      beforeEach(() => {
        cy.pageViewVisit("/");
      });
      it("Then the session.isFirstVisit signal attribute is false", () => {
        cy.getContext()
          .its("signals.attributes['session.isFirstVisit']")
          .should("equal", false);
      });
      it("And session.pageViews attribute is 1", () => {
        cy.getSessionStorage().its("pageViews").should("equal", 1);
      });
      it("And pageViews attribute is greater than 1", () => {
        cy.getLocalStorage().its("pageViews").should("be.greaterThan", 1);
      });
      it("And the returning visitor audience is activated", () => {
        cy.getLocalStorage()
          .its("signals.active")
          .should("include", "isNotFirstVisit");

        cy.getLocalStorage()
          .its("audiences.active")
          .should("include", "returningVisitor");
      });
    });
  });
});
