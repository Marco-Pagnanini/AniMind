import { useCallback, useEffect, useState, type ReactElement } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Anime, Page } from "../lib/api";

const GOLD = "#E5C07B";
const SURFACE = "#161616";
const BORDER = "#2A2A2A";
const MUTED = "#9A9A9A";

function countdown(nextAiringAt: number | null): string {
  if (!nextAiringAt) return "—";
  const diff = nextAiringAt * 1000 - Date.now();
  if (diff <= 0) return "IN ONDA";
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (d > 0) return `${d}g ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

type Props = {
  // Modalita' A: carica tutto in un colpo (mylist, ricerca).
  load?: () => Promise<Anime[]>;
  // Modalita' B: paginato con infinite scroll (home).
  loadPage?: (page: number) => Promise<Page<Anime>>;
  empty: string;
  onAdd?: (anime: Anime) => Promise<void>;
  header?: ReactElement;
};

export function AnimeList({ load, loadPage, empty, onAdd, header }: Props) {
  const [items, setItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState<Set<number>>(new Set());

  const fetchInitial = useCallback(async () => {
    try {
      setError(null);
      if (loadPage) {
        const p = await loadPage(0);
        setItems(p.content);
        setPage(0);
        setLast(p.last);
      } else if (load) {
        setItems(await load());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [load, loadPage]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const fetchMore = useCallback(async () => {
    if (!loadPage || last || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const p = await loadPage(next);
      setItems((prev) => [...prev, ...p.content]);
      setPage(next);
      setLast(p.last);
    } catch {
      // ignora: riprova al prossimo scroll
    } finally {
      setLoadingMore(false);
    }
  }, [loadPage, last, loadingMore, page]);

  const handleAdd = useCallback(
    async (anime: Anime) => {
      if (!onAdd || added.has(anime.id) || busy.has(anime.id)) return;
      setBusy((b) => new Set(b).add(anime.id));
      try {
        await onAdd(anime);
        setAdded((a) => new Set(a).add(anime.id));
      } catch {
        // errore silenzioso: card resta aggiungibile
      } finally {
        setBusy((b) => {
          const n = new Set(b);
          n.delete(anime.id);
          return n;
        });
      }
    },
    [onAdd, added, busy],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        {header}
        <ActivityIndicator color={GOLD} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      numColumns={2}
      keyExtractor={(a) => String(a.id)}
      ListHeaderComponent={header}
      columnWrapperStyle={items.length > 0 ? styles.row : undefined}
      contentContainerStyle={
        items.length === 0 ? styles.emptyWrap : styles.list
      }
      onEndReachedThreshold={0.5}
      onEndReached={fetchMore}
      refreshControl={
        <RefreshControl
          tintColor={GOLD}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchInitial();
          }}
        />
      }
      ListEmptyComponent={<Text style={styles.empty}>{error ?? empty}</Text>}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator color={GOLD} style={{ marginVertical: 16 }} />
        ) : null
      }
      renderItem={({ item }) => {
        const isAdded = added.has(item.id);
        const isBusy = busy.has(item.id);
        return (
          <View style={styles.card}>
            <View style={styles.poster}>
              <Text style={styles.posterGlyph}>◆</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {countdown(item.nextAiringAt)}
                </Text>
              </View>
              {onAdd && (
                <Pressable
                  onPress={() => handleAdd(item)}
                  disabled={isAdded || isBusy}
                  style={[styles.addBtn, isAdded && styles.addBtnDone]}
                >
                  {isBusy ? (
                    <ActivityIndicator size="small" color="#0B0B0B" />
                  ) : (
                    <Text style={styles.addBtnText}>{isAdded ? "✓" : "＋"}</Text>
                  )}
                </Pressable>
              )}
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.sub}>
                {item.nextEpisode ? `Ep. ${item.nextEpisode}` : "—"}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "stretch", justifyContent: "flex-start" },
  list: { padding: 12 },
  row: { gap: 12, marginBottom: 12 },
  emptyWrap: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
  empty: { color: MUTED, fontSize: 13, letterSpacing: 2 },
  card: {
    flex: 1,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    overflow: "hidden",
  },
  poster: {
    aspectRatio: 3 / 4,
    backgroundColor: "#0F0F0F",
    alignItems: "center",
    justifyContent: "center",
  },
  posterGlyph: { color: "#2A2A2A", fontSize: 48 },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(11,11,11,0.75)",
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: { color: GOLD, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  addBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDone: { backgroundColor: "#3A7D44" },
  addBtnText: { color: "#0B0B0B", fontSize: 20, fontWeight: "700", lineHeight: 22 },
  cardBody: { padding: 12 },
  title: { color: "#F5F5F5", fontSize: 14, fontWeight: "600" },
  sub: { color: MUTED, fontSize: 11, marginTop: 4 },
});
