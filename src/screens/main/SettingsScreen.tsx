import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Switch, useTheme } from 'react-native-paper';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { useAppTheme } from '../../context/ThemeContext';
import { UserService } from '../../services/UserService';

const SettingsScreen = () => {
    const theme = useTheme();
    const { isDarkMode, toggleTheme } = useAppTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const user = auth.currentUser;

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangePassword = async () => {
        if (user?.email) {
            try {
                await sendPasswordResetEmail(auth, user.email);
                Alert.alert('Success', `Password reset email sent to ${user.email}`);
            } catch (error: any) {
                Alert.alert('Error', error.message);
            }
        } else {
            Alert.alert('Error', 'No email found for this user.');
        }
    };

    const handlePrivacySettings = () => {
        Alert.alert('Privacy Settings', 'Privacy settings configuration is coming soon.');
    };

    const handleSyncProfile = async () => {
        if (!user) return;
        setIsSyncing(true);
        try {
            await UserService.upsertUserProfile(user.uid, {
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL,
            });
            Alert.alert('Success', 'Your profile has been synced. You should now be appearing in search results.');
        } catch (error: any) {
            Alert.alert('Sync Error', error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
            {/* Preferences Card */}
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Preferences</Text>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Dark Mode</Text>
                    <Switch value={isDarkMode} onValueChange={toggleTheme} color="#6366f1" />
                </View>

                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Notifications</Text>
                    <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} color="#6366f1" />
                </View>
            </View>

            {/* Account Card */}
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Account</Text>

                <TouchableOpacity style={[styles.outlineButton, { borderColor: theme.colors.outline }]} onPress={handleChangePassword}>
                    <Text style={styles.outlineButtonText}>Change Password</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.outlineButton, { borderColor: theme.colors.outline }]} onPress={handlePrivacySettings}>
                    <Text style={styles.outlineButtonText}>Privacy Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.outlineButton, { borderColor: theme.colors.outline }]}
                    onPress={handleSyncProfile}
                    disabled={isSyncing}
                >
                    <Text style={styles.outlineButtonText}>{isSyncing ? 'Syncing...' : 'Sync Search Profile'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: responsiveWidth(6),
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: responsiveWidth(6),
        padding: responsiveWidth(6),
        marginBottom: responsiveHeight(2),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardTitle: {
        fontWeight: '900',
        marginBottom: responsiveHeight(3),
        color: '#0f172a',
        fontSize: responsiveFontSize(2.5),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveHeight(3),
    },
    label: {
        fontSize: responsiveFontSize(2),
        fontWeight: '600',
        color: '#334155',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: responsiveWidth(3),
        paddingVertical: responsiveHeight(1.8),
        alignItems: 'center',
        marginBottom: responsiveHeight(2),
    },
    outlineButtonText: {
        color: '#6366f1', // primary
        fontWeight: '700',
        fontSize: responsiveFontSize(2),
    },
    logoutButton: {
        backgroundColor: '#6366f1', // primary
        borderRadius: responsiveWidth(3),
        paddingVertical: responsiveHeight(1.8),
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: responsiveFontSize(2),
    },
});

export default SettingsScreen;
