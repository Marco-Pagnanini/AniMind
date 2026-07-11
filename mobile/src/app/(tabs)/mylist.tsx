import { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { getUserAnime } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { AnimeList } from "../../components/anime-list";

export default function MyListScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  // Sessione persa (es. reload) → torna al login.
  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  const load = useCallback(
    () => (user ? getUserAnime(user.id) : Promise.resolve([])),
    [user],
  );

  function logout() {
    setUser(null);
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>LA MIA LISTA</Text>
          <Text style={styles.title}>{user?.username ?? "Utente"}</Text>
        </View>
        <Pressable onPress={logout} style={styles.logout}>
          <Text style={styles.logoutText}>ESCI</Text>
        </Pressable>
      </View>
      <AnimeList load={load} empty="Non segui ancora nessun anime." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0B0B" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  kicker: { color: "#E5C07B", fontSize: 11, letterSpacing: 4 },
  title: { color: "#F5F5F5", fontSize: 26, fontWeight: "700", marginTop: 4 },
  logout: {
    borderWidth: 1,
    borderColor: "#E5C07B",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoutText: {
    color: "#E5C07B",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
});
