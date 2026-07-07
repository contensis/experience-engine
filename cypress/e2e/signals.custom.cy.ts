import { ComputedSignal } from "@contensis/experience-engine";

describe(`Match Signals via custom attributes`, () => {
  const manifestFixture = `signals.custom-manifest.json`;

  beforeEach(() => {
    cy.interceptManifest(manifestFixture);
    cy.pageViewVisit("/").waitManifest(manifestFixture, `custom`);
  });
  context(`Given I purchase products I have added to a "basket"`, () => {
    beforeEach(() => {
      cy.get("#increaseQty").click();
    });
    context(
      `When the purchase does not meet the value threshold to trigger the signal`,
      () => {
        beforeEach(() => {
          cy.get("#buy").click();
          cy.waitSignals();
        });

        it("Then the signal is computed, but not matched", () => {
          cy.getContext()
            .its("signals.computed")
            .then((calculated: ComputedSignal[]) => {
              const signal = calculated.find(
                (s) => s.id === "purchasedSportsGear"
              );

              expect(signal).to.exist;
              expect(signal.matched).to.equal(false);
            });
        });
      }
    );
    context(
      `When that purchase exceeds the value threshold to trigger the signal`,
      () => {
        beforeEach(() => {
          cy.get("#increaseQty").click();
          cy.get("#buy").click();
        });
        it("Then the signal is computed and matched", () => {
          cy.getContext()
            .its("signals.matched")
            .then((matched: ComputedSignal[]) => {
              const signal = matched.find(
                (s) => s.id === "purchasedSportsGear"
              );

              expect(signal).to.exist;
              expect(signal.matched).to.equal(true);
            });
        });
        it("And the signal is made active", () => {
          cy.getContext()
            .its("signals.state.active")
            .should("include", "purchasedSportsGear");
        });
      }
    );
  });
  context(`Given I perform searches using specific terms`, () => {
    beforeEach(() => {
      cy.get("#searchInput").focus();
    });
    context(
      `When I search using terms that do not match the conditions to trigger the signal`,
      () => {
        beforeEach(() => {
          cy.focused().type("test");
          cy.get("#searchSubmit").click();
        });
        it("Then the signal is computed, but not matched", () => {
          cy.getContext()
            .its("signals.computed")
            .then((calculated: ComputedSignal[]) => {
              const signal = calculated.find(
                (s) => s.id === "searchedForSportsEvents"
              );

              expect(signal).to.exist;
              expect(signal.matched).to.equal(false);
            });
        });
      }
    );
    context(
      `When I search using terms that meet the conditions to match a signal`,
      () => {
        beforeEach(() => {
          cy.focused().type("sports events");
          cy.get("#searchSubmit").click();
        });
        it("Then the signal is computed and matched", () => {
          cy.getContext()
            .its("signals.matched")
            .then((matched: ComputedSignal[]) => {
              const signal = matched.find(
                (s) => s.id === "searchedForSportsEvents"
              );

              expect(signal).to.exist;
              expect(signal.matched).to.equal(true);
            });
        });
      }
    );
    context(
      `When I search using terms that meet the conditions to activate the signal and audience`,
      () => {
        beforeEach(() => {
          // Search using just keywords
          cy.focused().type("sports events");
          cy.get("#searchSubmit").click();

          // Search using keywords and a category combined
          cy.get("#searchCategory").select("event");
          cy.get("#searchInput").focus();
          cy.focused().clear();
          cy.focused().type("sports");
          cy.get("#searchSubmit").click();

          // Search using different category and keywords
          cy.get("#searchCategory").select("sport");
          cy.get("#searchInput").focus();
          cy.focused().clear();
          cy.focused().type("events");
          cy.get("#searchSubmit").click();
        });
        it("Then the signal is activated", () => {
          cy.getContext()
            .its("signals.state.active")
            .should("include", "searchedForSportsEvents");
        });

        context(
          `And when I trigger the remaining conditions to activate the audience`,
          () => {
            beforeEach(() => {
              cy.contains("Navigate to Sports Home Page").pageViewClick(); // 1
              cy.contains("Navigate to Home Page").pageViewClick();
              cy.contains("Navigate to Sports Home Page").pageViewClick(); // 2
              cy.contains("Navigate to Home Page").pageViewClick();
              cy.contains("Navigate to Sports Home Page").pageViewClick(); // 3
            });
            it("Then the audience is made active", () => {
              cy.getContext()
                .its("audiences.active")
                .should("include", "sportsEnthusiasts");
            });
          }
        );
      }
    );
  });
});
