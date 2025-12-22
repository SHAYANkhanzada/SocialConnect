import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Share, Alert, RefreshControl } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { PostService, Post } from '../../services/PostService';
import { auth } from '../../services/firebase';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withSequence } from 'react-native-reanimated';

const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const userId = auth.currentUser?.uid;

    // Real-time subscription matches here (keeping clean)

    // Real-time subscription
    useEffect(() => {
        const unsubscribe = PostService.subscribeToPosts((updatedPosts) => {
            setPosts(updatedPosts);
        });

        return () => unsubscribe();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        // Since we have a real-time listener, we don't strictly need to fetch.
        // But we can simulate a check or just wait a bit.
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleLike = async (post: Post) => {
        const isLiked = post.likedBy.includes(userId || '');
        // Optimistic Update
        setPosts(currentPosts =>
            currentPosts.map(p => {
                if (p.id === post.id) {
                    return {
                        ...p,
                        likes: isLiked ? p.likes - 1 : p.likes + 1,
                        likedBy: isLiked
                            ? p.likedBy.filter(id => id !== userId)
                            : [...p.likedBy, userId || '']
                    } as Post;
                }
                return p;
            })
        );

        try {
            await PostService.toggleLike(post.id, isLiked);
        } catch (error) {
            Alert.alert("Error", "Could not update like status");
            // Revert logic would go here
            console.error(error);
        }
    };

    const handleComment = (id: string) => {
        navigation.navigate('Comments', { postId: id });
    };

    const handleShare = async (caption: string) => {
        try {
            await Share.share({
                message: `Check out this post: ${caption} - via SocialConnect`,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    const handleDeletePost = (postId: string) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await PostService.deletePost(postId);
                        } catch (error) {
                            Alert.alert("Error", "Could not delete post");
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    const LikeButton = ({ isLiked, likes, onPress }: { isLiked: boolean, likes: number, onPress: () => void }) => {
        const scale = useSharedValue(1);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
        }));

        const handlePress = () => {
            scale.value = withSequence(
                withSpring(1.5),
                withSpring(1)
            );
            onPress();
        };

        return (
            <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
                <Animated.View style={animatedStyle}>
                    <FontAwesome
                        name={isLiked ? "heart" : "heart-o"}
                        size={responsiveFontSize(2.5)}
                        color={isLiked ? theme.colors.tertiary : theme.colors.onSurfaceVariant}
                    />
                </Animated.View>
                <Text style={[styles.actionText, { color: theme.colors.onSurfaceVariant }]}>{likes}</Text>
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }: { item: Post }) => {
        const isLiked = item.likedBy && item.likedBy.includes(userId || '');

        return (
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { user: item })}>
                            <Image
                                source={{ uri: item.userAvatar || 'https://i.pravatar.cc/100' }}
                                style={styles.avatar}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { user: item })}>
                            <Text style={[styles.username, { color: theme.colors.onSurface }]}>{item.userName}</Text>
                        </TouchableOpacity>
                    </View>

                    {item.userId === userId && (
                        <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
                            <FontAwesome name="trash-o" size={responsiveFontSize(2.2)} color={theme.colors.error} />
                        </TouchableOpacity>
                    )}
                </View>

                {item.text ? (
                    <Text style={[styles.postText, { color: theme.colors.onSurfaceVariant }]}>{item.text}</Text>
                ) : null}

                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
                ) : null}

                <View style={styles.footer}>
                    <View style={styles.actions}>
                        <LikeButton
                            isLiked={isLiked}
                            likes={item.likes}
                            onPress={() => handleLike(item)}
                        />
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleComment(item.id)}>
                            <FontAwesome name="comment-o" size={responsiveFontSize(2.5)} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item.text || 'Image')}>
                            <FontAwesome name="share-square-o" size={responsiveFontSize(2.5)} color={theme.colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.topHeader}>
                <Text variant="headlineMedium" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>Explore Posts</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => navigation.navigate('FriendRequests')} style={styles.headerIconButton}>
                        <FontAwesome name="user-plus" size={responsiveFontSize(2.5)} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={[styles.headerIconButton, { marginLeft: 15 }]}>
                        <FontAwesome name="envelope-o" size={responsiveFontSize(2.5)} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>No posts yet. Be the first to post!</Text>
                }
            />

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('CreatePost')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    pageTitle: {
        paddingHorizontal: responsiveWidth(5),
        paddingTop: responsiveHeight(3),
        paddingBottom: responsiveHeight(2),
        fontWeight: '900',
        fontSize: responsiveFontSize(3),
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: responsiveWidth(5),
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: responsiveHeight(1),
    },
    headerIconButton: {
        padding: 5,
    },
    list: {
        paddingHorizontal: responsiveWidth(4),
        paddingBottom: responsiveHeight(10),
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: responsiveWidth(6),
        marginBottom: responsiveHeight(2),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: responsiveWidth(4),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: responsiveWidth(11),
        height: responsiveWidth(11),
        borderRadius: responsiveWidth(5.5),
        marginRight: responsiveWidth(3),
    },
    username: {
        fontWeight: '700',
        fontSize: responsiveFontSize(2),
        color: '#0f172a',
    },
    postText: {
        paddingHorizontal: responsiveWidth(4),
        paddingBottom: responsiveHeight(1.5),
        fontSize: responsiveFontSize(1.8),
        lineHeight: responsiveFontSize(2.6),
        color: '#334155',
    },
    postImage: {
        width: '100%',
        height: responsiveHeight(35),
    },
    footer: {
        padding: responsiveWidth(4),
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: responsiveWidth(6),
    },
    actionText: {
        marginLeft: responsiveWidth(2),
        fontWeight: '600',
        fontSize: responsiveFontSize(1.8),
    },
    fab: {
        position: 'absolute',
        margin: responsiveWidth(5),
        right: 0,
        bottom: 0,
        borderRadius: responsiveWidth(4),
    },
});

export default HomeScreen;
