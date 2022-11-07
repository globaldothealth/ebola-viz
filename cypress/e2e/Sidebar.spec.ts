describe('<SideBar />', () => {
    beforeEach(() => {
        cy.intercept(
            'GET',
            'https://ebola-gh.s3.eu-central-1.amazonaws.com/latest.csv',
            { fixture: 'countriesData.csv', statusCode: 200 },
        ).as('fetchCountriesData');
    });

    it('Displays navbar, hides navbar', () => {
        cy.visit('/');

        cy.get('[data-cy="sidebar"]').should('be.visible');

        cy.contains('EBOLA LINE LIST CASES');
        cy.get('#sidebar-tab-icon').should('be.visible').click();

        cy.get('[data-cy="sidebar"]').should('not.be.visible');
        cy.contains('EBOLA LINE LIST CASES').should('not.be.visible');

        cy.get('#sidebar-tab-icon').click();

        cy.get('[data-cy="sidebar"]').should('be.visible');
    });

    it('Displays loading skeleton while feetching data', () => {
        cy.intercept(
            'GET',
            'https://ebola-gh.s3.eu-central-1.amazonaws.com/latest.csv',
            { fixture: 'countriesData.csv', statusCode: 200, delay: 3000 },
        ).as('fetchCountriesData');

        cy.visit('/');

        cy.get('[data-cy="loading-skeleton"]').should('have.length', 3);

        cy.wait('@fetchCountriesData', { timeout: 15000 });

        cy.get('[data-cy="loading-skeleton"]').should('not.exist');
        cy.contains(/Uganda/i);
    });

    it('Countries list dropdown opens', () => {
        cy.visit('/');

        cy.get('.searchbar')
            .should('be.visible')
            .click()
            .type('Uganda{downarrow}{enter}');
    });

    it('Updates value in autocomplete field after selecting country from the Sidebar', () => {
        cy.visit('/');

        cy.wait('@fetchCountriesData');

        cy.get('[data-cy="autocomplete-input"').should('have.value', '');
        const listedCountries = cy.get('[data-cy="listed-country"]');
        listedCountries.should('have.length.gte', 2);

        cy.contains(/Uganda/i).click({ force: true });

        cy.get('[data-cy="autocomplete-input"').should('have.value', 'Uganda');
    });
});
