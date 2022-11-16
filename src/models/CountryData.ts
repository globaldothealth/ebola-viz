export interface CountryDataRow {
    [key: string]: {
        suspected: number;
        confirmed: number;
    };
}

export interface ParsedCountryDataRow {
    name: string;
    suspected: number;
    confirmed: number;
    combined: number;
}

export interface TotalCasesValues {
    total: number;
    confirmed: number;
}

export interface SelectedCountry {
    name: string;
    parentCountry?: string;
}

/**
 * Timeseries
 */
export interface TimeseriesCountryDataRow {
    date: Date;
    cases: number;
    cumulativeCases: number;
    country: string;
}

export interface TimeseriesCaseCountsDataRow {
    date: Date;
    cases: number;
    cumulativeCases: number;
}

// EBOLA
export enum CaseStatus {
    Confirmed = 'Confirmed',
    Probable = 'Probable',
}

export interface EbolaCaseData {
    id: number;
    pathogenStatus?: string;
    caseStatus?: CaseStatus;
    location?: string;
    city?: string;
    country?: string;
    date?: Date;
    lastModifiedDate?: Date;
}

// this is the model used throughout the app
export interface CountriesData {
    name: string;
    totalCases: number;
    districts: { name: string; totalCases: number }[];
}

// data format in the orignal CSV file
export interface EbolaIncomingData {
    ID: number;
    Pathogen_status?: string;
    Case_status?: CaseStatus;
    Location?: string;
    City?: string;
    Country?: string;
    Date_confirmation?: string;
    Date_last_modified?: string;
}
