import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Switch, Button, Card } from "react-native-paper";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Preferences</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Account</Text>

        <Button mode="outlined" style={styles.button}>
          Change Password
        </Button>

        <Button mode="outlined" style={styles.button}>
          Privacy Settings
        </Button>

        <Button mode="contained" style={[styles.button, { marginTop: 10 }]}>
          Logout
        </Button>
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
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
  },
  button: {
    marginTop: 10,
    borderRadius: 10,
  },
});
