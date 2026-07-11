import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { login, register } from "../lib/api";
import { useAuth } from "../lib/auth";

const GOLD = "#E5C07B";
const GOLD_DIM = "#8a7143";
const BG = "#0B0B0B";
const SURFACE = "#161616";
const BORDER = "#2A2A2A";
const MUTED = "#9A9A9A";

type Mode = "login" | "register";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";

  async function onSubmit() {
    setError(null);
    if (!username.trim() || !password) {
      setError("Username e password obbligatori");
      return;
    }
    setLoading(true);
    try {
      const user = isRegister
        ? await register(username.trim(), email.trim(), password)
        : await login(username.trim(), password);
      setUser(user);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setError(null);
    setMode(isRegister ? "login" : "register");
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.center}
      >
        <View style={styles.brandWrap}>
          <Text style={styles.brandMark}>◆</Text>
          <Text style={styles.brand}>AniWatch</Text>
          <View style={styles.rule} />
          <Text style={styles.tagline}>PROMEMORIA EPISODI ANIME</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isRegister ? "Crea account" : "Accedi"}
          </Text>

          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="il tuo username"
            placeholderTextColor={MUTED}
          />

          {isRegister && (
            <>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="email@esempio.it"
                placeholderTextColor={MUTED}
              />
            </>
          )}

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={MUTED}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={BG} />
            ) : (
              <Text style={styles.buttonText}>
                {isRegister ? "REGISTRATI" : "ENTRA"}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={switchMode} style={styles.switch}>
            <Text style={styles.switchText}>
              {isRegister
                ? "Hai già un account? "
                : "Non hai un account? "}
              <Text style={styles.switchLink}>
                {isRegister ? "Accedi" : "Registrati"}
              </Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  center: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  brandWrap: { alignItems: "center", marginBottom: 40 },
  brandMark: { color: GOLD, fontSize: 30, marginBottom: 10 },
  brand: {
    color: GOLD,
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 2,
    ...Platform.select({ ios: { fontFamily: "Georgia" }, default: {} }),
  },
  rule: { width: 56, height: 1, backgroundColor: GOLD_DIM, marginVertical: 14 },
  tagline: { color: MUTED, fontSize: 11, letterSpacing: 4 },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 24,
  },
  cardTitle: {
    color: "#F5F5F5",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    ...Platform.select({ ios: { fontFamily: "Georgia" }, default: {} }),
  },
  label: {
    color: GOLD,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#0F0F0F",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#F5F5F5",
    fontSize: 15,
  },
  error: { color: "#E06C75", fontSize: 13, marginTop: 14 },
  button: {
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 24,
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: {
    color: BG,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
  },
  switch: { marginTop: 20, alignItems: "center" },
  switchText: { color: MUTED, fontSize: 13 },
  switchLink: { color: GOLD, fontWeight: "600" },
});
