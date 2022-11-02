import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    EbolaCaseData,
    EbolaIncomingData,
    CountriesData,
} from 'models/CountryData';
import Papa from 'papaparse';

export const fetchCountriesData = createAsyncThunk<
    {
        countriesData: CountriesData[];
        countries: string[];
    },
    void,
    { rejectValue: string }
>('countryView/fetchCountriesData', async (_, { rejectWithValue }) => {
    try {
        const dataUrl = process.env.REACT_APP_COUNTRY_VIEW_DATA_URL;

        if (!dataUrl) {
            throw new Error('Data url missing');
        }

        // convert csv to json
        const latestFile = await fetch(dataUrl);
        const reader = latestFile.body?.getReader();
        const result = await reader?.read();
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result?.value);
        const results = Papa.parse(csv, { header: true });
        const dataRows = results.data as EbolaIncomingData[];

        // parse the data to correct type
        const ebolaData: EbolaCaseData[] = dataRows.map((data) => {
            return {
                id: data.ID,
                pathogenStatus: data.Pathogen_status,
                caseStatus: data.Case_status,
                location: data.Location
                    ? data.Location.replace('District', '').trim()
                    : undefined,
                city: data.City,
                country: data.Country,
                confirmationDate: data.Date_confirmation
                    ? new Date(data.Date_confirmation)
                    : undefined,
            };
        });

        const countriesData: CountriesData[] = [];
        const countries: string[] = [];
        ebolaData.map((data) =>
            countries.push(data.country ? data.country : ''),
        );
        // remove all the duplicates
        const uniqueCountries = [...new Set(countries)];
        // remove empty strings
        const filteredCountries = uniqueCountries.filter(
            (country) => country !== '',
        );

        // get all the districts for a country
        for (const country of filteredCountries) {
            const districts = ebolaData
                .filter((data) => data.country === country)
                .map((caseItem) => caseItem.location ?? '');
            const uniqueDistricts = [...new Set(districts)];
            const filteredDistricts = uniqueDistricts.filter(
                (district) => district !== '',
            );

            // count the cases for each district
            const districtsArr: { name: string; totalCases: number }[] = [];
            filteredDistricts.forEach((district) => {
                const array = ebolaData.filter(
                    (data) => data.location === district,
                );

                districtsArr.push({
                    name: district,
                    totalCases: array.length,
                });
            });

            const totalCases = districtsArr.reduce(
                (previousValue, currentValue) =>
                    previousValue + currentValue.totalCases,
                0,
            );

            // sort the districts based on case counts
            districtsArr.sort((a, b) => (a.totalCases < b.totalCases ? 1 : -1));

            countriesData.push({
                name: country,
                totalCases,
                districts: districtsArr,
            });
        }

        return { countriesData, countries };
    } catch (error: any) {
        if (error.response) return rejectWithValue(error.response.message);

        throw error;
    }
});
