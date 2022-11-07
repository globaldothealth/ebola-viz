import type { RootState } from 'redux/store';

export const selectIsLoading = (state: RootState) => state.app.isLoading;
export const selectError = (state: RootState) => state.app.error;
export const selectSelectedCountryInSideBar = (state: RootState) =>
    state.app.selectedCountryInSideBar;
export const selectAppVersion = (state: RootState) => state.app.appVersion;
export const selectPopupData = (state: RootState) => state.app.popup;
