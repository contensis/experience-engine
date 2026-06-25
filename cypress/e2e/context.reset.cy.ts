describe(`Personalization Reset functions`, () => {
  const manifestFixture = `reset-manifest.json`;
  context(
    "Given I have activated signals and audiences by navigating the site",
    () => {
      beforeEach(() => {
        cy.interceptManifest(manifestFixture);
        cy.pageViewVisit("/").waitManifest(manifestFixture, `reset`);

        // Do navigations to activate a signal and audience
        cy.contains("Navigate to Arts Home Page").pageViewClick();
        cy.contains("Navigate to Home Page").pageViewClick();

        // Make a purchase so we have custom attributes and overrides set
        cy.get("#increaseQty").click();
        cy.get("#increaseQty").click();
        cy.get("#buy").click();
        cy.waitSignals();
        cy.getLocalStorage().its("pageViews").should("equal", 3);
        cy.getSessionStorage().then((session) => {
          expect(session.pageViews).to.equal(3);
          expect(session.isFirstVisit).to.equal(true);
        });
      });

      context(`When I reset all experience engine storage`, () => {
        it("Then I can navigate the website as if it were our first visit", () => {
          cy.get("#resetStorage").click();
          cy.getLocalStorage().its("pageViews").should("equal", 1);
          cy.getSessionStorage().its("pageViews").should("equal", 1);
          cy.waitManifest(manifestFixture, `reset`);
        });
      });

      context(`When I reset session storage`, () => {
        beforeEach(() => {
          cy.get("#resetSession").click();
        });
        it("Then I can navigate the website as if we were a returning visitor beginning a new session", () => {
          cy.getLocalStorage().its("pageViews").should("equal", 4);
          cy.getSessionStorage().its("pageViews").should("equal", 1);
        });
        it("And my previous interactions are preserved", () => {
          cy.getLocalStorage().then((state) => {
            expect(state.pageViews).to.equal(4);
            expect(state.overrides["custom.totalSpend"]).to.be.greaterThan(0);
          });
        });
        it("And the session is not counted as the first visit", () => {
          cy.getSessionStorage().its("isFirstVisit").should("equal", false);
        });
      });

      context(`When I reset the manifest`, () => {
        beforeEach(() => {
          const manifestFixture = `reset-manifest2.json`;
          cy.interceptManifest(manifestFixture);
          cy.get("#reloadManifest").click();
          cy.waitManifest(manifestFixture, `reset2`);
        });
        it("Then the manifest is reloaded from Contensis", () => {
          cy.getContext()
            .its("manifest.version.versionNo")
            .should("equal", "reset2");
        });
      });

      context(`When I toggle the preview flag and reset the manifest`, () => {
        beforeEach(() => {
          const manifestFixture = `reset-manifest2.json`;
          // Intercept preview endpoint
          cy.interceptManifest(manifestFixture, true);

          // Having matched audiences and signals from previous navigation
          cy.getLocalStorage().its("audiences.active").should("have.length", 1);
          cy.getLocalStorage().its("signals.active").should("have.length", 2);

          // Check the preview manifest checkbox and wait for the new manifest to load
          cy.get("#isPreviewChecked").check();
          cy.waitManifest(`preview.${manifestFixture}`, `reset2`);
        });
        it("Then the manifest is reloaded with a preview version", () => {
          cy.getContext().its("manifest.client.preview").should("equal", true);
        });
        it("And the audiences are recalculated from the updated manifest", () => {
          cy.getLocalStorage().its("audiences.active").should("have.length", 0);
          cy.getLocalStorage().its("signals.active").should("have.length", 0);
        });
        it("And the updated manifest rules are used for subsequent navigation", () => {
          cy.contains("Navigate to Arts Home Page").pageViewClick();
          cy.waitSignals()
            .getContext()
            .its("signals.matched")
            .should("have.length", 0);
        });
      });

      context(`When I reset all audiences`, () => {
        beforeEach(() => {
          cy.get("#resetAudiences").click();
          cy.waitSignals();
        });
        it("Then I can navigate the website as if we have not previously activated any audiences", () => {
          cy.getLocalStorage().its("audiences.active").should("have.length", 0);
        });
      });

      context(`When I reset all signals`, () => {
        beforeEach(() => {
          cy.get("#resetSignals").click();
          cy.waitSignals();
        });
        it("Then I can navigate the website as if we have not previously activated any signals", () => {
          cy.getLocalStorage().its("signals.active").should("have.length", 0);
        });
      });

      context(`When I call the method to reset all attributes`, () => {
        beforeEach(() => {
          // Having set specific attributes and overrides from previous interactions
          // call the reset attributes function and wait for the signals to recalculate
          cy.getContext()
            .its("signals.attributes")
            .then((attributes) => {
              expect(attributes).to.exist;
              expect(attributes["custom.purchaseAmount"]).to.be.greaterThan(0);
              expect(attributes["custom.totalSpend"]).to.be.greaterThan(0);
            });
          cy.get("#resetAttributes").click();
          cy.waitSignals();
        });
        it("Then I can navigate the website without any previously set attribute overrides or custom attributes", () => {
          cy.getContext()
            .its("signals.attributes")
            .then((attributes) => {
              expect(attributes).to.exist;
              expect(attributes["custom.purchaseAmount"]).to.not.exist;
              expect(attributes["custom.totalSpend"]).to.not.exist;
            });
        });
      });
    }
  );
});
