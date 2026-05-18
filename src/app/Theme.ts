import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0066CC',
      dark: '#004D99',
      light: '#85C2FF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C2E0FF',
      contrastText: '#133062',
    },
    error: { main: '#CC2200' },
    warning: { main: '#DA5700' },
    success: { main: '#2B911C' },
    background: {
      default: '#F6F7F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#133062',
      secondary: '#6B7589',
    },
    divider: '#DEDED7',
  },
  typography: {
    fontSize: 14,
    fontFamily: 'inherit',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, fontSize: 13 },
        sizeSmall: { height: 32, padding: '0 12px' },
        sizeMedium: { height: 36, padding: '0 16px' },
        sizeLarge: { height: 40, padding: '0 20px' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiDialog: {
      defaultProps: { PaperProps: { elevation: 4 } },
      styleOverrides: {
        paper: { borderRadius: 12 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: '#133062', fontSize: 12, borderRadius: 6 },
        arrow: { color: '#133062' },
      },
    },
    MuiSnackbar: {
      defaultProps: { anchorOrigin: { vertical: 'top', horizontal: 'right' } },
    },
  },
});

export default theme;
