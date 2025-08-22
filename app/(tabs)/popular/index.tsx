import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { usePosts } from "@/context/PostContext";
import { Post } from "@/services/api";

type PopularPost = {
  id: number;
  title: string;
  excerpt: string;
  likes: number;
  comments: number;
  createdAt: string;   // ISO
  thumbnail?: string | null;
};

const NOTICE = { title: "공지 사항", desc: "인기 게시물은 최근 24시간 기준입니다." };

export default function PopularList() {
  const router = useRouter();
  const { posts, getPosts, isLoading } = usePosts();
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");

  // 백엔드에서 인기 게시물 가져오기 (조회수와 투표 점수 기준으로 정렬)
  const fetchPopular = useCallback(async () => {
    try {
      setRefreshing(true);
      await getPosts('', 'popular'); // popular 정렬로 요청
    } catch (e) {
      console.warn('Failed to fetch popular posts:', e);
    } finally {
      setRefreshing(false);
    }
  }, [getPosts]);

  // 백엔드 데이터를 PopularPost 형식으로 변환
  const popularPosts = useMemo(() => {
    return posts
      .filter(post => post.upvotes > 0) // 최소 1개 이상의 추천이 있는 게시물
      .sort((a, b) => {
        // 투표 점수 + 조회수를 기준으로 정렬
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0) + (a.view_count || 0) * 0.1;
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0) + (b.view_count || 0) * 0.1;
        return scoreB - scoreA;
      })
      .slice(0, 20) // 상위 20개만
      .map((post): PopularPost => ({
        id: post.id,
        title: post.title,
        excerpt: post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content,
        likes: post.upvotes || 0,
        comments: post.comment_count || 0,
        createdAt: post.created_at,
        thumbnail: null // 추후 이미지 지원시 추가
      }));
  }, [posts]);

  useEffect(() => {
    fetchPopular();
  }, []);

  // 폴링 제거 - 수동 새로고침만 지원
  // useEffect(() => {
  //   const t = setInterval(fetchPopular, 10000);
  //   return () => clearInterval(t);
  // }, [fetchPopular]);

  const data = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return popularPosts;
    return popularPosts.filter(p => p.title.toLowerCase().includes(s) || p.excerpt.toLowerCase().includes(s));
  }, [q, popularPosts]);

  if (isLoading && !refreshing && popularPosts.length === 0) {
    return (
      <SafeAreaView style={[pStyles.container, { alignItems:"center", justifyContent:"center" }]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: PopularPost }) => (
    <Pressable style={pStyles.card} onPress={() => router.push({ pathname: "/popular/[postId]", params: { postId: item.id } })}>
      <View style={{ flex: 1, paddingRight: item.thumbnail ? 12 : 0 }}>
        <Text style={pStyles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={pStyles.content} numberOfLines={2}>{item.excerpt}</Text>
        <View style={pStyles.metaRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} />
          <Text style={pStyles.metaText}>{item.comments}</Text>
          <View style={{ width: 10 }} />
          <Ionicons name="heart-outline" size={16} />
          <Text style={pStyles.metaText}>{item.likes}</Text>
        </View>
      </View>
      {item.thumbnail ? <Image source={{ uri: item.thumbnail }} style={pStyles.thumb} /> : null}
    </Pressable>
  );

  return (
    <SafeAreaView style={pStyles.container}>
      <View style={pStyles.notice}>
        <Ionicons name="megaphone-outline" size={18} />
        <Text style={pStyles.noticeTitle}>{NOTICE.title}</Text>
        <Text style={pStyles.noticeDesc} numberOfLines={1}>{NOTICE.desc}</Text>
      </View>

      <View style={pStyles.searchBar}>
        <Ionicons name="search" size={18} />
        <TextInput
          placeholder="인기글 검색"
          value={q}
          onChangeText={setQ}
          style={pStyles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {q ? (
          <Pressable onPress={() => setQ("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={data}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPopular} />}
        ListEmptyComponent={<Text style={{ color:"#666", padding:24 }}>게시글이 없습니다.</Text>}
      />

    </SafeAreaView>
  );
}

const pStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  notice: { margin: 16, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, backgroundColor: "#f6f7fb", flexDirection: "row", alignItems: "center", gap: 8 },
  noticeTitle: { fontWeight: "700" },
  noticeDesc: { flex: 1, color: "#444" },
  searchBar: { marginHorizontal: 16, marginBottom: 8, borderRadius: 12, paddingHorizontal: 12, height: 42, backgroundColor: "#f2f3f5", flexDirection: "row", alignItems: "center", gap: 8 },
  searchInput: { flex: 1, paddingVertical: 8 },
  card: { flexDirection: "row", padding: 14, borderRadius: 16, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, alignItems: "center", marginTop: 12 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  content: { fontSize: 14, color: "#444" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  metaText: { fontSize: 12, color: "#555" },
  thumb: { width: 78, height: 78, borderRadius: 12, backgroundColor: "#eee" },
});