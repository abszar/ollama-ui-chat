import { useState, useEffect, useMemo } from 'react';
import { createTheme, Theme } from '@mui/material';

type ThemeMode = 'light' | 'dark';

export const useTheme = () => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const savedMode = localStorage.getItem('theme-mode');
        return (savedMode as ThemeMode) || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme-mode', mode);
    }, [mode]);

    const theme = useMemo<Theme>(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: mode === 'dark' ? '#90caf9' : '#1976d2',
                    },
                    background: {
                        default: mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                        paper: mode === 'dark' ? '#242424' : '#ffffff',
                    },
                },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                scrollbarColor: mode === 'dark' ? '#444 #1a1a1a' : '#ccc #f5f5f5',
                                '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
                                    background: mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                                },
                                '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                                    backgroundColor: mode === 'dark' ? '#444' : '#ccc',
                                    borderRadius: '3px',
                                },
                                '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                                    backgroundColor: mode === 'dark' ? '#555' : '#bbb',
                                },
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    return { theme, mode, toggleTheme };
};
