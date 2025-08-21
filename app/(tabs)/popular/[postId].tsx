import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const MOCK = {
  p1: {
    id: "p1",
    title: "글제목제목",
    author: "익명",
    date: "07/25 10:56",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...",
    image: "https://picsum.photos/seed/1/1200/800",
    like: 200,
    dislike: 1,
    comments: [
      { id: "c1", name: "댓글이름", text: "댓글내용댓글내용댓글내용...", date: "07/25 11:56", like: 1234 },
      { id: "c2", name: "대댓글이름2", text: "대댓글내용대댓글내용대댓글내용...", date: "07/25 11:57", like: 3, depth: 1 },
      { id: "c3", name: "대댓글이름2", text: "대댓글내용...", date: "07/25 11:58", like: 5, depth: 1 },
    ],
  },
  p2: {
    id: "p2",
    title: "글제목제목2",
    author: "익명",
    date: "07/26 09:12",
    content: "짧은 요약문...",
    image: "https://picsum.photos/seed/2/1200/800",
    like: 120,
    dislike: 2,
    comments: [],
  },
  p3: {
    id: "p3",
    title: "글제목제목3",
    author: "익명",
    date: "07/27 14:21",
    content: "다른 게시물 요약...",
    image: null,
    like: 77,
    dislike: 0,
    comments: [],
  },
};

export default function PopularDetail() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const post = useMemo(() => (MOCK as any)[postId ?? "p1"] ?? (MOCK as any).p1, [postId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* 제목 */}
        <Text style={dStyles.headerTitle} numberOfLines={1}>{post.title}</Text>

        {/* 메타 */}
        <View style={dStyles.metaRow}>
          <Text style={dStyles.metaText}>{post.author}</Text>
          <Text style={dStyles.dot}>·</Text>
          <Text style={dStyles.metaText}>{post.date}</Text> 
        </View>

        {/* 본문 */}
        <Text style={dStyles.bodyText}>{post.content}</Text>

        {/* 본문 이미지 */}
        {post.image ? <Image source={{ uri: post.image }} style={dStyles.heroImage} /> : null}

        {/* 좋아요/싫어요 */}
        <View style={dStyles.votesRow}>
          <Pressable style={dStyles.voteBox}>
            <Ionicons name="thumbs-up-outline" size={22} />
          </Pressable>
          <Pressable style={dStyles.voteBox}>
            <Ionicons name="thumbs-down-outline" size={22} />
          </Pressable>
        </View>
        <View style={dStyles.voteCounts}>
          <Text style={dStyles.voteNum}>{post.like}</Text>
          <Text style={dStyles.voteNum}>{post.dislike}</Text>
        </View>

        {/* 댓글 헤더 */}
        <Text style={dStyles.commentHeader}>댓글 0{post.comments.length}개</Text>

        {/* 댓글 리스트 */}
        {post.comments.map((c: any) => (
          <View key={c.id} style={[dStyles.commentCard, c.depth === 1 && dStyles.replyCard]}>
            <View style={dStyles.commentTop}>
              <Text style={dStyles.commentName}>{c.name}</Text>
              <Pressable hitSlop={8}><Ionicons name="ellipsis-vertical" size={16} color="#777" /></Pressable>
            </View>
            <Text style={dStyles.commentBody}>{c.text}</Text>
            <View style={dStyles.commentMeta}>
              <Text style={dStyles.commentDate}>{c.date}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 12 }}>
                <Ionicons name="heart-outline" size={14} color="#ff3b30" />
                <Text style={dStyles.commentLike}>{c.like}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* 하단 입력바 (UI만) */}
        <View style={dStyles.inputBar}>
          <Text style={{ color: "#999" }}>댓글 작성</Text>
          <Pressable><Ionicons name="send" size={18} color="#111" /></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const dStyles = StyleSheet.create({
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
