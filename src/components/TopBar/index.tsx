import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { setSelectedCountryInSidebar, setPopup } from 'redux/App/slice';
import { selectSelectedCountryInSideBar } from 'redux/App/selectors';
import Box from '@mui/material/Box';
import GHListLogo from 'components/GHListLogo';
import Typography from '@mui/material/Typography';
import { AppBarStyle, NavBar, StyledTooolbar } from './styled';

const TopBar = () => {
    const dispatch = useAppDispatch();

    const selectedCountry = useAppSelector(selectSelectedCountryInSideBar);

    const resetSelectedCountry = () => {
        if (!selectedCountry) return;

        dispatch(setSelectedCountryInSidebar(null));
        dispatch(setPopup({ isOpen: false, countryName: '' }));
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBarStyle position="static" className="navbar">
                <StyledTooolbar variant="regular" className="toolbar">
                    <GHListLogo />
                    <NavBar>
                        <NavLink
                            to="/country"
                            className={({ isActive }) =>
                                'nav-link' + (isActive ? ' activated' : '')
                            }
                            onClick={resetSelectedCountry}
                        >
                            <Typography variant="navbarlink" gutterBottom>
                                Country View
                            </Typography>
                        </NavLink>
                        <NavLink
                            to="/regional"
                            className={({ isActive }) =>
                                'nav-link' + (isActive ? ' activated' : '')
                            }
                            onClick={resetSelectedCountry}
                        >
                            <Typography variant="navbarlink" gutterBottom>
                                Regional View
                            </Typography>
                        </NavLink>

                        <a href="mailto:info@global.health?subject=Feedback regarding Global.health Ebola map">
                            <Typography variant="navbarlink" gutterBottom>
                                Feedback
                            </Typography>
                        </a>
                    </NavBar>
                </StyledTooolbar>
            </AppBarStyle>
        </Box>
    );
};
export default TopBar;
