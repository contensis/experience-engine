import { ISignal, PersonalizationContext } from "@contensis/personalization";

describe("Personalisation basics: Signals and audiences", () => {
  context("Given I access the home page", () => {
    beforeEach(() => {
      cy.fixture("url-manifest.json").then((manifest) => {
        cy.intercept(
          "GET",
          "https://cms-cypress-test.cloud.contensis.com/api/delivery/projects/website/personalization/manifest/current",
          manifest
        );
      });
      cy.pageViewVisit("/");
    });

    it("When a personalisation context is available", () => {
      cy.getContext().then((c) => {
        expect(c).to.exist;
      });
    });

    it("Then I should have a visitorId and a random percentile persisted", () => {
      cy.getLocalStorage().then((state) => {
        expect(state.cpid).to.exist;
        expect(state.pc).to.be.greaterThan(0).and.lessThan(10000);
      });
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

    context("When I navigate to a page that matches a signal", () => {
      beforeEach(() => {
        cy.contains("Navigate to Arts Home Page").pageViewClick();
      });

      it("Then the signal rules are available in the manifest", () => {
        cy.getLocalStorage().then((state) => {
          const signal = state.manifest?.signals.find(
            (s) => s.minMatches === 3
          );
          expect(state.signals?.computed[signal.id]).to.exist;
          expect(state.signals?.matched[signal.id]).to.have.lengthOf(1);
          cy.log(
            `Matched signal: ${signal.id}`,
            JSON.stringify(state.signals.matched[signal.id])
          );
        });
      });

      it("And the matched signal is recorded and persisted in localStorage", () => {
        cy.getLocalStorage().then((state) => {
          const signal = state.manifest?.signals.find(
            (s) => s.minMatches === 3
          );
          expect(state.signals?.computed[signal.id]).to.exist;
          expect(state.signals?.matched[signal.id]).to.have.lengthOf(1);
          cy.log(
            `Matched signal: ${signal.id}`,
            JSON.stringify(state.signals.matched[signal.id])
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
            signal = c.manifest?.signals.find((s) => s.minMatches === 3);
            expect(c.state.signals?.computed[signal.id]).to.exist;

            for (let i = 1; i <= signal.minMatches; i++) {
              cy.contains("Navigate to Arts Home Page").pageViewClick();
              cy.contains("Navigate to Home Page").pageViewClick();

              cy.getLocalStorage().then((state) => {
                expect(state.signals?.matched[signal.id]).to.have.lengthOf(i);
                if (i < signal.minMatches)
                  expect(state.signals?.active).to.not.include(signal.id);
              });
            }
          });
        });

        it("Then the signal is made active", () => {
          cy.getLocalStorage().then((state) => {
            expect(state.signals?.active).to.include(signal.id);
            const { manifest, ...logState } = state;
            cy.log(`Stored state is: ${JSON.stringify(logState)}`);
          });
        });
      }
    );

    context(
      "When I make separate visits to pages that match a signal enough times",
      () => {
        let signal: ISignal;
        beforeEach(() => {
          cy.getContext().then((c: PersonalizationContext) => {
            signal = c.manifest?.signals.find((s) => s.minMatches === 3);
            expect(c.state.signals?.computed[signal.id]).to.exist;

            for (let i = 1; i <= signal.minMatches; i++) {
              cy.pageViewVisit("/arts/home");
              cy.visit("https://duckduckgo.com");

              cy.pageViewVisit("/")
                .window()
                .its("document")
                .then((document) => cy.log(`${document.referrer}`));
              cy.getLocalStorage().then((state) => {
                expect(state.signals?.matched[signal.id]).to.have.lengthOf(i);
                if (i < signal.minMatches)
                  expect(state.signals?.active).to.not.include(signal.id);
              });
            }
          });
        });

        it("Then the signal is made active", () => {
          cy.getLocalStorage().then((state) => {
            expect(state.signals?.active).to.include(signal.id);
            const { manifest, ...logState } = state;
            cy.log(`Stored state is: ${JSON.stringify(logState)}`);
          });
        });
      }
    );
  });
});
