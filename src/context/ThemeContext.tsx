import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@app_theme_mode';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDarkMode: false,
    toggleTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(false); // Default to light

    useEffect(() => {
        // Load persisted theme
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme !== null) {
                    setIsDarkMode(savedTheme === 'dark');
                } else {
                    // If no saved preference, default to light as requested if system is too aggressive
                    // or just follow system once then persist.
                    // User said "default dark hata do", so we default to light.
                    setIsDarkMode(false);
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        };

        loadTheme();
    }, []);

    const toggleTheme = async () => {
        try {
            const newMode = !isDarkMode;
            setIsDarkMode(newMode);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => useContext(ThemeContext);
