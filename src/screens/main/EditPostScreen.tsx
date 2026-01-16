import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, useTheme, Text } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PostService } from '../../services/PostService';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

const EditPostScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const { post } = route.params;

    const [text, setText] = useState(post.text || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!text.trim()) {
            Alert.alert("Error", "Post text cannot be empty");
            return;
        }

        setLoading(true);
        try {
            await PostService.updatePost(post.id, text.trim());
            Alert.alert("Success", "Post updated successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Error updating post:", error);
            Alert.alert("Error", "Could not update post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                    <Text variant="titleMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                        Edit your post
                    </Text>
                    <TextInput
                        mode="outlined"
                        placeholder="What's on your mind?"
                        value={text}
                        onChangeText={setText}
                        multiline
                        numberOfLines={6}
                        style={styles.input}
                        outlineColor={theme.colors.outlineVariant}
                        activeOutlineColor={theme.colors.primary}
                    />

                    <Button
                        mode="contained"
                        onPress={handleUpdate}
                        loading={loading}
                        disabled={loading || text.trim() === post.text}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Save Changes
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                        style={styles.cancelButton}
                    >
                        Cancel
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: responsiveWidth(5),
    },
    card: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        elevation: 2,
    },
    label: {
        marginBottom: 10,
        fontWeight: '600',
    },
    input: {
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    button: {
        borderRadius: 12,
        marginBottom: 10,
    },
    buttonContent: {
        paddingVertical: 6,
    },
    cancelButton: {
        borderRadius: 12,
    }
});

export default EditPostScreen;
