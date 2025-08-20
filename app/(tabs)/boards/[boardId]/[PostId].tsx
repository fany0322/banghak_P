import { useLocalSearchParams } from "expo-router";
import { Button, SafeAreaView, StyleSheet, Text } from "react-native";
import { usePosts } from "../../../../context/PostContext";

export default function PostDetail() {
  const { boardId, postId } = useLocalSearchParams<{ boardId: string; postId: string }>();
  const { posts, toggleLike } = usePosts();


  const post = posts.find((p) => String(p.id) === String(postId) && String(p.boardId) === String(boardId));

  if (!post) {
    return (
      <SafeAreaView style={s.container}>
        <Text>게시글을 찾을 수 없습니다 😥</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>{post.title}</Text>
      <Text style={s.content}>{post.content}</Text>
      <Text style={s.meta}>❤️ {post.likes} · 💬 {post.comments.length}</Text>

      <Button title="좋아요" onPress={() => toggleLike(post.id)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  content: { fontSize: 16, marginBottom: 12 },
  meta: { fontSize: 14, color: "#666" },
});
