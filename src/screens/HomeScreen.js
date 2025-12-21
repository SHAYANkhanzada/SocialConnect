import React from "react";
import { ScrollView, StyleSheet, View, Image } from "react-native";
import { Card, Text, Avatar, IconButton } from "react-native-paper";

export default function HomeScreen() {
  const posts = [
    {
      id: 1,
      user: "Ayesha",
      avatar: "https://i.pravatar.cc/100?img=1",
      image: "https://picsum.photos/700/450",
      caption: "Loving this amazing view! 🌄✨",
    },
    {
      id: 2,
      user: "Hassan",
      avatar: "https://i.pravatar.cc/100?img=2",
      image: "https://picsum.photos/700/500",
      caption: "New day, new goals! 💪🔥",
    },
    {
      id: 3,
      user: "Sarah",
      avatar: "https://i.pravatar.cc/100?img=3",
      image: "https://picsum.photos/700/550",
      caption: "Coffee + Code = Perfect ☕💻",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Explore Posts</Text>

      {posts.map((post) => (
        <Card key={post.id} style={styles.card}>
          <Card.Title
            title={post.user}
            left={() => <Avatar.Image size={45} source={{ uri: post.avatar }} />}
          />

          <Image source={{ uri: post.image }} style={styles.postImage} />

          <Card.Content>
            <Text style={styles.caption}>{post.caption}</Text>
          </Card.Content>

          <View style={styles.actions}>
            <IconButton icon="heart-outline" size={26} />
            <IconButton icon="comment-outline" size={26} />
            <IconButton icon="share-outline" size={26} />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F3F8FF",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0286FF",
  },
  card: {
    marginBottom: 18,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 0,
  },
  caption: {
    marginTop: 10,
    fontSize: 15,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
});
