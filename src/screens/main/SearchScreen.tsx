import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Searchbar, Text, List, useTheme, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { UserService, UserProfile } from '../../services/UserService';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

const SearchScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 0) {
                handleSearch();
            } else {
                setUsers([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const results = await UserService.searchUsers(searchQuery);
            setUsers(results);
            // Removed debug alert
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

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineMedium" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>Find People</Text>
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search by username..."
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

            {loading && users.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={item => item.uid}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={() => (
                        searchQuery.length > 0 && !loading ? (
                            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No users found with that name.</Text>
                        ) : (
                            <View style={styles.introContainer}>
                                <Avatar.Icon size={80} icon="account-search-outline" style={[styles.introIcon, { backgroundColor: theme.colors.secondaryContainer }]} />
                                <Text style={[styles.introText, { color: theme.colors.onSurfaceVariant }]}>Search for your friends and connect!</Text>
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
});

export default SearchScreen;
