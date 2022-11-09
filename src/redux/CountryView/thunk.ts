import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    EbolaCaseData,
    EbolaIncomingData,
    CountriesData,
} from 'models/CountryData';
import Papa from 'papaparse';
import { compareDesc } from 'date-fns';
import enUSLocale from 'date-fns/locale/en-US';
import { formatInTimeZone } from 'date-fns-tz';

export const fetchCountriesData = createAsyncThunk<
    {
        countriesData: CountriesData[];
        countries: string[];
        lastModifiedDate: string | null;
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
        if (latestFile.status !== 200) throw new Error();
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
                lastModifiedDate: data.Date_last_modified
                    ? new Date(data.Date_last_modified)
                    : undefined,
            };
        });

        // get only confirmed cases
        const confirmedData = ebolaData.filter(
            (data) => data.caseStatus === 'Confirmed',
        );

        const countriesData: CountriesData[] = [];
        const countries: string[] = [];
        confirmedData.map((data) =>
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
            const districts = confirmedData
                .filter((data) => data.country === country)
                .map((caseItem) => caseItem.location ?? '');
            const uniqueDistricts = [...new Set(districts)];
            const filteredDistricts = uniqueDistricts.filter(
                (district) => district !== '',
            );

            // count the cases for each district
            const districtsArr: { name: string; totalCases: number }[] = [];
            filteredDistricts.forEach((district) => {
                const array = confirmedData.filter(
                    (data) => data.location === district,
                );

                districtsArr.push({
                    name: district,
                    totalCases: array.length,
                });
            });

            // sort the districts based on case counts
            districtsArr.sort((a, b) => (a.totalCases < b.totalCases ? 1 : -1));

            countriesData.push({
                name: country,
                totalCases: districts.length, // here we take the length of unfiltered districts array in order to include cases without provided district into total country's case count
                districts: districtsArr,
            });
        }

        // get last modified date

        // parse dates and remove duplicates
        const lastModifiedDates = confirmedData
            .map(
                (data) =>
                    data.lastModifiedDate && data.lastModifiedDate.getTime(),
            )
            .filter((date, i, arr) => arr.indexOf(date) === i)
            .map((date) => date && new Date(date));

        // sort the dates
        const sortedDates = lastModifiedDates.sort((dateA, dateB) =>
            dateA && dateB && compareDesc(dateA, dateB) === 1 ? 1 : -1,
        );

        const lastModifiedDate =
            sortedDates[0] &&
            formatInTimeZone(sortedDates[0], 'Europe/Berlin', 'E LLL d yyyy', {
                locale: enUSLocale,
            });

        return {
            countriesData,
            countries,
            lastModifiedDate: lastModifiedDate ? lastModifiedDate : null,
        };
    } catch (error: any) {
        if (error.response)
            return rejectWithValue(error.response.message as string);

        throw error;
    }
});
