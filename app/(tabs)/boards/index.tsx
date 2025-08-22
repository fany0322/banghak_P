import { Link } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BoardList() {
  const boards = [
    { id: "free", name: "자유 게시판", category: "general", icon: "chatbubbles-outline", color: "#3b82f6" },
    { id: "qna", name: "질문 게시판", category: "question", icon: "help-circle-outline", color: "#10b981" },
    { id: "study", name: "학습 게시판", category: "study", icon: "library-outline", color: "#f59e0b" },
    { id: "hot", name: "인기 게시판", category: "popular", icon: "flame-outline", color: "#ef4444" },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={s.sectionLabel}>게시판 목록</Text>
        <View style={s.box}>
          {boards.map((b) => (
            <Link key={b.id} href={`/boards/${b.id}`} asChild>
              <TouchableOpacity style={s.boardButton}>
                <View style={s.boardContent}>
                  <View style={[s.iconWrapper, { backgroundColor: `${b.color}15` }]}>
                    <Ionicons name={b.icon as any} size={24} color={b.color} />
                  </View>
                  <Text style={s.boardText}>{b.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  sectionLabel: { 
    fontSize: 20, 
    marginBottom: 20, 
    color: "#1e293b",
    fontWeight: '700',
    marginHorizontal: 4
  },
  box: { 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginBottom: 20
  },
  boardButton: { 
    paddingVertical: 18,
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: "#f1f5f9",
    backgroundColor: '#f8fafc',
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  boardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  boardText: { 
    fontSize: 17,
    fontWeight: '600',
    color: '#374151'
  },
});
