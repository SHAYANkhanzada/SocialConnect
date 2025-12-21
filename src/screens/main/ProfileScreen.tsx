import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { Text, TextInput, Button, Avatar } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

const ProfileScreen = () => {
    const user = auth.currentUser;
    const [modalVisible, setModalVisible] = useState(false);

    // Edit Form State
    const [name, setName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
    const [loading, setLoading] = useState(false);

    // Stats placeholder
    const stats = {
        posts: 24,
        followers: 589,
        following: 120
    };

    useEffect(() => {
        setName(user?.displayName || '');
        setPhotoURL(user?.photoURL || null);
    }, [user, modalVisible]);

    const handleUpdate = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await updateProfile(user, {
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
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Edit Profile Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <Text variant="headlineSmall" style={styles.modalTitle}>Edit Profile</Text>

                        <TouchableOpacity onPress={pickImage} style={styles.modalAvatarContainer}>
                            {photoURL ? (
                                <Avatar.Image size={100} source={{ uri: photoURL }} />
                            ) : (
                                <Avatar.Icon size={100} icon="account" />
                            )}
                            <Text style={styles.changePhotoText}>Change Photo</Text>
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
            <View style={styles.card}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: user?.photoURL || 'https://i.pravatar.cc/300' }}
                        style={styles.avatar}
                    />
                </View>
                <Text variant="headlineMedium" style={styles.name}>{user?.displayName || 'Shayan'}</Text>
                <Text variant="bodyLarge" style={styles.email}>{user?.email || 'shayan@example.com'}</Text>

                <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Activity Card */}
            <View style={styles.card}>
                <Text variant="titleLarge" style={styles.activityTitle}>Your Activity</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.posts}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.followers}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.following}</Text>
                        <Text style={styles.statLabel}>Following</Text>
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
        backgroundColor: '#fff',
        borderRadius: responsiveWidth(6),
        padding: responsiveWidth(6),
        alignItems: 'center',
        marginBottom: responsiveHeight(2),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    avatarContainer: {
        marginBottom: responsiveHeight(2),
    },
    avatar: {
        width: responsiveWidth(25),
        height: responsiveWidth(25),
        borderRadius: responsiveWidth(12.5),
        borderWidth: 4,
        borderColor: '#f8fafc',
    },
    name: {
        fontWeight: '900',
        marginBottom: responsiveHeight(0.5),
        color: '#0f172a',
        fontSize: responsiveFontSize(3),
    },
    email: {
        color: '#64748b',
        marginBottom: responsiveHeight(3),
        fontSize: responsiveFontSize(1.8),
    },
    editButton: {
        backgroundColor: '#6366f1',
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
        color: '#0f172a',
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
        color: '#6366f1',
        marginBottom: responsiveHeight(0.5),
    },
    statLabel: {
        color: '#64748b',
        fontSize: responsiveFontSize(1.6),
        fontWeight: '600',
    },
    // Modal Styles
    modalView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
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
