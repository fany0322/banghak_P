// app/boards/[boardId]/write.tsx
import { usePosts } from "@/context/PostContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function WritePost() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { createPost } = usePosts();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 보드 ID에 따른 카테고리 매핑 (목록과 일치하도록 수정)
  const categoryMap: Record<string, string> = {
    '1': 'general', // 자유 게시판
    '2': 'general', // 일반 게시판
    '3': 'question', // 질문 게시판
    '4': 'general' // 기타
  };

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('입력 확인', '제목과 내용을 입력해주세요.');
      return;
    }

    if (!isLoggedIn) {
      Alert.alert('로그인 필요', '글을 작성하려면 로그인이 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      const category = categoryMap[String(boardId)] || 'general';
      
      await createPost({
        title: title.trim(),
        content: content.trim(),
        category
      });

      Alert.alert('게시글 작성', '게시글이 성공적으로 작성되었습니다.', [
        { text: '확인', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Post creation error:', error);
      Alert.alert('작성 실패', error.message || '게시글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <TextInput placeholder="제목" style={s.input} value={title} onChangeText={setTitle} />
      <TextInput
        placeholder="내용"
        style={[s.input, { height: 150 }]}
        multiline
        value={content}
        onChangeText={setContent}
      />
      <TouchableOpacity 
        style={[s.btn, isSubmitting && { backgroundColor: "#999" }]} 
        onPress={submit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff" }}>등록</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { backgroundColor: "#fff", padding: 12, marginBottom: 12, borderRadius: 8 },
  btn: { backgroundColor: "#333", padding: 14, borderRadius: 8, alignItems: "center" },
});
