import ReactDOM from 'react-dom';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useMapboxMap } from 'hooks/useMapboxMap';
import { useAppSelector, useAppDispatch } from 'redux/hooks';
import {
    selectSelectedCountryInSideBar,
    selectPopupData,
} from 'redux/App/selectors';
import { setSelectedCountryInSidebar, setPopup } from 'redux/App/slice';

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

const CountryView: React.FC = () => {
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

    const countryLookupData = useMemo(() => {
        const data: { [key: string]: any } = [];
        const typedCountriesLookupTable = countriesLookupTable as {
            [key: string]: any;
        };

        for (const country of countriesData) {
            const countryRow =
                typedCountriesLookupTable.adm0.data.all[
                    getTwoLetterCountryCode(country.name)
                ];

            if (countryRow) {
                data[country.name] = countryRow;
            }
        }

        return data;
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

    // Fly to country
    useEffect(() => {
        if (
            !selectedCountry ||
            !countryLookupData ||
            Object.keys(countryLookupData).length === 0
        )
            return;

        const { name } = selectedCountry;

        if (name === 'worldwide') {
            map.current?.setCenter([0, 40]);
            map.current?.setZoom(2.5);

            return;
        }

        const bounds = countryLookupData[name].bounds;
        map.current?.fitBounds(bounds);

        // on some browsers the blank space is added below the body element when using fitBounds function
        // this is to manually scroll to top of the page where map is located
        setTimeout(() => {
            scrollTo(0, 0);
        }, 100);
    }, [selectedCountry, countryLookupData]);

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

        if (mapRef.getLayer('countryJoin')) {
            mapRef.removeLayer('countryJoin');
        }

        if (mapRef.getSource('countryData')) {
            mapRef.removeSource('countryData');
        }

        mapRef.addSource('countryData', {
            type: 'vector',
            url: 'mapbox://mapbox.country-boundaries-v1',
        });

        const setData = () => {
            for (const country of countriesData) {
                mapRef.setFeatureState(
                    {
                        source: 'countryData',
                        sourceLayer: 'country_boundaries',
                        id: countryLookupData[country.name].feature_id,
                    },
                    {
                        name: country.name,
                        numberOfCases: country.totalCases,
                    },
                );
            }
        };

        // Check if `adm1Data` source is loaded.
        const setAfterLoad = (event: any) => {
            if (event.sourceID !== 'countryData' && !event.isSourceLoaded)
                return;
            setData();
            setMapLoaded(true);
            mapRef.off('sourcedata', setAfterLoad);
        };

        // If `adm1Data` source is loaded, call `setStates()`.
        if (mapRef.isSourceLoaded('countryData')) {
            setData();
            setMapLoaded(true);
        } else {
            mapRef.on('sourcedata', setAfterLoad);
        }

        mapRef.addLayer(
            {
                id: 'countryJoin',
                type: 'fill',
                source: 'countryData',
                'source-layer': 'country_boundaries',
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
            'admin-1-boundary',
        );

        // Change the mouse cursor to pointer when hovering above this layer
        mapRef.on('mouseenter', 'countryJoin', () => {
            mapRef.getCanvas().style.cursor = 'pointer';
        });

        mapRef.on('mouseleave', 'countryJoin', () => {
            mapRef.getCanvas().style.cursor = '';
        });

        // Add click listener and show popups
        mapRef.on('click', 'countryJoin', (e) => {
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
        mapRef.setFilter('countryJoin', [
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

        const country = countriesData.find(
            (country) => country.name === countryName,
        );

        if (!country) return;

        const countryDetails = countryLookupData[countryName];
        if (!countryDetails) return;

        const totalCases = country.totalCases;
        const lat = countryDetails.centroid[1];
        const lng = countryDetails.centroid[0];
        const coordinates: mapboxgl.LngLatLike = { lng, lat };

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

export default CountryView;
