import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import { AppTheme } from './src/theme/theme';
import { NotificationService } from './src/services/NotificationService';

function App() {
  React.useEffect(() => {
    NotificationService.setupNotifications();
    const unsubscribe = NotificationService.listenToForegroundNotifications();
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={AppTheme}>
        <RootNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
