import { BOARDS } from '@/constants/boards'; // ← 너가 만든 상수 파일 경로 그대로
import { Link } from 'expo-router';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BoardHome() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={BOARDS}
        keyExtractor={(item) => String(item.id)}
        
        contentContainerStyle={{ padding: 16 }}
        
        
        
        renderItem={({ item }) => (
          <Link
            href={{ pathname: '/(tabs)/boards/[boardId]/', params: { boardId: item.id } }}
            asChild
          >
            <TouchableOpacity style={styles.row}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
            </TouchableOpacity>
          </Link>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  row: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  desc: { color: '#666' },
});
