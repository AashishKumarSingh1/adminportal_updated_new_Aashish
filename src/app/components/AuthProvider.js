'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import CssBaseline from '@mui/material/CssBaseline'
import Loading from './loading'

// Create a complete Material-UI theme with all required properties
const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#830001',
      light: '#a33335',
      dark: '#5d0001',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
      light: '#f73378',
      dark: '#ab003c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#d5d5d5',
      A200: '#aaaaaa',
      A400: '#303030',
      A700: '#616161',
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#f5f5f5",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#c1c1c1",
            minHeight: 24,
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
})

// Create a styled-components theme to prevent conflicts
const styledTheme = {
  primary: '#830001',
  secondary: '#f50057',
  background: '#ffffff',
  text: '#000000',
}

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
    
    window.addEventListener('offline', () => {
      alert('Your system is offline please connect to internet.')
    })
    window.addEventListener('online', () => {
      alert('Your system is online.')
    })
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={styledTheme}>
        <CssBaseline />
        <SessionProvider>{children}</SessionProvider>
      </StyledThemeProvider>
    </ThemeProvider>
  )
} 