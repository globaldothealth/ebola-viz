import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useLocation } from 'react-router-dom';
import { useState, SyntheticEvent, useEffect } from 'react';
import { selectAppVersion } from 'redux/App/selectors';
import {
    selectCountriesData,
    selectEbolaLoading,
} from 'redux/CountryView/selectors';
import { setCountriesData } from 'redux/CountryView/slice';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import {
    FlagIcon,
    LatestGlobal,
    LocationList,
    LocationListItem,
    CountryLabel,
    CountryCaseCount,
    CaseCountsBar,
    SearchBar,
    SideBarHeader,
    StyledSideBar,
    SideBarTitlesSkeleton,
    CountriesListSkeleton,
    VersionNumber,
    EmptyFlag,
} from './styled';
import { setSelectedCountryInSidebar, setPopup } from 'redux/App/slice';
import { selectSelectedCountryInSideBar } from 'redux/App/selectors';
import {
    getTwoLetterCountryCode,
    getCountryName,
    getTotalCasesNumber,
} from 'utils/helperFunctions';
import { SelectedCountry } from 'models/CountryData';

const SideBar = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();

    const [openSidebar, setOpenSidebar] = useState(true);

    const isLoading = useAppSelector(selectEbolaLoading);
    const selectedCountry = useAppSelector(selectSelectedCountryInSideBar);
    const appVersion = useAppSelector(selectAppVersion);

    const countriesData = useAppSelector(selectCountriesData);
    const [autocompleteData, setAutocompleteData] = useState<SelectedCountry[]>(
        [],
    );
    const [totalCasesNumber, setTotalCasesNumber] = useState(0);

    const regionalView = location.pathname === '/regional';

    useEffect(() => {
        if (isLoading || !countriesData || countriesData.length === 0) return;

        setTotalCasesNumber(getTotalCasesNumber(countriesData));
    }, [countriesData]);

    // Map countries data to autocomplete data
    useEffect(() => {
        let mappedData: { name: string; parentCountry?: string }[] = [];

        if (regionalView) {
            for (const country of countriesData) {
                const districts = country.districts.map((district) => {
                    return { name: district.name, parentCountry: country.name };
                });

                mappedData = [...mappedData, ...districts];
            }
        } else {
            mappedData = countriesData.map((country) => {
                return { name: country.name };
            });
        }

        // Add worldwide option
        mappedData = [{ name: 'worldwide' }, ...mappedData];

        setAutocompleteData(mappedData);
    }, [countriesData, location.pathname]);

    // Sort countries based on number of cases
    useEffect(() => {
        if (!countriesData || countriesData.length === 0) return;

        const sortedCountries = [...countriesData].sort((a, b) =>
            a.totalCases < b.totalCases ? 1 : -1,
        );

        dispatch(setCountriesData(sortedCountries));
        // eslint-disable-next-line
    }, [location.pathname]);

    const handleOnClick = () => {
        setOpenSidebar((value) => !value);
    };

    const handleOnCountryClick = (countryName: string) => {
        if (selectedCountry && countryName === selectedCountry.name) {
            dispatch(setSelectedCountryInSidebar({ name: 'worldwide' }));
            dispatch(setPopup({ isOpen: false, countryName: 'worldwide' }));
        } else {
            dispatch(setSelectedCountryInSidebar({ name: countryName }));
            dispatch(setPopup({ isOpen: true, countryName }));
        }
    };

    const handleAutocompleteCountrySelect = (
        event: SyntheticEvent<Element, Event>,
        value: SelectedCountry | string | null,
    ) => {
        if (value === null || value === '') {
            dispatch(setSelectedCountryInSidebar(null));
        } else if (typeof value === 'string') {
            dispatch(setSelectedCountryInSidebar({ name: value }));
            dispatch(setPopup({ isOpen: true, countryName: value }));
        } else {
            dispatch(setSelectedCountryInSidebar({ name: value.name }));
            dispatch(setPopup({ isOpen: true, countryName: value.name }));
        }
    };

    const Countries = () => {
        if (regionalView) {
            for (const country of countriesData) {
                return (
                    <>
                        {country.districts.map((district) => {
                            const { name, totalCases } = district;

                            const countryCasesCountPercentage =
                                (totalCases / totalCasesNumber) * 100;

                            const isActive = selectedCountry
                                ? selectedCountry.name === name
                                : false;

                            return (
                                <LocationListItem
                                    key={name}
                                    onClick={() => handleOnCountryClick(name)}
                                    data-cy="listed-country"
                                    isActive={isActive}
                                >
                                    <>
                                        <FlagIcon
                                            loading="lazy"
                                            src={`https://flagcdn.com/w20/${getTwoLetterCountryCode(
                                                country.name,
                                            ).toLowerCase()}.png`}
                                            srcSet={`https://flagcdn.com/w40/${getTwoLetterCountryCode(
                                                country.name,
                                            ).toLowerCase()}.png 2x`}
                                            alt={`${country.name} flag`}
                                        />
                                        <CountryLabel
                                            isActive={isActive}
                                            variant="body2"
                                        >
                                            {name}
                                        </CountryLabel>
                                    </>
                                    <CountryCaseCount
                                        isActive={isActive}
                                        variant="body2"
                                    >
                                        {totalCases.toLocaleString()}
                                    </CountryCaseCount>
                                    <CaseCountsBar
                                        barWidth={countryCasesCountPercentage}
                                    />
                                </LocationListItem>
                            );
                        })}
                    </>
                );
            }
        }

        return (
            <>
                {countriesData.map((country) => {
                    const { name, totalCases } = country;

                    const countryCasesCountPercentage =
                        (totalCases / totalCasesNumber) * 100;

                    const isActive = selectedCountry
                        ? selectedCountry.name === name
                        : false;

                    return (
                        <LocationListItem
                            key={name}
                            onClick={() => handleOnCountryClick(name)}
                            data-cy="listed-country"
                            isActive={isActive}
                        >
                            <>
                                <FlagIcon
                                    loading="lazy"
                                    src={`https://flagcdn.com/w20/${getTwoLetterCountryCode(
                                        name,
                                    ).toLowerCase()}.png`}
                                    srcSet={`https://flagcdn.com/w40/${getTwoLetterCountryCode(
                                        name,
                                    ).toLowerCase()}.png 2x`}
                                    alt={`${name} flag`}
                                />
                                <CountryLabel
                                    isActive={isActive}
                                    variant="body2"
                                >
                                    {name}
                                </CountryLabel>
                            </>
                            <CountryCaseCount
                                isActive={isActive}
                                variant="body2"
                            >
                                {totalCases.toLocaleString()}
                            </CountryCaseCount>
                            <CaseCountsBar
                                barWidth={countryCasesCountPercentage}
                            />
                        </LocationListItem>
                    );
                })}
            </>
        );
    };

    return (
        <StyledSideBar sidebaropen={openSidebar} data-cy="sidebar">
            <>
                <SideBarHeader id="sidebar-header">
                    <h1 id="total">
                        {process.env.REACT_APP_DISEASE_NAME?.toUpperCase()} LINE
                        LIST CASES
                    </h1>
                </SideBarHeader>

                <LatestGlobal id="latest-global">
                    {isLoading ? (
                        <SideBarTitlesSkeleton
                            animation="pulse"
                            variant="rectangular"
                            data-cy="loading-skeleton"
                        />
                    ) : (
                        <>
                            <span id="total-cases" className="active">
                                {totalCasesNumber.toLocaleString()}
                            </span>
                            <span className="reported-cases-label">
                                confirmed cases
                            </span>
                        </>
                    )}
                </LatestGlobal>

                <SearchBar className="searchbar">
                    <Autocomplete
                        id="country-select"
                        options={autocompleteData}
                        autoHighlight
                        popupIcon={<></>}
                        disabled={isLoading}
                        getOptionLabel={(option) => {
                            return typeof option === 'string'
                                ? option
                                : option.name;
                        }}
                        onChange={(
                            event,
                            value: SelectedCountry | string | null,
                        ) => handleAutocompleteCountrySelect(event, value)}
                        isOptionEqualToValue={(option, value) =>
                            option.name === value.name
                        }
                        value={selectedCountry}
                        renderOption={(props, option) => (
                            <Box
                                component="li"
                                className="autocompleteBox"
                                {...props}
                            >
                                {option.name === 'worldwide' ? (
                                    <EmptyFlag>-</EmptyFlag>
                                ) : (
                                    <FlagIcon
                                        loading="lazy"
                                        width="20"
                                        src={`https://flagcdn.com/w20/${getTwoLetterCountryCode(
                                            option.parentCountry
                                                ? option.parentCountry
                                                : option.name,
                                        ).toLowerCase()}.png`}
                                        srcSet={`https://flagcdn.com/w40/${getTwoLetterCountryCode(
                                            option.parentCountry
                                                ? option.parentCountry
                                                : option.name,
                                        ).toLowerCase()}.png 2x`}
                                        alt={`${option} flag`}
                                    />
                                )}

                                {option.name}
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Choose a country"
                                inputProps={{
                                    ...params.inputProps,
                                    'data-cy': 'autocomplete-input',
                                }}
                            />
                        )}
                    />
                </SearchBar>

                <LocationList>
                    {isLoading ? (
                        <CountriesListSkeleton
                            animation="pulse"
                            variant="rectangular"
                            data-cy="loading-skeleton"
                        />
                    ) : (
                        <>
                            <LocationListItem
                                onClick={() =>
                                    handleOnCountryClick('worldwide')
                                }
                                data-cy="listed-country"
                                isActive={
                                    selectedCountry
                                        ? selectedCountry.name === 'worldwide'
                                        : true
                                }
                            >
                                <>
                                    <EmptyFlag>-</EmptyFlag>
                                    <CountryLabel
                                        isActive={
                                            selectedCountry
                                                ? selectedCountry.name ===
                                                  'worldwide'
                                                : true
                                        }
                                        variant="body2"
                                    >
                                        {getCountryName('worldwide')}
                                    </CountryLabel>
                                </>
                                <CountryCaseCount
                                    isActive={
                                        selectedCountry
                                            ? selectedCountry.name ===
                                              'worldwide'
                                            : true
                                    }
                                    variant="body2"
                                >
                                    {totalCasesNumber.toLocaleString()}
                                </CountryCaseCount>
                            </LocationListItem>

                            <Countries />
                        </>
                    )}
                </LocationList>
            </>

            <div id="sidebar-tab" onClick={handleOnClick}>
                <span id="sidebar-tab-icon">{openSidebar ? '◀' : '▶'}</span>
            </div>

            {appVersion && (
                <VersionNumber
                    href={`https://github.com/globaldothealth/list/releases/tag/${appVersion}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    Version: {appVersion}
                </VersionNumber>
            )}
        </StyledSideBar>
    );
};

export default SideBar;
