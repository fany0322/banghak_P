import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, TextInput, Alert, ActivityIndicator } from "react-native";
import { usePosts } from "@/context/PostContext";
import { useAuth } from "@/context/AuthContext";

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
  const router = useRouter();
  const { currentPost, getPost, votePost, addComment, isLoading } = usePosts();
  const { isLoggedIn } = useAuth();
  
  const [comment, setComment] = useState('');
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Fallback to mock data for now if no backend post
  const mockPost = useMemo(() => (MOCK as any)[postId ?? "p1"] ?? (MOCK as any).p1, [postId]);
  const post = currentPost || mockPost;

  useEffect(() => {
    // Try to load from backend if postId is numeric
    const numericPostId = parseInt(postId as string);
    if (!isNaN(numericPostId)) {
      getPost(numericPostId);
    }
  }, [postId]);

  const handleVote = async (type: 'up' | 'down') => {
    if (!isLoggedIn) {
      Alert.alert('로그인 필요', '투표하려면 로그인이 필요합니다.');
      return;
    }

    if (isVoting) return;

    try {
      setIsVoting(true);
      const numericPostId = parseInt(postId as string);
      
      if (!isNaN(numericPostId)) {
        // Backend post
        await votePost(numericPostId, type === 'up');
      } else {
        // Mock data - just update UI
        if (userVote === type) {
          setUserVote(null);
        } else {
          setUserVote(type);
        }
      }
    } catch (error) {
      console.error('Vote error:', error);
      Alert.alert('오류', '투표 중 오류가 발생했습니다.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }

    if (!isLoggedIn) {
      Alert.alert('로그인 필요', '댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }

    if (isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const numericPostId = parseInt(postId as string);
      
      if (!isNaN(numericPostId)) {
        // Backend post
        await addComment(numericPostId, comment.trim());
        Alert.alert('댓글 작성', '댓글이 작성되었습니다.');
      } else {
        // Mock data
        Alert.alert('댓글 작성', '댓글이 작성되었습니다.');
      }
      
      setComment('');
    } catch (error) {
      console.error('Comment error:', error);
      Alert.alert('오류', '댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header with back button */}
      <View style={dStyles.header}>
        <Pressable 
          style={dStyles.backButton} 
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </Pressable>
        <Text style={dStyles.headerText}>인기 게시물</Text>
        <View style={{ width: 24 }} />
      </View>

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
          <Pressable 
            style={[
              dStyles.voteBox,
              userVote === 'up' && dStyles.voteBoxActive
            ]}
            onPress={() => handleVote('up')}
          >
            <Ionicons 
              name={userVote === 'up' ? "thumbs-up" : "thumbs-up-outline"} 
              size={22} 
              color={userVote === 'up' ? "#007AFF" : "#333"}
            />
          </Pressable>
          <Pressable 
            style={[
              dStyles.voteBox,
              userVote === 'down' && dStyles.voteBoxActive
            ]}
            onPress={() => handleVote('down')}
          >
            <Ionicons 
              name={userVote === 'down' ? "thumbs-down" : "thumbs-down-outline"} 
              size={22} 
              color={userVote === 'down' ? "#FF3B30" : "#333"}
            />
          </Pressable>
        </View>
        <View style={dStyles.voteCounts}>
          <Text style={[
            dStyles.voteNum,
            userVote === 'up' && { color: "#007AFF", fontWeight: "bold" }
          ]}>
            {post.like + (userVote === 'up' ? 1 : 0)}
          </Text>
          <Text style={[
            dStyles.voteNum,
            userVote === 'down' && { color: "#FF3B30", fontWeight: "bold" }
          ]}>
            {post.dislike + (userVote === 'down' ? 1 : 0)}
          </Text>
        </View>

        {/* 댓글 헤더 */}
        <Text style={dStyles.commentHeader}>
          댓글 {(post.comments?.length || 0).toString().padStart(2, '0')}개
        </Text>

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}

        {/* 댓글 리스트 */}
        {post.comments && post.comments.map((c: any) => {
          // Handle both backend and mock comment formats
          const commentData = {
            id: c.id,
            author: c.author || c.name || '익명',
            content: c.content || c.text || '',
            date: c.created_at ? new Date(c.created_at).toLocaleDateString('ko-KR', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }) : c.date || '',
            like: c.like || 0,
            depth: c.depth || 0
          };

          return (
            <View key={commentData.id} style={[dStyles.commentCard, commentData.depth === 1 && dStyles.replyCard]}>
              <View style={dStyles.commentTop}>
                <Text style={dStyles.commentName}>{commentData.author}</Text>
                <Pressable hitSlop={8}><Ionicons name="ellipsis-vertical" size={16} color="#777" /></Pressable>
              </View>
              <Text style={dStyles.commentBody}>{commentData.content}</Text>
              <View style={dStyles.commentMeta}>
                <Text style={dStyles.commentDate}>{commentData.date}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 12 }}>
                  <Ionicons name="heart-outline" size={14} color="#ff3b30" />
                  <Text style={dStyles.commentLike}>{commentData.like}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* 댓글 입력바 */}
        <View style={dStyles.inputBar}>
          <TextInput
            style={dStyles.commentInput}
            placeholder="댓글을 작성하세요..."
            placeholderTextColor="#999"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
          />
          <Pressable 
            style={dStyles.sendButton}
            onPress={handleCommentSubmit}
            disabled={!comment.trim() || isSubmittingComment}
          >
            {isSubmittingComment ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Ionicons 
                name="send" 
                size={18} 
                color={comment.trim() ? "#007AFF" : "#999"} 
              />
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const dStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerTitle: { fontSize: 18, fontWeight: "700", paddingVertical: 8, textAlign: "center" },
  metaRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  metaText: { color: "#666", fontSize: 12 },
  dot: { marginHorizontal: 6, color: "#bbb" },
  bodyText: { fontSize: 15, lineHeight: 22, color: "#222", marginBottom: 12, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#eee", paddingVertical: 12 },
  heroImage: { width: "100%", aspectRatio: 4 / 3, borderRadius: 10, marginBottom: 12 },
  votesRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  voteBox: { flex: 1, borderWidth: 1, borderColor: "#eee", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  voteBoxActive: { borderColor: "#007AFF", backgroundColor: "#f0f8ff" },
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
  inputBar: { 
    marginTop: 8, 
    borderWidth: 1, 
    borderColor: "#eee", 
    borderRadius: 20, 
    paddingVertical: 8, 
    paddingHorizontal: 14, 
    flexDirection: "row", 
    alignItems: "flex-end",
    minHeight: 44
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
});
