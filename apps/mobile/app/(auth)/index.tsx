import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
// Adjust relative path to your authService as needed
import { authService } from "@get-up-and-go/firebase/src/services/authService";

const COLORS = {
  bg: "#F4F0DD",
  surface: "#FAF8F0",
  text: "#24221B",
  muted: "#605E55",
  border: "rgba(36,34,27,0.12)",
  inputBg: "#FFFFFF",
  primary: "#A88AED",
  titleText: "#352C53",
  buttonBg: "#64539E",
};

const LoginScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await authService.login(email.trim(), password);
      // Navigate to main tab view on success
      router.replace("./(tabs)/(home)");
    } catch (error: any) {
      const errorMessage = error?.message || "Invalid email or password.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            enterKeyHint="next"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            enterKeyHint="done"
            onSubmitEditing={handleLogin}
          />
        </View>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Pressable onPress={handleSignUp}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    height: "100%",
    width: "100%",
    backgroundColor: COLORS.surface,
  },
  title: {
    color: COLORS.titleText,
    fontSize: 42,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 28,
  },
  formContainer: {
    flexDirection: "column",
    gap: 16,
  },
  inputGroup: {
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.text,
  },
  input: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB", // equivalent to border-gray-300
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 44, // Increased slightly from 36px for cleaner touch area
    backgroundColor: COLORS.inputBg,
  },
  button: {
    width: "100%",
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.buttonBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  signUpText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default LoginScreen;