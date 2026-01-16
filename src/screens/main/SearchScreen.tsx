import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Searchbar, Text, List, useTheme, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { UserService, UserProfile } from '../../services/UserService';
import { PostService, Post } from '../../services/PostService';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

const SearchScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'users' | 'posts'>('users');
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 0) {
                handleSearch();
            } else {
                setUsers([]);
                setPosts([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, searchType]);

    const handleSearch = async () => {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setUsers([]);
            setPosts([]);
            return;
        }

        setLoading(true);
        try {
            if (searchType === 'users') {
                console.log(`Searching for users with query: "${trimmed}"`);
                const results = await UserService.searchUsers(trimmed);
                setUsers(results);
            } else {
                console.log(`Searching for posts with query: "${trimmed}"`);
                const results = await PostService.searchPosts(trimmed);
                setPosts(results);
            }
        } catch (error: any) {
            console.error("Search error:", error);
            Alert.alert("Search Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderUserItem = ({ item }: { item: UserProfile }) => (
        <List.Item
            title={item.displayName}
            description={item.email}
            left={props => (
                item.photoURL ? (
                    <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                ) : (
                    <Avatar.Text
                        size={40}
                        label={item.displayName.substring(0, 2).toUpperCase()}
                        style={[styles.avatarFallback, { backgroundColor: theme.colors.primaryContainer }]}
                    />
                )
            )}
            onPress={() => navigation.navigate('UserProfile', { user: { userId: item.uid, userName: item.displayName, userAvatar: item.photoURL } })}
            style={[styles.listItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
            titleStyle={[styles.userName, { color: theme.colors.onSurface }]}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        />
    );

    const renderPostItem = ({ item }: { item: Post }) => (
        <TouchableOpacity
            style={[styles.postItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
            onPress={() => navigation.navigate('Comments', { postId: item.id })}
        >
            <View style={styles.postHeader}>
                <Image
                    source={{ uri: item.userAvatar || 'https://i.pravatar.cc/100' }}
                    style={styles.postAvatar}
                />
                <Text style={[styles.postUser, { color: theme.colors.onSurface }]}>{item.userName}</Text>
            </View>
            <Text numberOfLines={2} style={[styles.postCaption, { color: theme.colors.onSurfaceVariant }]}>
                {item.text}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineMedium" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>Find People</Text>
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder={searchType === 'users' ? "Search by username..." : "Search posts..."}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    iconColor={theme.colors.onSurfaceVariant}
                    inputStyle={{ color: theme.colors.onSurface }}
                    loading={loading}
                    elevation={0}
                />
            </View>

            <View style={styles.typeToggle}>
                <TouchableOpacity
                    onPress={() => setSearchType('users')}
                    style={[styles.toggleButton, searchType === 'users' && { backgroundColor: theme.colors.primaryContainer }]}
                >
                    <Text style={{ color: searchType === 'users' ? theme.colors.primary : theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>Users</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setSearchType('posts')}
                    style={[styles.toggleButton, searchType === 'posts' && { backgroundColor: theme.colors.primaryContainer }]}
                >
                    <Text style={{ color: searchType === 'posts' ? theme.colors.primary : theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>Posts</Text>
                </TouchableOpacity>
            </View>

            {loading && (searchType === 'users' ? users.length === 0 : posts.length === 0) ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={searchType === 'users' ? (users as any[]) : (posts as any[])}
                    renderItem={({ item }) => searchType === 'users' ? renderUserItem({ item: item as UserProfile }) : renderPostItem({ item: item as Post })}
                    keyExtractor={item => item.uid || item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={() => (
                        searchQuery.trim().length > 0 && !loading ? (
                            <View style={styles.introContainer}>
                                <Avatar.Icon size={80} icon={searchType === 'users' ? "account-off-outline" : "file-search-outline"} style={[styles.introIcon, { backgroundColor: theme.colors.errorContainer }]} />
                                <Text style={[styles.introText, { color: theme.colors.onSurfaceVariant }]}>
                                    No {searchType} found with "{searchQuery.trim()}".
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.introContainer}>
                                <Avatar.Icon size={80} icon={searchType === 'users' ? "account-search-outline" : "card-search-outline"} style={[styles.introIcon, { backgroundColor: theme.colors.secondaryContainer }]} />
                                <Text style={[styles.introText, { color: theme.colors.onSurfaceVariant }]}>
                                    {searchType === 'users' ? "Search for your friends and connect!" : "Search for interesting posts!"}
                                </Text>
                            </View>
                        )
                    )}
                />
            )}
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
        paddingBottom: responsiveHeight(1),
        fontWeight: '900',
        fontSize: responsiveFontSize(3),
    },
    searchContainer: {
        paddingHorizontal: responsiveWidth(4),
        paddingBottom: responsiveHeight(2),
    },
    searchBar: {
        borderRadius: 12,
        borderWidth: 1,
    },
    list: {
        paddingHorizontal: responsiveWidth(4),
    },
    listItem: {
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
    },
    userName: {
        fontWeight: '700',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignSelf: 'center',
    },
    avatarFallback: {
        alignSelf: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
    },
    introContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: responsiveHeight(15),
    },
    introIcon: {
        marginBottom: 20,
    },
    introText: {
        fontSize: responsiveFontSize(2),
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    typeToggle: {
        flexDirection: 'row',
        paddingHorizontal: responsiveWidth(5),
        marginBottom: responsiveHeight(2),
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
    },
    postItem: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    postAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    postUser: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    postCaption: {
        fontSize: 14,
    }
});

export default SearchScreen;
