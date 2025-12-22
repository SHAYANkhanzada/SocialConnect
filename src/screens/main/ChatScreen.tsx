import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, IconButton, Avatar, useTheme } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { ChatService, ChatMessage } from '../../services/ChatService';
import { auth } from '../../services/firebase';

const ChatScreen = () => {
    const route = useRoute<any>();
    const theme = useTheme();
    const { roomId, partnerName, partnerId } = route.params;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const unsubscribe = ChatService.subscribeToMessages(roomId, (newMessages) => {
            setMessages(newMessages);
        });
        return () => unsubscribe();
    }, [roomId]);

    const handleSend = async () => {
        if (inputText.trim() === '') return;
        const text = inputText.trim();
        setInputText('');
        try {
            await ChatService.sendMessage(roomId, text);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const renderItem = ({ item }: { item: ChatMessage }) => {
        const isMine = item.senderId === auth.currentUser?.uid;
        return (
            <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
                <View style={[
                    styles.messageBubble,
                    isMine ?
                        { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 } :
                        { backgroundColor: theme.colors.surfaceVariant, borderBottomLeftRadius: 4 }
                ]}>
                    <Text style={{ color: isMine ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }}>
                        {item.text}
                    </Text>
                    <Text variant="labelSmall" style={[
                        styles.timestamp,
                        { color: isMine ? 'rgba(255,255,255,0.7)' : theme.colors.onSurfaceVariant }
                    ]}>
                        {item.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                inverted
                contentContainerStyle={styles.listContent}
            />
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
                <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    mode="flat"
                    style={[styles.input, { backgroundColor: 'transparent' }]}
                    multiline
                    dense
                />
                <IconButton
                    icon="send"
                    mode="contained"
                    containerColor={theme.colors.primary}
                    iconColor={theme.colors.onPrimary}
                    onPress={handleSend}
                    disabled={inputText.trim() === ''}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 15,
    },
    messageWrapper: {
        marginVertical: 4,
        flexDirection: 'row',
        width: '100%',
    },
    myMessageWrapper: {
        justifyContent: 'flex-end',
    },
    otherMessageWrapper: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
    },
    timestamp: {
        alignSelf: 'flex-end',
        marginTop: 4,
        fontSize: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        maxHeight: 100,
    }
});

export default ChatScreen;
