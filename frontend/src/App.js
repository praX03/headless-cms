import React, { useState, createContext, useMemo }  from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import EntityList from './components/EntityList';
import DataEntryForm from './components/DataEntryForm'; // Assuming the path is correct
import EntryList from './components/EntryList';
import EntityForm from './components/EntityForm';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, AppBar, Toolbar, Link, Switch,
  FormControlLabel,
  FormGroup } from '@mui/material';

const theme = createTheme(); // You can customize the theme here
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const App = () => {
  const [mode, setMode] = useState('dark'); // Default to light mode

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        []
    );

    const theme = useMemo(
      () =>
          createTheme({
              palette: {
                  mode,
                  ...(mode === 'light'
                      ? {
                            // Light mode palette
                            primary: {
                                main: '#ff9900', // Orange
                            },
                            secondary: {
                                main: '#eebbc3', // Green
                            },
                            background: {
                                default: '#ffffff',
                                paper: '#f5f5f5',
                            },
                            button: {
                                main: '#eebbc3',
                            },
                        }
                      : {
                            // Dark mode palette
                            primary: {
                                main: '#b8c1ec', // Red
                            },
                            secondary: {
                                main: '#121629', // Lime Green
                            },
                            background: {
                                default: '#232946',
                                paper: '#232948',
                            },
                            button: {
                              main: '#eebbc3', // Button color in dark mode
                          },
                        }),
              },
          }),
      [mode]
  );
  return (
    <ColorModeContext.Provider value={colorMode}> {/* Provide the color mode */}
        <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Normalize styles for consistent rendering across browsers */}
        <BrowserRouter>
            <AppBar position="static" >
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Headless CMS
                    </Typography>

                    {/* Dark Mode Toggle */}
                    <FormGroup>
                        <FormControlLabel
                            control={<Switch checked={mode === 'dark'} onChange={colorMode.toggleColorMode} />}
                            label="Dark Mode"
                        />
                    </FormGroup>

                    <NavLink to="/" style={{ color: 'white', textDecoration: 'none' }}>
                        Entity List
                    </NavLink>
                    {/* Add more navigation links as needed */}
                </Toolbar>
            </AppBar>
            
            <Container>
            <Routes>
                <Route path="/" element={<EntityList />} />
                <Route path="/entities/:entityName" element={<DataEntryForm />} />
                <Route path="/entities/add" element={<EntityForm />} />
                <Route path="/entities/:entityName/entries" element={<EntryList />} /> 
            </Routes>
            </Container>
        </BrowserRouter>
        </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
