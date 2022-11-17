describe('<ChartView />', () => {
    beforeEach(() => {
        cy.intercept(
            'GET',
            'https://ebola-gh.s3.eu-central-1.amazonaws.com/latest.csv',
            { fixture: 'countriesData.csv', statusCode: 200 },
        ).as('fetchCountriesData');
    });

    it('Displays chart', () => {
        cy.visit('/');
        cy.contains('Chart View').click();

        cy.contains(/Total confirmed cases: Worldwide/);
        cy.get('svg.recharts-surface').should('be.visible');
    });

    it('Can select specific countries from the Sidebar', () => {
        cy.visit('/');

        cy.wait('@fetchCountriesData');

        cy.contains('Chart View').click();

        cy.contains(/Total confirmed cases: Worldwide/i);

        cy.contains(/Uganda/i).click();

        cy.contains(/Total confirmed cases: Worldwide/i).should('not.exist');
        cy.contains(/Total confirmed cases: Uganda/i);
    });
});
