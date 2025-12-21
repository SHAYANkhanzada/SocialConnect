import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Icon name="lock-reset" size={60} color="#0286FF" style={styles.icon} />
        <Text style={styles.title}>Reset Password</Text>

        <Text style={styles.subtitle}>
          Enter the email associated with your account.
        </Text>

        <TextInput
          label="Email"
          mode="outlined"
          left={<TextInput.Icon icon="email-outline" />}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <Button
          mode="contained"
          style={styles.button}
          onPress={() => alert("Reset link sent!")}
        >
          Send Reset Link
        </Button>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#E8F7FF",
    paddingHorizontal: 20,
  },
  card: {
    padding: 25,
    borderRadius: 15,
    elevation: 6,
  },
  icon: {
    alignSelf: "center",
    marginBottom: 5,
  },
  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 5,
    color: "#0286FF",
  },
  subtitle: {
    textAlign: "center",
    color: "gray",
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 5,
  },
  backText: {
    textAlign: "center",
    marginTop: 15,
    color: "#0286FF",
    fontWeight: "bold",
  },
});
