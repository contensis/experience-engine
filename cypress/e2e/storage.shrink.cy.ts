import { str5198k } from "../fixtures/localStorage-string-5198k";

describe("Shrink Personalisation store", () => {
  context("Given my localStorage is near to the maximum size limit", () => {
    beforeEach(() => {
      cy.window().then((window) => {
        window.localStorage.setItem("cxp", str5198k);
      });
      cy.interceptManifest("storage.shrink-manifest.json");
      cy.getLocalStorage().then((state) => {
        const stateStr = JSON.stringify(state);
        expect(stateStr.length).to.be.greaterThan(1048576);
      });
      cy.pageViewVisit("/");
    });

    it("When I access the home page", () => {
      cy.getLocalStorage().then((state) => {
        const stateStr = JSON.stringify(state);
        expect(state.cxpid).to.exist;
        expect(stateStr.length).to.be.greaterThan(0).and.lessThan(1048576);
      });
    });

    it("Then localStorage should be shrunk to prevent quota errors", () => {
      cy.getLocalStorage().then((state) => {
        const stateStr = JSON.stringify(state);
        expect(stateStr.length).to.be.greaterThan(0).and.lessThan(1048576);
      });
    });
  });
});
