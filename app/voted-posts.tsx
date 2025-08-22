import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService, Post } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

type VotedPost = Post & { user_vote: string };

export default function VotedPostsScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [posts, setPosts] = useState<VotedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVotedPosts = async () => {
    if (!isLoggedIn) return;
    
    try {
      setLoading(true);
      const result = await apiService.getVotedPosts();
      setPosts(result.posts);
    } catch (error) {
      console.error('Failed to load voted posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVotedPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    loadVotedPosts();
  }, [isLoggedIn]);

  const renderPost = ({ item }: { item: VotedPost }) => (
    <Pressable
      style={styles.postCard}
      onPress={() => router.push(`/boards/1/${item.id}`)} // 기본 게시판으로 이동
    >
      <View style={styles.postHeader}>
        <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[
          styles.voteIndicator,
          item.user_vote === 'upvote' ? styles.upvoteIndicator : styles.downvoteIndicator
        ]}>
          <Ionicons 
            name={item.user_vote === 'upvote' ? 'thumbs-up' : 'thumbs-down'} 
            size={16} 
            color="#fff" 
          />
        </View>
      </View>
      
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
      
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
            <Ionicons name="thumbs-up-outline" size={14} color="#ff4444" />
            <Text style={styles.statText}>{item.upvotes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="thumbs-down-outline" size={14} color="#4444ff" />
            <Text style={styles.statText}>{item.downvotes}</Text>
          </View>
        </View>
      </View>
    </Pressable>
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
        <Text style={styles.headerTitle}>추천/비추천 한 글</Text>
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
              <Ionicons name="thumbs-up-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>추천/비추천한 게시글이 없습니다</Text>
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
    padding: 16,
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
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  postTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  voteIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  upvoteIndicator: {
    backgroundColor: '#ff4444',
  },
  downvoteIndicator: {
    backgroundColor: '#4444ff',
  },
  postContent: {
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