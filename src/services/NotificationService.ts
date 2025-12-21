import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

export const NotificationService = {
    requestUserPermission: async () => {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Notification permission denied');
                return false;
            }
        }

        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            return true;
        }
        return false;
    },

    getFCMToken: async () => {
        try {
            const token = await messaging().getToken();
            console.log('FCM Token:', token);
            return token;
        } catch (error) {
            console.error('Error getting FCM token:', error);
            return null;
        }
    },

    listenToForegroundNotifications: () => {
        return messaging().onMessage(async remoteMessage => {
            Alert.alert(
                remoteMessage.notification?.title || 'Notification',
                remoteMessage.notification?.body || 'New interaction in SocialConnect'
            );
        });
    },

    setupNotifications: async () => {
        const hasPermission = await NotificationService.requestUserPermission();
        if (hasPermission) {
            await NotificationService.getFCMToken();
        }

        // Handle background/quit state notifications
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background!', remoteMessage);
        });
    }
};
