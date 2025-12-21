import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
    displayLarge: {
        fontFamily: 'System',
        fontSize: 57,
        fontWeight: '400' as const,
        letterSpacing: 0,
        lineHeight: 64,
    },
    displayMedium: {
        fontFamily: 'System',
        fontSize: 45,
        fontWeight: '400' as const,
        letterSpacing: 0,
        lineHeight: 52,
    },
    displaySmall: {
        fontFamily: 'System',
        fontSize: 36,
        fontWeight: '400' as const,
        letterSpacing: 0,
        lineHeight: 44,
    },
};

export const AppTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#6366f1', // Indigo 500
        secondary: '#0f172a', // Slate 900
        tertiary: '#f43f5e', // Rose 500
        surface: '#ffffff',
        background: '#f8fafc', // Slate 50
        error: '#ef4444', // Red 500
        outline: '#e2e8f0', // Slate 200
        onSurfaceVariant: '#64748b', // Slate 500
    },
    roundness: 12,
};

export const AppDarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#818cf8', // Indigo 400
        secondary: '#f8fafc', // Slate 50
        tertiary: '#fb7185', // Rose 400
        surface: '#0f172a', // Slate 900
        background: '#020617', // Slate 950
        error: '#f87171', // Red 400
        outline: '#334155', // Slate 700
        onSurfaceVariant: '#94a3b8', // Slate 400
    },
    roundness: 12,
};
