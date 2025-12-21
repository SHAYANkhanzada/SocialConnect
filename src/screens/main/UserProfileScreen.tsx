import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

const UserProfileScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { user } = route.params; // Expecting { userName, userAvatar, userId }

    // Placeholder stats since we don't have a full user collection yet
    const stats = {
        posts: 12,
        followers: 156,
        following: 89
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Profile Card */}
            <View style={styles.card}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: user.userAvatar || 'https://i.pravatar.cc/300' }}
                        style={styles.avatar}
                    />
                </View>
                <Text variant="headlineMedium" style={styles.name}>{user.userName || 'Anonymous'}</Text>

                <TouchableOpacity style={styles.followButton} onPress={() => { /* Follow Logic */ }}>
                    <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
            </View>

            {/* Activity Card */}
            <View style={styles.card}>
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

            <View style={styles.postsContainer}>
                <Text style={styles.emptyText}>User posts will appear here.</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    contentContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    name: {
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1a1a1a',
    },
    followButton: {
        backgroundColor: '#6200ee',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 20,
        marginBottom: 10,
    },
    followButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    statLabel: {
        color: '#666',
        fontSize: 14,
    },
    postsContainer: {
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
    }
});

export default UserProfileScreen;
