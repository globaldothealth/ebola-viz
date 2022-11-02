import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CountriesData } from 'models/CountryData';
import { fetchCountriesData } from './thunk';

interface CountryViewState {
    isLoading: boolean;
    countriesData: CountriesData[];
    countries: string[];
    error: string | undefined;
}

const initialState: CountryViewState = {
    isLoading: false,
    countriesData: [],
    countries: [],
    error: undefined,
};

const countryViewSlice = createSlice({
    name: 'countryView',
    initialState,
    reducers: {
        setCountriesData: (state, action: PayloadAction<CountriesData[]>) => {
            state.countriesData = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCountriesData.pending, (state) => {
            state.isLoading = true;
            state.error = undefined;
        });
        builder.addCase(
            fetchCountriesData.fulfilled,
            (
                state,
                {
                    payload,
                }: PayloadAction<{
                    countriesData: CountriesData[];
                    countries: string[];
                }>,
            ) => {
                state.isLoading = false;
                state.countriesData = payload.countriesData;
                state.countries = payload.countries;
            },
        );
        builder.addCase(fetchCountriesData.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload
                ? action.payload
                : action.error.message;
        });
    },
});

export const { setCountriesData } = countryViewSlice.actions;

export default countryViewSlice.reducer;
