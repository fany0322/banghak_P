import PostCard from '@/components/PostCard'; //카드 컴포넌트가 없다면 간단 텍스트로 대체
import { MOCK_POSTS } from '@/constants/boards';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';

export default function BoardDetail() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();

  const posts = React.useMemo(() => {
    const arr = Array.isArray(MOCK_POSTS) ? MOCK_POSTS : [];
    return arr.filter((p) => p.boardId === String(boardId));
  }, [boardId]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => <PostCard post={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f6' },
});
