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
  const { posts: contextPosts, getPosts, isLoading } = usePosts();

  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    navigation.setOptions?.({ headerShown: true });
  }, [navigation]);

  // 보드 ID에 따른 카테고리 매핑 (백엔드와 일치하도록 수정)
  const categoryMap: Record<string, string> = {
    '1': '', // 전체 게시글 (카테고리 필터 없음)
    '2': 'general',
    '3': 'question', 
    '4': 'general'
  };

  const category = categoryMap[String(boardId)] || '';

  // --- PostContext를 사용해서 게시글 불러오기
  const loadPosts = useCallback(async () => {
    try {
      console.log('Loading posts for boardId:', boardId, 'category:', category);
      await getPosts(category, 'latest');
    } catch (e) {
      console.warn('Failed to load posts:', e);
    }
  }, [getPosts, category, boardId]);

  // 최초 로드만 (한 번만)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await loadPosts();
      }
    };
    load();
    return () => { mounted = false; };
  }, [category]);

  // 화면 복귀 시 새로고침 제거 (수동으로만)
  // useFocusEffect(
  //   useCallback(() => {
  //     // 이미 로드된 상태라면 스킵
  //     if (contextPosts.length > 0) return;
  //     loadPosts();
  //   }, [loadPosts, contextPosts.length])
  // );

  // 폴링 제거 - 수동 새로고침으로 대체
  // useEffect(() => {
  //   const t = setInterval(loadPosts, 30000);
  //   return () => clearInterval(t);
  // }, [loadPosts]);

  // 백엔드 posts를 로컬 형식에 맞게 변환
  const formattedPosts = useMemo(() => {
    const formatted = contextPosts.map((post: any) => ({
      id: post.id,
      boardId: boardId,
      title: post.title,
      content: post.content,
      createdAt: post.created_at || post.createdAt || new Date().toISOString(),
      likes: post.upvotes || post.likes || 0,
      comments: Array(post.comment_count || 0).fill(0).map((_, i) => ({ id: i })),
      thumbnailUrl: null
    }));
    console.log('Formatted posts:', formatted.map(p => ({ id: p.id, title: p.title })));
    return formatted;
  }, [contextPosts, boardId]);

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
    if (!s) return formattedPosts;
    return formattedPosts.filter(
      p =>
        (p.title ?? "").toLowerCase().includes(s) ||
        (p.content ?? "").toLowerCase().includes(s)
    );
  }, [debouncedQ, formattedPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Post }) => (
    <Pressable
      style={styles.card}
      onPress={() => {
        console.log('Post clicked:', { boardId, postId: item.id, item });
        router.push(`/boards/${boardId}/${item.id}`);
      }}
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
        {isLoading && !refreshing ? (
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
