import { RefObject, useEffect, useState } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import LinkIcon from '@mui/icons-material/Link';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { selectSelectedCountryInSideBar } from 'redux/App/selectors';
import { URLToFilters } from 'utils/helperFunctions';
import { setPopup, setSelectedCountryInSidebar } from 'redux/App/slice';
import { selectCountriesData } from 'redux/CountryView/selectors';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { CopyStateLinkButtonContainer } from './styled';

interface CopyStateLinkButtonProps {
    map?: RefObject<mapboxgl.Map | null>;
}

const CopyStateLinkButton = ({ map }: CopyStateLinkButtonProps) => {
    const dispatch = useAppDispatch();

    const selectedCountry = useAppSelector(selectSelectedCountryInSideBar);
    const countriesData = useAppSelector(selectCountriesData);

    useEffect(() => {
        const newViewValues = URLToFilters(location.search);

        if (!newViewValues.name || countriesData.length === 0) return;

        if (map && map.current) {
            const mapRef = map.current;
            mapRef.setCenter([newViewValues.lng || 40, newViewValues.lat || 0]);
            mapRef.setZoom(newViewValues.zoom || 2.5);
        }

        if (
            countriesData.find((country) => country.name === newViewValues.name)
        ) {
            dispatch(setSelectedCountryInSidebar({ name: newViewValues.name }));
            dispatch(
                setPopup({ isOpen: true, countryName: newViewValues.name }),
            );
            return;
        }

        dispatch(setPopup({ isOpen: false, countryName: '' }));
        dispatch(setSelectedCountryInSidebar(null));
        setSnackbarAlertOpen(newViewValues.name !== 'worldwide');
    }, [location.search, countriesData]);

    const [copyHandler, setCopyHandler] = useState({
        message: `Copy link to view`,
        isCopying: false,
    });

    const [snackbarAlertOpen, setSnackbarAlertOpen] = useState(false);

    useEffect(() => {
        if (!snackbarAlertOpen) return;
        setTimeout(() => {
            setSnackbarAlertOpen(false);
        }, 3000);
    }, [snackbarAlertOpen]);

    const handleCopyLinkButton = () => {
        const mapRef = map?.current;

        if (!mapRef) return;

        if (copyHandler.isCopying) return;

        const countryName = selectedCountry
            ? selectedCountry.name
            : 'worldwide';

        const center = mapRef.getCenter().toArray();
        const zoom = mapRef.getZoom();

        navigator.clipboard.writeText(
            `${window.location.href}?name=${countryName}${
                '&lng=' + center[0] + '&lat=' + center[1] + '&zoom=' + zoom
            }`,
        );
        setCopyHandler({ message: 'Copied!', isCopying: true });

        setTimeout(() => {
            setCopyHandler({
                message: `Copy link to view`,
                isCopying: false,
            });
        }, 2000);
    };

    return (
        <>
            <CopyStateLinkButtonContainer
                color="primary"
                variant="extended"
                onClick={handleCopyLinkButton}
            >
                {' '}
                {copyHandler.isCopying ? <DoneIcon /> : <LinkIcon />}
                {copyHandler.message}
            </CopyStateLinkButtonContainer>
            <Snackbar
                open={snackbarAlertOpen}
                onClose={() => setSnackbarAlertOpen(false)}
                anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                sx={{ height: '100%' }}
            >
                <Alert severity="error" variant="filled">
                    Unfortunately, there is no data from the country that you
                    have selected.
                </Alert>
            </Snackbar>
        </>
    );
};

export default CopyStateLinkButton;
