import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { UserService } from './UserService';

export const NotificationService = {
    // Request user permission for notifications
    requestUserPermission: async () => {
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

    // Get FCM Token and save it to Firestore
    getFcmToken: async (userId: string) => {
        try {
            const token = await messaging().getToken();
            if (token) {
                console.log('FCM Token:', token);
                await UserService.upsertUserProfile(userId, { fcmToken: token });
            }
        } catch (error) {
            console.error('Error getting FCM token:', error);
        }
    },

    // Setup notification listeners
    setupListeners: () => {
        // When the app is in foreground
        const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
            Alert.alert(
                remoteMessage.notification?.title || 'New Notification',
                remoteMessage.notification?.body || 'You have a new update!'
            );
        });

        // When the app is opened from a notification (background state)
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background state:', remoteMessage.notification);
        });

        // When the app is opened from a notification (quit state)
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log('Notification caused app to open from quit state:', remoteMessage.notification);
                }
            });

        return unsubscribeForeground;
    },
};
