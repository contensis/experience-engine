describe("External referrers", () => {
  context("Given I am a visitor from an external site", () => {
    context("When I click a link that brings me to this site", () => {
      beforeEach(() => {
        cy.interceptManifest("signals.page.path-manifest.json");
        cy.intercept(
          "https://google.com/test_page?test_query=test_value&test_query=test_value2",
          {
            fixture: "google.html",
          }
        );
        if (Cypress.isBrowser("firefox")) {
          // Firefox complains of
          // Permission denied to access property on cross-origin object
          cy.pageViewVisit("/");
        } else {
          cy.visit(
            "https://google.com/test_page?test_query=test_value&test_query=test_value2"
          );
          // inject a link into the external page so we can link back to ourselves
          cy.injectLink("Link back to my home");
          cy.contains("Link back to my home").pageViewClick();
        }
      });

      it(
        Cypress.isBrowser("firefox")
          ? `Then in Firefox we struggle to indentify the referrer with Cypress`
          : `Then the referrer is correctly identified in multiple places`,
        () => {
          if (Cypress.isBrowser("firefox")) {
            cy.getContext()
              .its("currentPage")
              .should("contain", Cypress.config("baseUrl"));
          } else {
            cy.getContext().then((context) => {
              expect(context.previousPage).to.contain("https://google.com");
              expect(
                context.signals.attributes["session.referrer.url"]
              ).to.contain("https://google.com");
              expect(
                context.signals.attributes[
                  "session.referrer.queryParams.test_query"
                ]
              ).to.include("test_value");
              expect(
                context.signals.attributes[
                  "session.referrer.queryParams.test_query"
                ]
              ).to.include("test_value2");
            });

            cy.getSessionStorage()
              .its("referrer.url")
              .should("contain", "https://google.com");
          }
        }
      );
    });
  });
});
