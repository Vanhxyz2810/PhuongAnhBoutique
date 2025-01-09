import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF8DC7', // Hồng đậm
      light: '#FFB5D8', // Hồng nhạt
      dark: '#FF6B9C', // Hồng đậm hơn
    },
    secondary: {
      main: '#FFF0F5', // Lavender nhạt
    },
    background: {
      default: '#FFF9FB', // Hồng rất nhạt
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Quicksand", "Roboto", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFF0F5',
          width: 240,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(255, 141, 199, 0.3)',
          },
        },
      },
    },
  },
}); 