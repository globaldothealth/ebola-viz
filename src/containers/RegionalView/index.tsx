import ReactDOM from 'react-dom';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useMapboxMap } from 'hooks/useMapboxMap';
import { useAppSelector, useAppDispatch } from 'redux/hooks';
import {
    selectSelectedCountryInSideBar,
    selectPopupData,
} from 'redux/App/selectors';
import { setSelectedCountryInSidebar, setPopup } from 'redux/App/slice';

import admin1LookupTable from 'data/mapbox-boundaries-adm1-v3_3.json';
import countriesLookupTable from 'data/admin0-lookup-table.json';
import { CountryViewColors } from 'models/Colors';
import mapboxgl from 'mapbox-gl';
import Legend from 'components/Legend';
import { LegendRow } from 'models/LegendRow';
import MapPopup from 'components/MapPopup';

import { MapContainer } from 'theme/globalStyles';
import Loader from 'components/Loader';
import { PopupContentText } from './styled';
import { getTwoLetterCountryCode } from 'utils/helperFunctions';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
    selectEbolaLoading,
    selectCountriesData,
} from 'redux/CountryView/selectors';

const dataLayers: LegendRow[] = [
    { label: '0 or no data', color: CountryViewColors['NoData'] },
    { label: '<10', color: CountryViewColors['<10'] },
    { label: '10-20', color: CountryViewColors['10-20'] },
    { label: '21-50', color: CountryViewColors['21-50'] },
    { label: '51-100', color: CountryViewColors['51-100'] },
    { label: '>100', color: CountryViewColors['>100'] },
];

const RegionalView: React.FC = () => {
    const dispatch = useAppDispatch();

    const mapboxAccessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || '';

    const isLoading = useAppSelector(selectEbolaLoading);
    const countriesData = useAppSelector(selectCountriesData);
    const selectedCountry = useAppSelector(selectSelectedCountryInSideBar);
    const popupData = useAppSelector(selectPopupData);

    const [mapLoaded, setMapLoaded] = useState(false);
    const [currentPopup, setCurrentPopup] = useState<mapboxgl.Popup>();
    const [dragging, setDragging] = useState(false);

    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useMapboxMap(mapboxAccessToken, mapContainer);

    const smallScreen = useMediaQuery('(max-width:1400px)');

    const admin1LookupData = useMemo(() => {
        const data: { [key: string]: any } = [];

        for (const country of countriesData) {
            for (const district of country.districts) {
                const districtRow = admin1LookupTable.find(
                    (data) =>
                        data.iso_3166_1 ===
                            getTwoLetterCountryCode(country.name) &&
                        data.name === district.name,
                );

                if (districtRow) {
                    data[district.name] = districtRow;
                }
            }
        }

        return data;
    }, [countriesData]);

    useEffect(() => {
        if (!countriesData) return;

        const mapRef = map.current;
        if (!mapRef) return;

        const typedCountriesLookupTable = countriesLookupTable.adm0.data
            .all as {
            [key: string]: any;
        };

        const uganda =
            typedCountriesLookupTable[getTwoLetterCountryCode('Uganda')];
        if (!uganda) return;

        mapRef.fitBounds(uganda.bounds);

        // on some browsers the blank space is added below the body element when using fitBounds function
        // this is to manually scroll to top of the page where map is located
        setTimeout(() => {
            scrollTo(0, 0);
        }, 100);
    }, [countriesData]);

    useEffect(() => {
        if (
            !dragging ||
            !selectedCountry ||
            selectedCountry.name === 'worldwide'
        )
            return;

        dispatch(setSelectedCountryInSidebar(null));
        if (currentPopup) currentPopup.remove();
    }, [dragging]);

    // Fly to district
    useEffect(() => {
        if (
            !selectedCountry ||
            !admin1LookupData ||
            Object.keys(admin1LookupData).length === 0
        )
            return;

        const { name } = selectedCountry;

        if (name === 'worldwide') {
            map.current?.setCenter([0, 40]);
            map.current?.setZoom(2.5);

            return;
        }

        const bounds = admin1LookupData[name].bounds
            .replace('[', '')
            .replace(']', '')
            .split(',');
        map.current?.fitBounds(bounds);

        // on some browsers the blank space is added below the body element when using fitBounds function
        // this is to manually scroll to top of the page where map is located
        setTimeout(() => {
            scrollTo(0, 0);
        }, 100);
    }, [selectedCountry, admin1LookupData]);

    // Setup map
    useEffect(() => {
        const mapRef = map.current;
        if (!mapRef || isLoading) return;

        mapRef.on('load', () => {
            createViz();
        });
    }, [isLoading]);

    const createViz = () => {
        const mapRef = map.current;
        if (!mapRef || isLoading) return;

        if (mapRef.getLayer('admin1Join')) {
            mapRef.removeLayer('admin1Join');
        }

        if (mapRef.getSource('admin1Data')) {
            mapRef.removeSource('admin1Data');
        }

        mapRef.addSource('admin1Data', {
            type: 'vector',
            url: 'mapbox://mapbox.boundaries-adm1-v3',
        });

        const setData = () => {
            for (const country of countriesData) {
                for (const district of country.districts) {
                    mapRef.setFeatureState(
                        {
                            source: 'admin1Data',
                            sourceLayer: 'boundaries_admin_1',
                            id: admin1LookupData[district.name].feature_id,
                        },
                        {
                            name: district.name,
                            numberOfCases: district.totalCases,
                        },
                    );
                }
            }
        };

        // Check if `adm1Data` source is loaded.
        const setAfterLoad = (event: any) => {
            if (event.sourceID !== 'admin1Data' && !event.isSourceLoaded)
                return;
            setData();
            setMapLoaded(true);
            mapRef.off('sourcedata', setAfterLoad);
        };

        // If `adm1Data` source is loaded, call `setStates()`.
        if (mapRef.isSourceLoaded('admin1Data')) {
            setData();
            setMapLoaded(true);
        } else {
            mapRef.on('sourcedata', setAfterLoad);
        }

        mapRef.addLayer(
            {
                id: 'admin1Join',
                type: 'fill',
                source: 'admin1Data',
                'source-layer': 'boundaries_admin_1',
                paint: {
                    'fill-color': [
                        'case',
                        ['!=', ['feature-state', 'numberOfCases'], null],
                        [
                            'case',
                            ['==', ['feature-state', 'numberOfCases'], 0],
                            CountryViewColors.Fallback,
                            ['<', ['feature-state', 'numberOfCases'], 10],
                            CountryViewColors['<10'],
                            ['<=', ['feature-state', 'numberOfCases'], 20],
                            CountryViewColors['10-20'],
                            ['<=', ['feature-state', 'numberOfCases'], 50],
                            CountryViewColors['21-50'],
                            ['<=', ['feature-state', 'numberOfCases'], 100],
                            CountryViewColors['51-100'],
                            ['>', ['feature-state', 'numberOfCases'], 100],
                            CountryViewColors['>100'],
                            CountryViewColors.Fallback,
                        ],
                        CountryViewColors.Fallback,
                    ],
                },
            },
            'waterway-label',
        );

        // Change the mouse cursor to pointer when hovering above this layer
        mapRef.on('mouseenter', 'admin1Join', () => {
            mapRef.getCanvas().style.cursor = 'pointer';
        });

        mapRef.on('mouseleave', 'admin1Join', () => {
            mapRef.getCanvas().style.cursor = '';
        });

        // Add click listener and show popups
        mapRef.on('click', 'admin1Join', (e) => {
            if (!e.features || !e.features[0].state.name) return;

            const countryName = e.features[0].state.name;

            dispatch(setSelectedCountryInSidebar({ name: countryName }));
            dispatch(setPopup({ isOpen: true, countryName }));
        });

        mapRef.on('dragstart', () => {
            setDragging(true);
        });
        mapRef.on('dragend', () => {
            setDragging(false);
        });

        //Filter out countries without any data
        mapRef.setFilter('admin1Join', [
            'in',
            'iso_3166_1',
            ...countriesData.map((country) =>
                getTwoLetterCountryCode(country.name),
            ),
        ]);
    };

    // Display popup on the map
    useEffect(() => {
        const { countryName } = popupData;
        const mapRef = map.current;

        if (!countryName || !mapRef) return;

        if (countryName === '' || countryName === 'worldwide') {
            // Close previous popup if it exists
            if (currentPopup) currentPopup.remove();
            return;
        }

        // Close previous popup if it exists
        if (currentPopup) currentPopup.remove();

        let selectedDistrict: { name: string; totalCases: number } | undefined =
            undefined;
        for (const country of countriesData) {
            for (const district of country.districts) {
                if (district.name === countryName) selectedDistrict = district;
            }
        }

        if (!selectedDistrict) return;

        const districtDetails = admin1LookupData[countryName];
        if (!districtDetails) return;

        const totalCases = selectedDistrict.totalCases;
        const coordinates = districtDetails.centroid
            .replace('[', '')
            .replace(']', '')
            .split(',');

        const popupContent = (
            <>
                <PopupContentText>
                    {totalCases.toLocaleString()} confirmed
                    {totalCases > 1 ? ' cases' : ' case'}
                </PopupContentText>
            </>
        );

        // This has to be done this way in order to allow for React components as a content of the popup
        const popupElement = document.createElement('div');
        ReactDOM.render(
            <MapPopup title={countryName} content={popupContent} />,
            popupElement,
        );

        const popup = new mapboxgl.Popup({
            anchor: smallScreen ? 'center' : undefined,
        })
            .setLngLat(coordinates)
            .setDOMContent(popupElement)
            .addTo(mapRef)
            .on('close', () =>
                dispatch(
                    setPopup({
                        isOpen: false,
                        countryName: '',
                    }),
                ),
            );

        setCurrentPopup(popup);
    }, [popupData]);

    return (
        <>
            {!mapLoaded && <Loader />}
            <MapContainer
                ref={mapContainer}
                isLoading={isLoading || !mapLoaded}
            />
            <Legend title="Confirmed cases" legendRows={dataLayers} />
        </>
    );
};

export default RegionalView;
