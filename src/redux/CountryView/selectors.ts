import { RootState } from 'redux/store';

export const selectEbolaLoading = (state: RootState) =>
    state.countryView.isLoading;
export const selectCountriesData = (state: RootState) =>
    state.countryView.countriesData;
export const selectCountries = (state: RootState) =>
    state.countryView.countries;
export const selectEbolaLoadingError = (state: RootState) =>
    state.countryView.error;
export const selectLastModifiedDate = (state: RootState) =>
    state.countryView.lastModifiedDate;
