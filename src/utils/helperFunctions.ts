import iso from 'iso-3166-1';
import { CountriesData } from 'models/CountryData';

// Parses search query that takes user to Curator Portal
export const parseSearchQuery = (searchQuery: string): string => {
    const parsedQuery = searchQuery.includes(' ')
        ? `"${searchQuery}"`
        : searchQuery;

    const encodedQuery = encodeURIComponent(parsedQuery);

    return encodedQuery;
};

export enum Env {
    Local = 'local',
    Dev = 'dev',
    Prod = 'prod',
    Qa = 'qa',
}

// Get data portal url based on current env
export const getDataPortalUrl = (env: Env) => {
    switch (env) {
        case Env.Local:
            return 'http://localhost:3002';
        case Env.Dev:
            return 'https://dev-data.covid-19.global.health';
        case Env.Qa:
            return 'https://qa-data.covid-19.global.health';
        case Env.Prod:
            return 'https://data.covid-19.global.health';
    }
};

// Returns two letter country code based on the country name
export const getTwoLetterCountryCode = (name: string) => {
    const countryObj = iso.whereCountry(name);
    return countryObj ? countryObj.alpha2 : 'N/A';
};

export const getTotalCasesNumber = (countriesData: CountriesData[]): number => {
    const totalCases = countriesData.reduce(
        (prev, current) => prev + current.totalCases,
        0,
    );

    return totalCases;
};
