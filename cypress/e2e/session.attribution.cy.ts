describe(`Ensure session campaign / marketing attribution`, () => {
  const manifestFixture = `signals.session-manifest.json`;
  const testUrl =
    "/?utm_campaign=test-utm-campaign&utm_source=test-utm-source&utm_medium=test-utm-medium&utm_content=test-utm-content&utm_term=test-utm-term&gclid=test-gclid&dclid=test-dclid&msclkid=test-msclkid&fbclid=test-fbclid&ttclid=test-ttclid&li_fat_id=test-li-fat-id&twclid=test-twclid";

  context("Given a user has clicked an external link to the site", () => {
    beforeEach(() => {
      cy.interceptManifest(manifestFixture);
      cy.pageViewVisit(testUrl).waitManifest(manifestFixture, `session`);
    });

    context(
      `When the site is first loaded from a url containing campaign attribution query parameters`,
      () => {
        it("Then the campaign attributions are saved in session storage", () => {
          cy.getSessionStorage().its("duration").should("equal", 0);
          cy.getSessionStorage().its("attribution").should("be.an", "object");
        });
        it("And all the different attribution keys are recognised", () => {
          cy.getSessionStorage()
            .its("attribution")
            .should("have.all.keys", [
              "utm_campaign",
              "utm_source",
              "utm_medium",
              "utm_content",
              "utm_term",
              "gclid",
              "dclid",
              "msclkid",
              "fbclid",
              "ttclid",
              "li_fat_id",
              "twclid",
            ]);
        });
        it("And all the attribution values are correct", () => {
          cy.getSessionStorage().its("attribution").should("include", {
            utm_campaign: "test-utm-campaign",
            utm_source: "test-utm-source",
            utm_medium: "test-utm-medium",
            utm_content: "test-utm-content",
            utm_term: "test-utm-term",
            gclid: "test-gclid",
            dclid: "test-dclid",
            msclkid: "test-msclkid",
            fbclid: "test-fbclid",
            ttclid: "test-ttclid",
            li_fat_id: "test-li-fat-id",
            twclid: "test-twclid",
          });
        });
      },
    );
  });
  context("Given I have left the site", () => {
    beforeEach(() => {
      cy.interceptManifest(manifestFixture);
      cy.interceptManifest(manifestFixture);
      cy.intercept("https://google.com/test_page?test_query=test_value", {
        fixture: "google.html",
      });
      cy.pageViewVisit("/").waitManifest(manifestFixture, `session`);

      // Leave the site
      cy.visit("https://google.com/test_page?test_query=test_value");

      // We need to cheat here and manually clear the session storage
      cy.clearAllSessionStorage();
    });

    context(`When I return to the site via a different campaign URL`, () => {
      const differentCampaignUrl =
        "/?utm_campaign=new-utm-campaign&utm_source=new-utm-source&utm_medium=new-utm-medium&utm_content=new-utm-content&utm_term=new-utm-term&gclid=new-gclid&dclid=new-dclid&msclkid=new-msclkid&fbclid=new-fbclid&ttclid=new-ttclid&li_fat_id=new-li-fat-id&twclid=new-twclid";

      beforeEach(() => {
        cy.pageViewVisit(differentCampaignUrl);
      });
      it("Then the updated campaign attributions are saved in session storage", () => {
        cy.getSessionStorage().its("attribution").should("include", {
          utm_campaign: "new-utm-campaign",
          utm_source: "new-utm-source",
          utm_medium: "new-utm-medium",
          utm_content: "new-utm-content",
          utm_term: "new-utm-term",
          gclid: "new-gclid",
          dclid: "new-dclid",
          msclkid: "new-msclkid",
          fbclid: "new-fbclid",
          ttclid: "new-ttclid",
          li_fat_id: "new-li-fat-id",
          twclid: "new-twclid",
        });
      });
      it("And session.pageViews attribute is 1", () => {
        cy.getSessionStorage().its("pageViews").should("equal", 1);
      });
      it("And total pageViews attribute is greater than 1", () => {
        cy.getLocalStorage().its("pageViews").should("be.greaterThan", 1);
      });
    });
  });
});
