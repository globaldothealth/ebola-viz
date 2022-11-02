import { useEffect } from 'react';
import TopBar from 'components/TopBar';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CountryView from 'containers/CountryView';
import RegionalView from 'containers/RegionalView';
import SideBar from 'components/SideBar';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { fetchCountriesData } from 'redux/CountryView/thunk';
import { selectIsLoading, selectError } from 'redux/App/selectors';
import Loader from 'components/Loader';
import ErrorAlert from 'components/ErrorAlert';
import ReactGA from 'react-ga4';
import { useCookieBanner } from 'hooks/useCookieBanner';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from 'components/ErrorFallback';

import { ErrorContainer } from './styled';
import PopupSmallScreens from 'components/PopupSmallScreens';

const App = () => {
    const env = process.env.NODE_ENV;
    const gaTrackingId = process.env.REACT_APP_GA_TRACKING_ID || '';

    useEffect(() => {
        if (env !== 'production' || gaTrackingId === '') return;

        ReactGA.initialize(gaTrackingId);
    }, [env, gaTrackingId]);

    // Init IUBENDA cookie banner
    const { initCookieBanner } = useCookieBanner();

    useEffect(() => {
        initCookieBanner();
    }, []);

    const location = useLocation();
    const dispatch = useAppDispatch();

    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);

    // Fetch data from AWS S3
    useEffect(() => {
        dispatch(fetchCountriesData());
    }, [dispatch]);

    // Track page views
    useEffect(() => {
        if (env !== 'production') return;

        ReactGA.send({ hitType: 'pageview', page: location.pathname });
    }, [env, location]);

    return (
        <div className="App">
            {isLoading && <Loader />}

            <TopBar />
            <PopupSmallScreens />

            <ErrorBoundary
                FallbackComponent={ErrorFallback}
                onReset={() => window.location.reload()}
            >
                <SideBar />

                <Routes>
                    <Route
                        path="/"
                        element={<Navigate replace to="/country" />}
                    />
                    <Route path="/country" element={<CountryView />} />
                    <Route path="/regional" element={<RegionalView />} />
                </Routes>

                {error && (
                    <ErrorContainer>
                        <ErrorAlert errorMessage={error} />
                    </ErrorContainer>
                )}
            </ErrorBoundary>
        </div>
    );
};

export default App;
