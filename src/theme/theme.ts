import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    typography: {
        fontFamily: 'Inter',
        htmlFontSize: 10,
        navbarlink: {
            fontWeight: 500,
            fontSize: '14px',
            textShadow:
                '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            margin: 0,
            padding: '3.5ex 1ex 2.5ex',
            cursor: 'pointer',
            textDecoration: 'none',
        },
    },
    palette: {
        primary: {
            main: '#0094e2',
            contrastText: '#fff',
        },
        background: {
            default: '#edf3f1',
        },
        dark: {
            main: '#333333',
        },
        gray: {
            main: '#8796A5',
            light: '#F5F5F5',
            dark: '#E0E3E7',
        },
    },
    primary: {
        main: '#0094e2',
        contrastText: '#fff',
    },
    navbarLinks: {
        default: '#edf3f1',
        paper: '#333',
    },
});
