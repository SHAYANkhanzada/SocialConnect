import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { PostService } from '../../services/PostService';
import { useNavigation } from '@react-navigation/native';

const CreatePostScreen = () => {
    const navigation = useNavigation();
    const [text, setText] = useState('');
    const [image, setImage] = useState<{ uri: string; base64: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.5, // Reduced quality for Base64 storage
            maxWidth: 600, // Limit width to stay under 1MB Firestore limit
            maxHeight: 600, // Limit height
            includeBase64: true,
        });

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            if (asset.uri && asset.base64) {
                setImage({ uri: asset.uri, base64: asset.base64 });
            }
        }
    };

    const handlePost = async () => {
        if (!text && !image) {
            Alert.alert('Error', 'Please add some text or an image.');
            return;
        }

        setLoading(true);
        try {
            let uploadedImageUrl: string | null = null;
            if (image) {
                console.log("Uploading image using base64...");
                uploadedImageUrl = await PostService.uploadImage(image.base64);
                console.log("Image uploaded:", uploadedImageUrl);
            }

            await PostService.createPost(text, uploadedImageUrl);
            Alert.alert('Success', 'Post created successfully!');
            navigation.goBack();
        } catch (error: any) {
            console.error("Create Post Error:", error);
            let errorMessage = "Could not save post. Please check your internet connection.";
            if (error.code === 'permission-denied') {
                errorMessage = "Firebase permission denied. Check security rules or project quota.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <TextInput
                placeholder="What's on your mind?"
                multiline
                numberOfLines={4}
                value={text}
                onChangeText={setText}
                style={styles.input}
                mode="outlined"
            />

            {image && (
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
            )}

            <Button icon="camera" mode="outlined" onPress={pickImage} style={styles.button}>
                Add Photo
            </Button>

            <Button mode="contained" onPress={handlePost} loading={loading} style={styles.button}>
                Post
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    input: {
        marginBottom: 24,
        fontSize: 18,
        lineHeight: 28,
    },
    previewImage: {
        width: '100%',
        height: 250,
        marginBottom: 24,
        borderRadius: 20,
    },
    button: {
        marginBottom: 16,
        borderRadius: 12,
    }
});

export default CreatePostScreen;
