import { signIn, signUp } from "@/lib/auth";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type AuthModalRef = { open: () => void; close: () => void };

export default forwardRef(function AuthModal(_props, ref) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }));

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn.email({ email, password });
      } else {
        await signUp.email({ email, password, name });
      }
      setVisible(false);
      setEmail("");
      setName("");
      setPassword("");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>
              {mode === "signin" ? "Log in" : "Create account"}
            </Text>
            <Pressable
              onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              accessibilityRole="button"
            >
              <Text style={styles.switch}>
                {mode === "signin" ? "Create account" : "Log in"}
              </Text>
            </Pressable>
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}
          {mode === "signup" && (
            <>
              <Text style={styles.label}>Name</Text>
              <TextInput
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                style={styles.input}
                autoCapitalize="words"
              />
            </>
          )}
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            autoCapitalize="none"
            secureTextEntry
            textContentType="password"
          />
          <View style={styles.actions}>
            <Pressable
              onPress={() => setVisible(false)}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Pressable
                onPress={handleSubmit}
                disabled={loading || !email || !password}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel={mode === "signin" ? "Log in" : "Sign up"}
              >
                {loading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.primary}>
                    {mode === "signin" ? "Log in" : "Sign up"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 24,
  },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heading: { fontSize: 18, fontWeight: "700" },
  label: { color: "#6B7280", marginTop: 8, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  cancel: { color: "#6B7280", fontWeight: "600" },
  switch: { fontWeight: "600" },
  primary: { color: "#0EA5E9", fontWeight: "700" },
  error: { color: "#DC2626", marginBottom: 8 },
});
