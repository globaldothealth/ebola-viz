import iso from 'iso-3166-1';
import { CountriesData, EbolaCaseData } from 'models/CountryData';
import { ChartData } from 'models/ChartData';
import { compareAsc } from 'date-fns';

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

// CHART
export const getChartData = (
    countries: string[],
    ebolaData: EbolaCaseData[],
): ChartData => {
    const chartData: ChartData = [];

    for (const country of countries) {
        const countryData = ebolaData.filter(
            (data) => data.country && data.country === country,
        );

        const dates = countryData.map((data) => data.date);
        // remove duplicate dates
        const uniqueDates = dates
            .map((date) => date && date.getTime())
            .filter((date, i, arr) => arr.indexOf(date) === i)
            .map((date) => date && new Date(date));

        // sort dates
        const sortedDates = uniqueDates.sort((dateA, dateB) =>
            dateA && dateB && compareAsc(dateA, dateB) === 1 ? 1 : -1,
        );

        // count cases for each date
        const countryChartData: { date: Date; caseCount: number }[] = [];
        for (const date of sortedDates) {
            if (date) {
                let caseCount = 0;

                countryData.forEach((data) => {
                    if (data.date && data.date.getTime() === date.getTime()) {
                        caseCount += 1;
                    }
                });

                countryChartData.push({ date, caseCount });
            }
        }

        chartData[country] = countryChartData;
    }

    return chartData;
};
