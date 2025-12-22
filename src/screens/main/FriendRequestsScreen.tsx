import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Text, List, Button, Avatar, useTheme } from 'react-native-paper';
import { FriendService, FriendRequest } from '../../services/FriendService';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

const FriendRequestsScreen = () => {
    const theme = useTheme();
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = FriendService.subscribeToPendingRequests((newRequests) => {
            setRequests(newRequests);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
        try {
            await FriendService.respondToRequest(requestId, status);
            Alert.alert('Success', `Request ${status}`);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const renderItem = ({ item }: { item: FriendRequest }) => (
        <List.Item
            title={item.fromName}
            description="Sent you a friend request"
            left={props => <Avatar.Text size={40} label={item.fromName.substring(0, 2).toUpperCase()} />}
            right={props => (
                <View style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={() => handleResponse(item.id, 'accepted')}
                        style={styles.actionButton}
                        labelStyle={{ fontSize: 10 }}
                    >
                        Accept
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={() => handleResponse(item.id, 'rejected')}
                        style={styles.actionButton}
                        labelStyle={{ fontSize: 10 }}
                    >
                        Decline
                    </Button>
                </View>
            )}
            style={[styles.listItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
        />
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>Friend Requests</Text>
            <FlatList
                data={requests}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>No pending requests.</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        padding: 20,
        fontWeight: '900',
    },
    list: {
        paddingHorizontal: 16,
    },
    listItem: {
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        marginLeft: 5,
        height: 35,
        justifyContent: 'center',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        marginTop: 50,
        alignItems: 'center',
    }
});

export default FriendRequestsScreen;
