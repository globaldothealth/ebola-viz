describe('<CountryView />', () => {
    it('Displays map and legend', () => {
        cy.intercept(
            'GET',
            'https://ebola-gh.s3.eu-central-1.amazonaws.com/latest.csv',
            { fixture: 'countriesData.csv', statusCode: 200 },
        ).as('fetchCountriesData');

        cy.visit('/');

        cy.wait('@fetchCountriesData', { timeout: 15000 });

        cy.get('.mapboxgl-canvas').should('be.visible');
        cy.contains('Confirmed cases').should('be.visible');
    });
});
