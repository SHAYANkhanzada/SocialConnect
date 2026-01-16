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
    const [bio, setBio] = useState('');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
    const [newPhotoBase64, setNewPhotoBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Stats State
    const [stats, setStats] = useState({
        posts: 0,
        followers: 0,
        following: 0
    });

    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        setName(user.displayName || '');
        fetchStats();

        // Real-time listener for bio and photoURL from Firestore
        const unsubscribe = UserService.subscribeToUserProfile(user.uid, (p) => {
            if (p) {
                setProfile(p);
                setBio(p.bio || '');
                setPhotoURL(p.photoURL || null);
                if (p.displayName) setName(p.displayName);
            }
        });

        return () => unsubscribe();
    }, [user, modalVisible]);

    // Removed fetchUserProfile as we now use subscribeToUserProfile

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
            let finalPhotoURL = photoURL;

            // If we have a new photo, upload it first
            if (newPhotoBase64) {
                console.log("Uploading new profile picture...");
                finalPhotoURL = await PostService.uploadImage(newPhotoBase64, 'profiles');
                console.log("Profile picture uploaded:", finalPhotoURL);
            }

            await updateProfile(user, {
                displayName: name,
                // Do NOT send photoURL here if it's potentially a long Base64 string
            });

            // Sync with Firestore - This is where the Base64 image is stored
            await UserService.upsertUserProfile(user.uid, {
                displayName: name,
                photoURL: finalPhotoURL,
                bio: bio,
            });
            Alert.alert('Success', 'Profile updated successfully!');
            setNewPhotoBase64(null); // Clear temporary base64
            setModalVisible(false);
        } catch (error: any) {
            console.error("Profile Update Error:", error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.5,
            includeBase64: true,
        });

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setPhotoURL(asset.uri || null);
            setNewPhotoBase64(asset.base64 || null);
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

                        <TextInput
                            label="Bio"
                            value={bio}
                            onChangeText={setBio}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
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
                    {photoURL ? (
                        <Image
                            source={{ uri: photoURL }}
                            style={[styles.avatar, { borderColor: theme.colors.surfaceVariant }]}
                        />
                    ) : (
                        <Avatar.Icon size={responsiveWidth(25)} icon="account" />
                    )}
                </View>
                <Text variant="headlineMedium" style={[styles.name, { color: theme.colors.onSurface }]}>{profile?.displayName || user?.displayName || 'Social User'}</Text>
                <Text variant="bodyLarge" style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>{user?.email}</Text>

                {bio ? (
                    <Text variant="bodyMedium" style={[styles.bio, { color: theme.colors.onSurfaceVariant }]}>{bio}</Text>
                ) : null}

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
        marginBottom: responsiveHeight(1),
        fontSize: responsiveFontSize(1.8),
    },
    bio: {
        marginBottom: responsiveHeight(2.5),
        fontSize: responsiveFontSize(1.7),
        textAlign: 'center',
        paddingHorizontal: responsiveWidth(5),
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
