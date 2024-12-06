import { ISignal, PersonalizationContext } from "@contensis/personalization";

describe("Signals", () => {
  for (const attribute of ["page.path", "page.querystring"]) {
    context(`${attribute}`, () => {
      context("Given I access the home page", () => {
        beforeEach(() => {
          cy.interceptManifest(`signals.${attribute}-manifest.json`);
          cy.pageViewVisit("/").getContext();
        });

        context("When I navigate to a page that matches a signal", () => {
          beforeEach(() => {
            cy.contains("Navigate to Arts Home Page").pageViewClick();
          });

          it("Then the signal rules are available in the manifest", () => {
            cy.waitUntil(() =>
              cy.getLocalStorage().then((state) => !!state.manifest)
            ).then(() => {
              cy.getLocalStorage().then((state) => {
                const signal = state.manifest?.signals.find(
                  (s) => s.minMatches === 3
                );
                expect(signal).to.exist;
              });
            });
          });

          it("And the matched signal is recorded and persisted in localStorage", () => {
            cy.getLocalStorage().then((state) => {
              const signal = state.manifest?.signals.find(
                (s) => s.minMatches === 3
              );
              expect(state.signals?.computed?.[signal.id]).to.exist;
              expect(state.signals?.matched?.[signal.id]).to.have.lengthOf(1);
              cy.log(
                `Matched signal: ${signal.id}`,
                JSON.stringify(state.signals.matched?.[signal.id])
              );
            });
          });

          it("And the matched signal is not active", () => {
            cy.getLocalStorage().then((state) => {
              expect(state.signals?.active).to.be.empty;
            });
          });
        });

        context(
          "When I navigate to multiple pages that match a signal enough times",
          () => {
            let signal: ISignal;
            beforeEach(() => {
              cy.getContext().then((c: PersonalizationContext) => {
                // Find a signal in the manifest
                signal = c.manifest?.signals.find((s) => s.minMatches === 3);

                // Expect this signal to have been computed
                expect(c.state.signals?.computed?.[signal.id]).to.exist;

                // Make required number of visits back and forth to match the signal enough times
                for (let i = 1; i <= signal.minMatches; i++) {
                  cy.contains("Navigate to Arts Home Page").pageViewClick();

                  cy.getLocalStorage().then((state) => {
                    // Ensure we have matched the signal the expected number of times
                    expect(
                      state.signals?.matched?.[signal.id]
                    ).to.have.lengthOf(i);
                    if (i < signal.minMatches)
                      // If we haven't met the minMatches yet we expect the signal to not be active
                      expect(state.signals?.active).to.not.include(signal.id);
                  });

                  cy.contains("Navigate to Home Page").pageViewClick();
                }
              });
            });

            it("Then the signal is made active", () => {
              cy.getLocalStorage()
                .its("signals.active")
                .should("include", signal.id);
            });
          }
        );

        context.only(
          "When I make separate visits to pages that match a signal enough times",
          () => {
            let signal: ISignal;
            beforeEach(() => {
              cy.getContext().then((c: PersonalizationContext) => {
                signal = c.manifest?.signals.find((s) => s.minMatches === 3);
                expect(signal).to.exist;
                expect(c.state.signals?.computed?.[signal.id]).to.exist;

                for (let i = 1; i <= signal.minMatches; i++) {
                  cy.pageViewVisit("/arts/home?field1");
                  cy.contains("Navigate to Home Page").pageViewClick();
                  cy.contains("External URL").click();

                  // cy.visit("https://duckduckgo.com");

                  // inject a link into the external page so we can link back to ourselves
                  cy.injectLink("Link back to my home");

                  cy.contains("Link back to my home").pageViewClick();
                  //cy.pageViewVisit("/")
                  cy.getContext()
                    .its("manifest")
                    .should("exist")
                    .then(() => {
                      // cy.contains("Navigate to Page 1").pageViewClick();
                      cy.getContext()
                        .its("signals")
                        .getLocalStorage()
                        .then((state) => {
                          const signalMatches =
                            state.signals?.matched?.[signal.id] || [];

                          expect(signalMatches).to.have.lengthOf(i);

                          if (i < signal.minMatches)
                            expect(state.signals?.active).to.not.include(
                              signal.id
                            );
                        });
                    });
                }
              });
            });

            it("Then the signal is made active", () => {
              cy.getLocalStorage()
                .its("signals.active")
                .should("include", signal.id);
            });
          }
        );
      });
    });
  }
});
