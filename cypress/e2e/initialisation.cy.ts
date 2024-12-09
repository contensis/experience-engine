describe("Personalisation basics", () => {
  context("Given I am a visitor from an external site", () => {
    context("When I click a link that brings me to this site", () => {
      beforeEach(() => {
        cy.interceptManifest("signals.page.path-manifest.json");
        cy.intercept("https://google.com", { fixture: "google.html" });
        if (Cypress.isBrowser("firefox")) {
          // Firefox complains of
          // Permission denied to access property on cross-origin object
          cy.pageViewVisit("/");
        } else {
          cy.visit("https://google.com");
          // inject a link into the external page so we can link back to ourselves
          cy.injectLink("Link back to my home");
          cy.contains("Link back to my home").pageViewClick();
        }
      });

      it(
        Cypress.isBrowser("firefox")
          ? `Then in Firefox we struggle to indentify the referrer with Cypress`
          : `Then the referrer is correctly identified`,
        () => {
          if (Cypress.isBrowser("firefox")) {
            cy.getContext()
              .its("currentPage")
              .should("contain", Cypress.config("baseUrl"));
          } else
            cy.getContext()
              .its("previousPage")
              .should("contain", "https://google.com");
        }
      );
    });
  });
  context("Given I access the home page", () => {
    const fixture = "signals.page.path-manifest.json";
    beforeEach(() => {
      cy.interceptManifest(fixture);
      cy.pageViewVisit("/");
    });

    it("When a personalisation context is available", () => {
      cy.getContext().should("exist");
    });

    it("Then I should have a visitorId and a random percentile persisted", () => {
      cy.getLocalStorage().then((state) => {
        expect(state.cpid).to.exist;
        expect(state.pc).to.be.greaterThan(0).and.lessThan(10000);
      });
    });

    it("And we have made a fetch call to get the current manifest", () => {
      cy.waitManifest(fixture, "page.path");
    });

    context("When I navigate to other pages", () => {
      beforeEach(() => {
        cy.contains("Navigate to Page 1").pageViewClick();
        cy.contains("Navigate to Home Page").pageViewClick();
      });

      it("Then those page views are counted and persisted in localStorage", () => {
        cy.getLocalStorage().then((state) => {
          expect(state.pageViews).to.equal(3);
          const { audiences, manifest, signals, ...logState } = state;
          cy.log(`Stored state is: ${JSON.stringify(logState)}`);
        });
      });
    });
  });
});
