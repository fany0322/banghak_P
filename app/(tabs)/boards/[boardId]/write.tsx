// app/boards/[boardId]/write.tsx
import { usePosts } from "@/context/PostContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

export default function WritePost() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { addPost } = usePosts();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const submit = () => {
    if (!title || !content) return;
    addPost(boardId!, title, content);
    router.back();
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
      <TouchableOpacity style={s.btn} onPress={submit}>
        <Text style={{ color: "#fff" }}>등록</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { backgroundColor: "#fff", padding: 12, marginBottom: 12, borderRadius: 8 },
  btn: { backgroundColor: "#333", padding: 14, borderRadius: 8, alignItems: "center" },
});
