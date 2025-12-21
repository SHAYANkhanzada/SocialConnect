import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

export default function SignupScreen() {
  const navigation = useNavigation(); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          label="Full Name"
          mode="outlined"
          left={<TextInput.Icon icon="account" />}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          label="Email"
          mode="outlined"
          left={<TextInput.Icon icon="email" />}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry
          left={<TextInput.Icon icon="lock" />}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={() => navigation.navigate("Home")}
          style={styles.button}
        >
          Sign Up
        </Button>

        <View style={styles.footer}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#E8F7FF",
  },
  card: {
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#0286FF",
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 20,
    borderRadius: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  loginText: {
    color: "#0286FF",
    fontWeight: "bold",
  },
});
