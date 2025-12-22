import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { Text, TextInput, Button, Avatar, useTheme } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { UserService } from '../../services/UserService';
import { PostService } from '../../services/PostService';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

const ProfileScreen = () => {
    const user = auth.currentUser;
    const theme = useTheme();
    const [modalVisible, setModalVisible] = useState(false);

    // Edit Form State
    const [name, setName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
    const [loading, setLoading] = useState(false);

    // Stats State
    const [stats, setStats] = useState({
        posts: 0,
        followers: 0,
        following: 0
    });

    useEffect(() => {
        setName(user?.displayName || '');
        setPhotoURL(user?.photoURL || null);
        if (user) {
            fetchStats();
        }
    }, [user, modalVisible]);

    const fetchStats = async () => {
        if (!user) return;
        try {
            const [postCount, followStats] = await Promise.all([
                PostService.getUserPostCount(user.uid),
                UserService.getFollowStats(user.uid)
            ]);
            setStats({
                posts: postCount,
                followers: followStats.followers,
                following: followStats.following
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleUpdate = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await updateProfile(user, {
                displayName: name,
                photoURL: photoURL,
            });

            // Sync with Firestore for searchability
            await UserService.upsertUserProfile(user.uid, {
                displayName: name,
                photoURL: photoURL,
            });
            Alert.alert('Success', 'Profile updated successfully!');
            setModalVisible(false);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.5,
        });

        if (result.assets && result.assets.length > 0) {
            setPhotoURL(result.assets[0].uri || null);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
            {/* Edit Profile Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalView, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Edit Profile</Text>

                        <TouchableOpacity onPress={pickImage} style={styles.modalAvatarContainer}>
                            {photoURL ? (
                                <Avatar.Image size={100} source={{ uri: photoURL }} />
                            ) : (
                                <Avatar.Icon size={100} icon="account" />
                            )}
                            <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>Change Photo</Text>
                        </TouchableOpacity>

                        <TextInput
                            label="Display Name"
                            value={name}
                            onChangeText={setName}
                            mode="outlined"
                            style={styles.input}
                        />

                        <View style={styles.modalButtons}>
                            <Button onPress={() => setModalVisible(false)} style={styles.modalButton}>Cancel</Button>
                            <Button mode="contained" onPress={handleUpdate} loading={loading} style={styles.modalButton}>Save</Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Profile Card */}
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: user?.photoURL || 'https://i.pravatar.cc/300' }}
                        style={[styles.avatar, { borderColor: theme.colors.surfaceVariant }]}
                    />
                </View>
                <Text variant="headlineMedium" style={[styles.name, { color: theme.colors.onSurface }]}>{user?.displayName || 'Shayan'}</Text>
                <Text variant="bodyLarge" style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>{user?.email || 'shayan@example.com'}</Text>

                <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.colors.primary }]} onPress={() => setModalVisible(true)}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Activity Card */}
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                <Text variant="titleLarge" style={[styles.activityTitle, { color: theme.colors.onSurface }]}>Your Activity</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.posts}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Posts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.followers}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Followers</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.following}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Following</Text>
                    </View>
                </View>
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
        borderRadius: responsiveWidth(6),
        padding: responsiveWidth(6),
        alignItems: 'center',
        marginBottom: responsiveHeight(2),
        borderWidth: 1,
    },
    avatarContainer: {
        marginBottom: responsiveHeight(2),
    },
    avatar: {
        width: responsiveWidth(25),
        height: responsiveWidth(25),
        borderRadius: responsiveWidth(12.5),
        borderWidth: 4,
    },
    name: {
        fontWeight: '900',
        marginBottom: responsiveHeight(0.5),
        fontSize: responsiveFontSize(3),
    },
    email: {
        marginBottom: responsiveHeight(3),
        fontSize: responsiveFontSize(1.8),
    },
    editButton: {
        paddingVertical: responsiveHeight(1.5),
        paddingHorizontal: responsiveWidth(8),
        borderRadius: responsiveWidth(3),
        width: '100%',
        alignItems: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: responsiveFontSize(2),
    },
    activityTitle: {
        alignSelf: 'flex-start',
        fontWeight: '900',
        marginBottom: responsiveHeight(3),
        fontSize: responsiveFontSize(2.2),
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: responsiveFontSize(3),
        fontWeight: '900',
        marginBottom: responsiveHeight(0.5),
    },
    statLabel: {
        fontSize: responsiveFontSize(1.6),
        fontWeight: '600',
    },
    // Modal Styles
    modalView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: responsiveWidth(8),
        borderTopRightRadius: responsiveWidth(8),
        padding: responsiveWidth(8),
        width: '100%',
    },
    modalTitle: {
        fontWeight: '900',
        marginBottom: responsiveHeight(3),
        textAlign: 'center',
        fontSize: responsiveFontSize(2.5),
    },
    modalAvatarContainer: {
        alignItems: 'center',
        marginBottom: responsiveHeight(3),
    },
    changePhotoText: {
        marginTop: responsiveHeight(1.5),
        fontWeight: '700',
        fontSize: responsiveFontSize(1.8),
    },
    input: {
        marginBottom: responsiveHeight(3),
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: responsiveWidth(3),
    },
    modalButton: {
        flex: 1,
        borderRadius: responsiveWidth(3),
    }
});

export default ProfileScreen;
