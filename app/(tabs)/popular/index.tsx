import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

type PopularPost = {
  id: string;
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
  const [list, setList] = useState<PopularPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");

  const fetchPopular = useCallback(async () => {
    try {
      // 실제 서버 연동 시 여기를 교체하세요
      const data: PopularPost[] = [
        { id: "p1", title: "글제목제목", excerpt: "Lorem ipsum dolor sit amet, consectetur...", likes: 200, comments: 8, createdAt: new Date().toISOString(), thumbnail: "https://picsum.photos/seed/1/300/200" },
        { id: "p2", title: "글제목제목2", excerpt: "짧은 요약문이 들어갑니다...", likes: 120, comments: 3, createdAt: new Date().toISOString(), thumbnail: null },
        { id: "p3", title: "글제목제목3", excerpt: "다른 게시물 요약...", likes: 77, comments: 5, createdAt: new Date().toISOString(), thumbnail: "https://picsum.photos/seed/2/300/200" },
      ];
      setList(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPopular(); }, [fetchPopular]);
  useEffect(() => {
    const t = setInterval(fetchPopular, 10000);
    return () => clearInterval(t);
  }, [fetchPopular]);

  const data = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(p => p.title.toLowerCase().includes(s) || p.excerpt.toLowerCase().includes(s));
  }, [q, list]);

  if (loading) {
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
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPopular(); }} />}
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