import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import { AppTheme, AppDarkTheme } from './src/theme/theme';
import { NotificationService } from './src/services/NotificationService';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';

const Main = () => {
  const { isDarkMode } = useAppTheme();
  const theme = isDarkMode ? AppDarkTheme : AppTheme;

  return (
    <PaperProvider theme={theme}>
      <RootNavigator />
    </PaperProvider>
  );
};

function App() {
  React.useEffect(() => {
    NotificationService.setupNotifications();
    const unsubscribe = NotificationService.listenToForegroundNotifications();
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
