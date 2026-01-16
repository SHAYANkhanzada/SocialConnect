import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useRoute, useNavigation } from '@react-navigation/native';
import { UserService } from '../../services/UserService';
import { PostService, Post } from '../../services/PostService';
import { FriendService } from '../../services/FriendService';
import { ChatService } from '../../services/ChatService';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

const UserProfileScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const { user } = route.params; // Expecting { userName, userAvatar, userId }

    // Stats State
    const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [relationship, setRelationship] = useState<'none' | 'sent' | 'received' | 'friends'>('none');
    const [posts, setPosts] = useState<Post[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [user.userId]);

    const fetchData = async () => {
        try {
            const [postCount, followStats, followingStatus, relStatus, freshProfile] = await Promise.all([
                PostService.getUserPostCount(user.userId),
                UserService.getFollowStats(user.userId),
                UserService.checkIfFollowing(user.userId),
                FriendService.getRelationshipStatus(user.userId),
                UserService.getUserProfile(user.userId)
            ]);

            // Set up real-time subscription for user posts
            const unsubscribePosts = PostService.subscribeToUserPosts(user.userId, (userPosts) => {
                setPosts(userPosts);
            });

            setStats({
                posts: postCount,
                followers: followStats.followers,
                following: followStats.following
            });
            setIsFollowing(followingStatus);
            setRelationship(relStatus as any);
            setProfile(freshProfile);
        } catch (error) {
            console.error("Error fetching user profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        setActionLoading(true);
        try {
            await UserService.toggleFollow(user.userId, isFollowing);
            setIsFollowing(!isFollowing);
            setStats(prev => ({
                ...prev,
                followers: isFollowing ? prev.followers - 1 : prev.followers + 1
            }));
        } catch (error) {
            console.error("Error toggling follow:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleFriendAction = async () => {
        setActionLoading(true);
        try {
            if (relationship === 'none') {
                await FriendService.sendFriendRequest(user.userId, user.userName);
                setRelationship('sent');
                Alert.alert('Success', 'Friend request sent!');
            } else if (relationship === 'received') {
                navigation.navigate('FriendRequests');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMessage = async () => {
        setActionLoading(true);
        try {
            const roomId = await ChatService.getOrCreateChatRoom(user.userId);
            navigation.navigate('Chat', {
                roomId,
                partnerName: user.userName,
                partnerId: user.userId
            });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
            {/* Profile Card */}
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: profile?.photoURL || user.userAvatar || 'https://i.pravatar.cc/300' }}
                        style={styles.avatar}
                    />
                </View>
                <Text variant="headlineMedium" style={[styles.name, { color: theme.colors.onSurface }]}>{profile?.displayName || user.userName || 'Anonymous'}</Text>

                <View style={styles.actionRow}>
                    <Button
                        mode={isFollowing ? "outlined" : "contained"}
                        onPress={handleFollowToggle}
                        loading={actionLoading}
                        style={styles.actionButton}
                        labelStyle={{ fontSize: 12 }}
                    >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Button>

                    <Button
                        mode={relationship === 'friends' ? "outlined" : "contained"}
                        onPress={handleFriendAction}
                        loading={actionLoading}
                        disabled={relationship === 'sent'}
                        style={[styles.actionButton, { marginLeft: 10 }]}
                        labelStyle={{ fontSize: 12 }}
                        buttonColor={relationship === 'sent' ? theme.colors.surfaceDisabled : undefined}
                    >
                        {relationship === 'none' && "Add Friend"}
                        {relationship === 'sent' && "Pending"}
                        {relationship === 'received' && "Respond"}
                        {relationship === 'friends' && "Friends"}
                    </Button>

                    <Button
                        mode="contained"
                        icon="message"
                        onPress={handleMessage}
                        style={[styles.actionButton, { marginLeft: 10 }]}
                        labelStyle={{ fontSize: 12 }}
                        buttonColor={theme.colors.secondary}
                    >
                        Chat
                    </Button>
                </View>
            </View>

            {/* Activity Card */}
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
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

            {/* Posts List */}
            <View style={styles.postsContainer}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Posts</Text>
                {posts.length > 0 ? (
                    posts.map((item) => (
                        <View key={item.id} style={[styles.postCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                            {item.imageUrl && (
                                <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
                            )}
                            <View style={styles.postContent}>
                                <Text style={[styles.postText, { color: theme.colors.onSurfaceVariant }]}>{item.text}</Text>
                                <View style={styles.postFooter}>
                                    <View style={styles.postStat}>
                                        <FontAwesome name="heart" size={14} color={theme.colors.tertiary} />
                                        <Text style={[styles.postStatText, { color: theme.colors.onSurfaceVariant }]}>{item.likes}</Text>
                                    </View>
                                    <Text style={[styles.postDate, { color: theme.colors.onSurfaceVariant }]}>
                                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No posts yet.</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    card: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
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
    },
    actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    actionButton: {
        borderRadius: 20,
        marginBottom: 10,
        minWidth: 90,
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
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
    },
    postsContainer: {
        marginTop: 10,
    },
    sectionTitle: {
        fontWeight: '900',
        marginBottom: 15,
        marginLeft: 5,
    },
    postCard: {
        borderRadius: 15,
        marginBottom: 15,
        borderWidth: 1,
        overflow: 'hidden',
    },
    postImage: {
        width: '100%',
        height: 200,
    },
    postContent: {
        padding: 15,
    },
    postText: {
        fontSize: 16,
        marginBottom: 10,
    },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    postStat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    postStatText: {
        marginLeft: 5,
        fontSize: 14,
    },
    postDate: {
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default UserProfileScreen;
