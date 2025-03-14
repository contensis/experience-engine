import { ISignal, PersonalizationContext } from "@contensis/personalization";

const audienceMatchedBy = ["signals", "audiences"];
for (const dimension of audienceMatchedBy) {
  const manifestFixture = `audiences.${dimension}-manifest.json`;
  describe(`Activate audiences with conditions that contain ${dimension} wrapped in...`, () => {
    context("an 'and' condition", () => {
      context("Given I access the home page", () => {
        beforeEach(() => {
          cy.interceptManifest(manifestFixture);
          cy.pageViewVisit("/")
            // wait for manifest stub to be called
            .waitManifest(manifestFixture, `audiences.${dimension}`);
        });

        context(`When I navigate to a page that activates a signal`, () => {
          beforeEach(() => {
            cy.contains("Navigate to Arts Home Page").pageViewClick();
          });

          it("Then the signal is made active", () => {
            cy.getLocalStorage()
              .its("signals.active")
              .should("include", "artsVisitor");
          });

          it("And then the audience is made active", () => {
            cy.getLocalStorage()
              .its("audiences.active")
              .should("include", "artsInterestedStudents");
          });
        });
      });
    });
    context("an 'and' condition containing a nested 'or'", () => {
      context("Given I access the home page", () => {
        beforeEach(() => {
          cy.interceptManifest(manifestFixture);
          cy.pageViewVisit("/")
            // wait for manifest stub to be called
            .waitManifest(manifestFixture, `audiences.${dimension}`);
        });
        context(
          "When I navigate through multiple pages to match the signal enough times",
          () => {
            let signal: ISignal;
            beforeEach(() => {
              cy.getContext()
                .waitSignals()
                .then((c: PersonalizationContext) => {
                  // Find a signal in the manifest
                  signal = c.manifest?.signals.find((s) => s.minMatches === 3);

                  // Expect this signal to have been computed
                  expect(c.state.signals?.computed?.[signal.id]).to.exist;

                  // Make required number of visits back and forth to match the signal enough times
                  for (let i = 1; i <= signal.minMatches; i++) {
                    // Our target page that should match the signal
                    cy.contains("Navigate to Arts Home Page").pageViewClick();
                    // Navigate away from our target page so we can test for referrer signals
                    cy.contains("Navigate to Home Page").pageViewClick();

                    cy.getLocalStorage().then((state) => {
                      // Ensure we have matched the signal the expected number of times
                      expect(
                        state.signals?.matched?.[signal.id] || []
                      ).to.have.lengthOf(i);
                      if (i < signal.minMatches)
                        // If we haven't met the minMatches yet we expect the signal to not be active
                        expect(state.signals?.active).to.not.include(signal.id);
                    });
                  }
                });
            });

            it("Then the signal is made active", () => {
              cy.getLocalStorage()
                .its("signals.active")
                .should("include", "frequentArtsVisitor");
            });

            it("And then the audience is made active", () => {
              cy.getLocalStorage()
                .its("audiences.active")
                .should("include", "artsEngagedStudents");
            });
          }
        );
      });
    });
  });
}
