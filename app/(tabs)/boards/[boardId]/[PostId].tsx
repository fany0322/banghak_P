import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePosts } from "../../../../context/PostContext";

// string | string[] | undefined → string | undefined
const norm = (v: string | string[] | undefined) =>
  v == null ? undefined : (Array.isArray(v) ? v[0] : v).trim();

export default function PostDetail() {
  // 혹시 index에서 id로 보냈을 가능성까지 방어
  const raw = useLocalSearchParams<{
    boardId?: string | string[];
    postId?: string | string[];
    id?: string | string[]; // fallback
  }>();

  const boardId = norm(raw.boardId);
  const postId = norm(raw.postId ?? raw.id); // postId가 없으면 id로 받기

  const { posts, toggleLike } = usePosts();

  // 디버깅용(문제 계속되면 로그 보고 index 쪽 수정)
  console.log("params:", raw, "->", { boardId, postId });

  const boardName = useMemo(() => {
    switch (boardId) {
      case "1": return "자유 게시판";
      case "2": return "질문 게시판";
      case "3": return "스크랩 한 글";
      case "4": return "핫 게시판";
      default:  return "게시판";
    }
  }, [boardId]);

  const post = posts.find(
    (p) => String(p.id) === String(postId) && String(p.boardId) === String(boardId)
  );

  if (!post) {
    return (
      <SafeAreaView style={s.container}>
        <Text>게시글을 찾을 수 없습니다 😥</Text>
        <Text style={{ color: "#888", marginTop: 6 }}>
          boardId={String(boardId)} / postId={String(postId)}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Text style={s.boardName}>{boardName}</Text>
        <Text style={s.headerTitle} numberOfLines={1}>{post.title}</Text>

        <View style={s.metaRow}>
          <Text style={s.metaText}>{post.author ?? "익명"}</Text>
          <Text style={s.dot}>·</Text>
          <Text style={s.metaText}>{post.date ?? ""}</Text>
        </View>

        <Text style={s.bodyText}>{post.content}</Text>
        {post.image ? <Image source={{ uri: post.image }} style={s.heroImage} /> : null}

        <View style={s.votesRow}>
          <Pressable style={s.voteBox} onPress={() => toggleLike(post.id)}>
            <Ionicons name="thumbs-up-outline" size={22} />
          </Pressable>
        </View>
        <View style={s.voteCounts}>
          <Text style={s.voteNum}>{post.likes}</Text>
        </View>

        <Text style={s.commentHeader}>댓글 {post.comments?.length ?? 0}개</Text>
        {post.comments?.map((c: any) => (
          <View key={c.id} style={[s.commentCard, c.depth === 1 && s.replyCard]}>
            <View style={s.commentTop}>
              <Text style={s.commentName}>{c.name ?? "익명"}</Text>
              <Pressable hitSlop={8}><Ionicons name="ellipsis-vertical" size={16} color="#777" /></Pressable>
            </View>
            <Text style={s.commentBody}>{c.text}</Text>
            <View style={s.commentMeta}>
              <Text style={s.commentDate}>{c.date ?? ""}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 12 }}>
                <Ionicons name="heart-outline" size={14} color="#ff3b30" />
                <Text style={s.commentLike}>{c.like ?? 0}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={s.inputBar}>
          <Text style={{ color: "#999" }}>댓글 작성</Text>
          <Pressable><Ionicons name="send" size={18} color="#111" /></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  boardName: { fontSize: 13, color: "#888", textAlign: "center", marginBottom: 2 },
  headerTitle: { fontSize: 18, fontWeight: "700", paddingVertical: 8, textAlign: "center" },
  metaRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  metaText: { color: "#666", fontSize: 12 },
  dot: { marginHorizontal: 6, color: "#bbb" },
  bodyText: { fontSize: 15, lineHeight: 22, color: "#222", marginBottom: 12, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#eee", paddingVertical: 12 },
  heroImage: { width: "100%", aspectRatio: 4 / 3, borderRadius: 10, marginBottom: 12 },
  votesRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  voteBox: { flex: 1, borderWidth: 1, borderColor: "#eee", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  voteCounts: { flexDirection: "row", justifyContent: "space-around", marginTop: 6, marginBottom: 12 },
  voteNum: { fontSize: 14, fontWeight: "600", color: "#333" },
  commentHeader: { marginTop: 4, marginBottom: 8, color: "#666", fontSize: 12 },
  commentCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#f0f0f0" },
  replyCard: { marginLeft: 12, backgroundColor: "#fafafa" },
  commentTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  commentName: { fontWeight: "700" },
  commentBody: { color: "#333", lineHeight: 20, marginBottom: 8 },
  commentMeta: { flexDirection: "row", alignItems: "center" },
  commentDate: { color: "#888", fontSize: 12 },
  commentLike: { marginLeft: 4, color: "#666", fontSize: 12 },
  inputBar: { marginTop: 8, borderWidth: 1, borderColor: "#eee", borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
