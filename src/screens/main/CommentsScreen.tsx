import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { PostService, Comment } from '../../services/PostService';

const CommentsScreen = () => {
    const route = useRoute<any>();
    const { postId } = route.params;
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const unsubscribe = PostService.subscribeToComments(postId, (updatedComments) => {
            setComments(updatedComments);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [postId]);

    const handleSend = async () => {
        if (!newComment.trim()) return;

        setSending(true);
        try {
            await PostService.addComment(postId, newComment);
            setNewComment('');
            // No need to fetch, subscription will handle it
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSending(false);
        }
    };

    const renderItem = ({ item }: { item: Comment }) => (
        <View style={styles.commentItem}>
            <Image
                source={{ uri: item.userAvatar || 'https://i.pravatar.cc/100' }}
                style={styles.avatar}
            />
            <View style={styles.commentContent}>
                <Text style={styles.username}>{item.userName}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
            </View>
        </View>
    );

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6200ee" />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <FlatList
                data={comments}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No comments yet.</Text>}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    mode="outlined"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                    style={styles.input}
                    right={
                        <TextInput.Icon
                            icon="send"
                            disabled={sending}
                            onPress={handleSend}
                        />
                    }
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    list: {
        padding: 16,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    commentContent: {
        flex: 1,
        backgroundColor: '#f5f7fa',
        borderRadius: 12,
        padding: 12,
    },
    username: {
        fontWeight: 'bold',
        marginBottom: 4,
        fontSize: 14,
    },
    commentText: {
        fontSize: 14,
        color: '#333',
    },
    inputContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        backgroundColor: '#fff',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    }
});

export default CommentsScreen;
