import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, List, Avatar, useTheme, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ChatService, ChatRoom } from '../../services/ChatService';
import { UserService, UserProfile } from '../../services/UserService';
import { auth } from '../../services/firebase';

const ChatListScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = ChatService.subscribeToChatRooms(async (newRooms) => {
            const enrichedRooms = await Promise.all(newRooms.map(async (room) => {
                const partnerUid = room.participants.find(uid => uid !== auth.currentUser?.uid);
                if (partnerUid) {
                    const partnerProfile = await UserService.getUserProfile(partnerUid);
                    return {
                        ...room,
                        otherUser: partnerProfile ? {
                            uid: partnerProfile.uid,
                            displayName: partnerProfile.displayName,
                            photoURL: partnerProfile.photoURL
                        } : undefined
                    };
                }
                return room;
            }));
            setRooms(enrichedRooms);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }: { item: ChatRoom }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('Chat', {
                roomId: item.id,
                partnerName: item.otherUser?.displayName || 'Chat',
                partnerId: item.otherUser?.uid
            })}
        >
            <List.Item
                title={item.otherUser?.displayName || 'Unknown User'}
                description={item.lastMessage || 'No messages yet'}
                left={props => (
                    item.otherUser?.photoURL ? (
                        <Avatar.Image size={50} source={{ uri: item.otherUser.photoURL }} />
                    ) : (
                        <Avatar.Text size={50} label={item.otherUser?.displayName?.substring(0, 2).toUpperCase() || '?'} />
                    )
                )}
                right={props => (
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {item.lastMessageTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                )}
                style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
                titleStyle={{ fontWeight: 'bold' }}
            />
        </TouchableOpacity>
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
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>Messages</Text>
            <FlatList
                data={rooms}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>No conversations yet.</Text>
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
    listItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.05)',
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

export default ChatListScreen;
