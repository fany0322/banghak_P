import { Link } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BoardList() {
  const boards = [
    { id: "free", name: "자유 게시판", category: "general" },
    { id: "qna", name: "질문 게시판", category: "question" },
    { id: "study", name: "학습 게시판", category: "study" },
    { id: "hot", name: "인기 게시판", category: "popular" },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={s.sectionLabel}>게시판 목록</Text>
        <View style={s.box}>
          {boards.map((b) => (
            <Link key={b.id} href={`/boards/${b.id}`} asChild>
              <TouchableOpacity style={s.boardButton}>
                <Text style={s.boardText}>{b.name}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6" },
  sectionLabel: { fontSize: 14, marginBottom: 8, color: "#555" },
  box: { backgroundColor: "#fff", borderRadius: 8, padding: 12 },
  boardButton: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  boardText: { fontSize: 16 },
});
