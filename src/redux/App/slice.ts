import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchAppVersion } from './thunks';
import { SelectedCountry } from 'models/CountryData';

interface IPopup {
    isOpen: boolean;
    countryName: string;
}

interface AppState {
    isLoading: boolean;
    isMapLoading: boolean;
    error: string | undefined;
    selectedCountryInSideBar: SelectedCountry | null;
    appVersion: string | undefined;
    popup: IPopup;
}

const initialState: AppState = {
    isLoading: false,
    isMapLoading: false,
    error: undefined,
    selectedCountryInSideBar: null,
    appVersion: undefined,
    popup: {
        isOpen: false,
        countryName: '',
    },
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setIsMapLoading: (state, action: PayloadAction<boolean>) => {
            state.isMapLoading = action.payload;
        },
        setSelectedCountryInSidebar: (
            state,
            action: PayloadAction<SelectedCountry | null>,
        ) => {
            state.selectedCountryInSideBar = action.payload;
        },
        setPopup: (state, action: PayloadAction<IPopup>) => {
            state.popup = action.payload;
        },
    },
    extraReducers: (builder) => {
        // App version
        builder.addCase(fetchAppVersion.fulfilled, (state, action) => {
            state.appVersion = action.payload;
        });
    },
});

export const { setIsMapLoading, setSelectedCountryInSidebar, setPopup } =
    appSlice.actions;

export default appSlice.reducer;
