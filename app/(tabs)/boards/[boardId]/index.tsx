import { usePosts } from "@/context/PostContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// ✅ 서버 API 엔드포인트만 바꿔서 사용
const BASE_URL = "https://example.com/api";

type Post = {
  id: string | number;
  boardId: string | number;
  title: string;
  content: string;
  createdAt: string;           // ISO string
  likes: number;
  comments: { id: string | number }[];
  thumbnailUrl?: string | null;
};

const NOTICE = {
  title: "공지 사항",
  desc: "2025년 게시판 규정이 새로 개정되었습니다. 꼭 확인하세요.",
};

const BOARD_TITLES: Record<string, string> = {
  1: "자유 게시판",
  question: "질문 게시판",
  scrap: "스크랩 한 글",
  hot: "핫 게시판",
  // 필요시 추가
};

export default function BoardDetail() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { posts: localPosts } = usePosts();

  const [serverPosts, setServerPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    navigation.setOptions?.({ headerShown: true });
  }, [navigation]);

  // --- 서버에서 게시글 불러오기
  const fetchFromServer = useCallback(async () => {
    setLoading(true); // move here for more accurate loading state
    try {
      const res = await fetch(`${BASE_URL}/boards/${boardId}/posts`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Post[] = await res.json();
      setServerPosts(data);
    } catch (e) {
      console.warn("fetchFromServer error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [boardId]);

  // 최초 로드
  useEffect(() => {
    fetchFromServer();
  }, [fetchFromServer]);

  // 화면 복귀 시 동기화
  useFocusEffect(
    useCallback(() => {
      fetchFromServer();
    }, [fetchFromServer])
  );

  // 자동 새로고침(폴링) - 10초
  useEffect(() => {
    const t = setInterval(fetchFromServer, 10000);
    return () => clearInterval(t);
  }, [fetchFromServer]);

  // 컨텍스트(로컬 글) + 서버 글 합치고 최신순, 같은 글은 덮어쓰기
  const merged = useMemo(() => {
    const map = new Map<string, Post>();
    const key = (p: Post) => `${p.boardId}-${p.id}`;

    // 서버 글
    serverPosts
      .filter(p => String(p.boardId) === String(boardId))
      .forEach(p => map.set(key(p), p));

    // 로컬 글(같은 보드)
    (localPosts as any[])
      .filter(p => String(p.boardId) === String(boardId))
      .forEach((p: Post) => map.set(key(p), p));

    const arr = Array.from(map.values());
    arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return arr;
  }, [serverPosts, localPosts, boardId]);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQ(q), 200);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [q]);

  // 검색
  const data = useMemo(() => {
    const s = debouncedQ.trim().toLowerCase();
    if (!s) return merged;
    return merged.filter(
      p =>
        (p.title ?? "").toLowerCase().includes(s) ||
        (p.content ?? "").toLowerCase().includes(s)
    );
  }, [debouncedQ, merged]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFromServer();
  };

  const renderItem = ({ item }: { item: Post }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/boards/${boardId}/${item.id}`)}
    >
      <View style={{ flex: 1, paddingRight: item.thumbnailUrl ? 12 : 0 }}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title || "글제목"}
        </Text>
        <Text style={styles.content} numberOfLines={2}>
          {item.content || ""}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} />
          <Text style={styles.metaText}>{item.comments?.length ?? 0}</Text>
          <View style={{ width: 10 }} />
          <Ionicons name="heart-outline" size={16} />
          <Text style={styles.metaText}>{item.likes ?? 0}</Text>
        </View>
      </View>

      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} />
      ) : null}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 타이틀 */}
      <Text style={{ fontSize: 22, fontWeight: "bold", textAlign: "center", marginTop: 18, marginBottom: 2 }}>
        {BOARD_TITLES[String(boardId)] ?? "게시판"}
      </Text>
      {/* 공지 배너 */}
      <View style={styles.notice}>
        <Ionicons name="megaphone-outline" size={18} />
        <Text style={styles.noticeTitle}>{NOTICE.title}</Text>
        <Text style={styles.noticeDesc} numberOfLines={1}>{NOTICE.desc}</Text>
      </View>

      {/* 검색바 */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} />
        <TextInput
          placeholder="게시글 검색"
          value={q}
          onChangeText={setQ}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {q ? (
          <Pressable onPress={() => setQ("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} />
          </Pressable>
        ) : null}
      </View>

      {/* 리스트 */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <Text style={{ color: "#666", padding: 24 }}>게시글이 없습니다.</Text>
            }
          />
        )}
      </View>

      {/* 플로팅 작성 버튼 */}
      <Pressable style={styles.fab} onPress={() => router.push(`/boards/${boardId}/write`)}>
        <Ionicons name="add" size={28} color="#000" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // 공지
  notice: {
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f6f7fb",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noticeTitle: { fontWeight: "700" },
  noticeDesc: { flex: 1, color: "#444" },

  // 검색
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: "#f2f3f5",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 8 },

  // 카드(첫 번째 스샷 느낌)
  card: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center",
    marginTop: 12,
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  content: { fontSize: 14, color: "#444" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  metaText: { fontSize: 12, color: "#555" },
  thumb: { width: 78, height: 78, borderRadius: 12, backgroundColor: "#eee" },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    borderWidth: 1,
    borderColor: "#000",
  },
});
