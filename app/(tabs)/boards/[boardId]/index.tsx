// app/boards/[boardId]/index.tsx
import { usePosts } from "@/context/PostContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BoardDetail() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { posts } = usePosts();
  const router = useRouter();

  const boardPosts = posts.filter((p: any) => p.boardId === boardId);

  return (
    <SafeAreaView style={s.container}>
      <FlatList
        data={boardPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => router.push(`/boards/${boardId}/${item.id}`)}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{item.title}</Text>
              <Text numberOfLines={2} style={s.content}>{item.content}</Text>
              <Text style={s.meta}>{item.time} · ❤️ {item.likes} · 💬 {item.comments.length}</Text>
            </View>
            {item.image && <Image source={{ uri: item.image }} style={s.thumb} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ padding: 20 }}>게시글이 없습니다.</Text>}
      />

      <TouchableOpacity style={s.fab} onPress={() => router.push(`/boards/${boardId}/write`)}>
        <Text style={{ fontSize: 28, color: "#fff" }}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6" },
  card: { flexDirection: "row", backgroundColor: "#fff", padding: 12, marginBottom: 10, borderRadius: 8 },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  content: { fontSize: 13, color: "#444", marginBottom: 6 },
  meta: { fontSize: 12, color: "#777" },
  thumb: { width: 60, height: 60, marginLeft: 10, borderRadius: 8 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
});
