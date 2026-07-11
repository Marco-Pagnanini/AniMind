import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  getAnimePage,
  searchAnime,
  subscribe,
  type Anime,
} from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { AnimeList } from "../../components/anime-list";

const GOLD = "#E5C07B";
const BORDER = "#2A2A2A";
const MUTED = "#9A9A9A";

export default function DiscoverScreen() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const onAdd = user
    ? (anime: Anime) => subscribe(user.id, anime.id)
    : undefined;

  const loadPage = useCallback((page: number) => getAnimePage(page, 20), []);
  const searchLoad = useCallback(
    () => (submitted ? searchAnime(submitted) : Promise.resolve([])),
    [submitted],
  );

  function runSearch() {
    const q = query.trim();
    setSubmitted(q.length > 0 ? q : null);
  }

  function clearSearch() {
    setQuery("");
    setSubmitted(null);
  }

  const header = (
    <View style={styles.header}>
      <Text style={styles.kicker}>SCOPRI</Text>
      <Text style={styles.title}>Tutti gli anime</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={runSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Cerca un anime…"
          placeholderTextColor={MUTED}
        />
        {submitted ? (
          <Pressable onPress={clearSearch} style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>✕</Text>
          </Pressable>
        ) : (
          <Pressable onPress={runSearch} style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>⌕</Text>
          </Pressable>
        )}
      </View>
      {submitted ? (
        <Text style={styles.hint}>Risultati per “{submitted}”</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar style="light" />
      {submitted ? (
        <AnimeList
          key={`search:${submitted}`}
          load={searchLoad}
          onAdd={onAdd}
          header={header}
          empty="Nessun risultato."
        />
      ) : (
        <AnimeList
          key="feed"
          loadPage={loadPage}
          onAdd={onAdd}
          header={header}
          empty="Nessun anime. Fai il seed dal backend."
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0B0B" },
  header: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4 },
  kicker: { color: GOLD, fontSize: 11, letterSpacing: 4 },
  title: {
    color: "#F5F5F5",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  input: {
    flex: 1,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#F5F5F5",
    fontSize: 15,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtnText: { color: GOLD, fontSize: 18, fontWeight: "700" },
  hint: { color: MUTED, fontSize: 12, marginTop: 10, letterSpacing: 1 },
});
