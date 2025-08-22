import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useEffect, useState } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { usePosts } from "../../../../context/PostContext";
import { apiService, Post as ApiPost, Comment } from "../../../../services/api";

// string | string[] | undefined → string | undefined
const norm = (v: string | string[] | undefined) =>
  v == null ? undefined : (Array.isArray(v) ? v[0] : v).trim();

export default function PostDetail() {
  // 파일명이 [PostId].tsx이므로 PostId로 받아야 함
  const raw = useLocalSearchParams<{
    boardId?: string | string[];
    PostId?: string | string[];
    postId?: string | string[]; // 호환성을 위한 fallback
    id?: string | string[]; // 추가 fallback
  }>();

  const boardId = norm(raw.boardId);
  const postId = norm(raw.PostId ?? raw.postId ?? raw.id); // PostId 우선, fallback으로 postId, id

  const { votePost } = usePosts();
  const [post, setPost] = useState<(ApiPost & { comments: Comment[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // 백엔드에서 게시글 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        setError(null);
        const postData = await apiService.getPost(Number(postId));
        setPost(postData);
      } catch (err: any) {
        console.error('Failed to fetch post:', err);
        setError(err.message || '게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <SafeAreaView style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>게시글을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={s.container}>
        <Text>게시글을 찾을 수 없습니다 😥</Text>
        <Text style={{ color: "#888", marginTop: 6 }}>
          boardId={String(boardId)} / postId={String(postId)}
        </Text>
        {error && <Text style={{ color: "#ff0000", marginTop: 6 }}>{error}</Text>}
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
          <Text style={s.metaText}>{new Date(post.created_at).toLocaleDateString()}</Text>
        </View>

        <Text style={s.bodyText}>{post.content}</Text>

        <View style={s.votesRow}>
          <Pressable 
            style={[s.voteBox, { marginRight: 12 }]} 
            onPress={async () => {
              try {
                // upvote
                const result = await apiService.votePost(post.id, true);
                setPost(prev => prev ? {
                  ...prev,
                  upvotes: result.upvotes,
                  downvotes: result.downvotes,
                  vote_score: result.vote_score
                } : null);
              } catch (error) {
                console.error('Vote failed:', error);
              }
            }}
          >
            <Ionicons name="thumbs-up-outline" size={22} color="#ff4444" />
          </Pressable>
          
          <Pressable 
            style={s.voteBox} 
            onPress={async () => {
              try {
                // downvote
                const result = await apiService.votePost(post.id, false);
                setPost(prev => prev ? {
                  ...prev,
                  upvotes: result.upvotes,
                  downvotes: result.downvotes,
                  vote_score: result.vote_score
                } : null);
              } catch (error) {
                console.error('Vote failed:', error);
              }
            }}
          >
            <Ionicons name="thumbs-down-outline" size={22} color="#4444ff" />
          </Pressable>
        </View>
        <View style={s.voteCounts}>
          <Text style={[s.voteNum, { color: '#ff4444' }]}>👍 {post.upvotes || 0}</Text>
          <Text style={[s.voteNum, { color: '#4444ff', marginLeft: 16 }]}>👎 {post.downvotes || 0}</Text>
        </View>

        <Text style={s.commentHeader}>댓글 {post.comments?.length ?? 0}개</Text>
        {post.comments?.map((c: Comment) => (
          <View key={c.id} style={[s.commentCard, c.parent_id && s.replyCard]}>
            <View style={s.commentTop}>
              <Text style={s.commentName}>{c.author ?? "익명"}</Text>
              <Pressable hitSlop={8}><Ionicons name="ellipsis-vertical" size={16} color="#777" /></Pressable>
            </View>
            <Text style={s.commentBody}>{c.content}</Text>
            <View style={s.commentMeta}>
              <Text style={s.commentDate}>{new Date(c.created_at).toLocaleDateString()}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 12 }}>
                <Ionicons name="heart-outline" size={14} color="#ff3b30" />
                <Text style={s.commentLike}>0</Text>
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
