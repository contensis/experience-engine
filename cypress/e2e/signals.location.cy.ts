describe(`Match Signals via location attributes`, () => {
  const manifestFixture = `signals.location-manifest.json`;
  context("Given I access the home page", () => {
    beforeEach(() => {
      cy.interceptManifest(manifestFixture);
      cy.pageViewVisit("/").waitManifest(manifestFixture, `location`);
    });

    context(`When the manifest has loaded`, () => {
      it("Then the location.country signal attribute is available", () => {
        cy.getContext()
          .its("signals.attributes")
          .then(({ ["location.country"]: country }) => {
            expect(country).to.exist;
            expect(country).to.equal("NG");
          });
      });
      it("And the location.ip signal attribute is available", () => {
        cy.getContext()
          .its("signals.attributes")
          .then(({ ["location.ip"]: ip }) => {
            expect(ip).to.exist;
            expect(ip).to.equal("192.168.0.100");
          });
      });
      it("And the attributes are saved in session storage", () => {
        cy.getSessionStorage()
          .its("location")
          .then(({ country, ip }) => {
            expect(country).to.exist;
            expect(country).to.equal("NG");
            expect(ip).to.exist;
            expect(ip).to.equal("192.168.0.100");
          });
      });
    });
    context(`When the signals have been calculated`, () => {
      it("Then the signal based on the country code is activated", () => {
        cy.getLocalStorage()
          .its("signals.active")
          .should("include", "disallowCountry");
      });

      it("And the signal based on the IP range is activated", () => {
        cy.getLocalStorage()
          .its("signals.active")
          .should("include", "partnerOrganisationIp");
      });
    });
  });
});
