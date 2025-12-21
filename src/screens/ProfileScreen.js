import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, Button, Card } from "react-native-paper";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Image
          source={{ uri: "https://i.pravatar.cc/300?img=5" }}
          style={styles.avatar}
        />

        <Text style={styles.name}>Shayan</Text>
        <Text style={styles.email}>shayan@example.com</Text>

        <Button mode="contained" style={styles.button}>
          Edit Profile
        </Button>
      </Card>

      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Activity</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>589</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>120</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F8FF",
  },
  card: {
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
  },
  email: {
    fontSize: 14,
    color: "gray",
    marginBottom: 15,
  },
  button: {
    width: "60%",
    borderRadius: 10,
    marginTop: 10,
  },
  statsCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0286FF",
  },
  statLabel: {
    color: "gray",
  },
});
