import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, SafeAreaView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService, Post } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function MyPostsScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyPosts = async () => {
    if (!isLoggedIn) return;
    
    try {
      setLoading(true);
      const result = await apiService.getMyPosts();
      setPosts(result.posts);
    } catch (error) {
      console.error('Failed to load my posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyPosts();
    setRefreshing(false);
  };

  const handleDeletePost = async (postId: number, title: string) => {
    Alert.alert(
      '게시글 삭제',
      `"${title}"을(를) 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deletePost(postId);
              Alert.alert('삭제 완료', '게시글이 삭제되었습니다.');
              // 목록 새로고침
              await loadMyPosts();
            } catch (error) {
              console.error('Failed to delete post:', error);
              Alert.alert('삭제 실패', '게시글 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadMyPosts();
  }, [isLoggedIn]);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <Pressable
        style={styles.postContent}
        onPress={() => router.push(`/boards/1/${item.id}`)} // 기본 게시판으로 이동
      >
        <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.postText} numberOfLines={2}>{item.content}</Text>
        
        <View style={styles.postMeta}>
          <Text style={styles.postDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color="#666" />
              <Text style={styles.statText}>{item.view_count}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={14} color="#666" />
              <Text style={styles.statText}>{item.comment_count}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="thumbs-up-outline" size={14} color="#22c55e" />
              <Text style={styles.statText}>{item.upvotes}</Text>
            </View>
          </View>
        </View>
      </Pressable>
      
      {/* 삭제 버튼 */}
      <Pressable
        style={styles.deleteButton}
        onPress={() => handleDeletePost(item.id, item.title)}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </Pressable>
    </View>
  );

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="person-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>로그인이 필요합니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>내가 쓴 글</Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPost}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Ionicons name="document-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>작성한 게시글이 없습니다</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  postContent: {
    flex: 1,
    padding: 16,
  },
  deleteButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  postText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
});