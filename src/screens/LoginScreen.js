import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
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

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          onPress={() => navigation.navigate("Home")}
          style={styles.button}
        >
          Login
        </Button>

        <View style={styles.footer}>
          <Text>New here? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={styles.signupText}>Create Account</Text>
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
    backgroundColor: "#EAF3FF",
  },
  card: {
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#0A72FF",
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 20,
    borderRadius: 10,
    padding: 5,
  },
  forgotText: {
    textAlign: "right",
    color: "#0A72FF",
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  signupText: {
    color: "#0A72FF",
    fontWeight: "bold",
  },
});
