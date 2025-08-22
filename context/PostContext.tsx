// context/PostContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiService, Post, Comment } from "../services/api";
import { useAuth } from "./AuthContext";

interface PostContextType {
  posts: Post[];
  isLoading: boolean;
  currentPost: (Post & { comments: Comment[] }) | null;
  getPosts: (category?: string, sort?: string) => Promise<void>;
  getPost: (postId: number) => Promise<void>;
  createPost: (data: { title: string; content: string; category: string }) => Promise<void>;
  votePost: (postId: number, isUpvote: boolean) => Promise<void>;
  toggleLike: (postId: number) => Promise<void>;
  addComment: (postId: number, content: string, parentId?: number) => Promise<void>;
  refreshPosts: () => Promise<void>;
}

const PostContext = createContext<PostContextType | null>(null);

export function PostProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPost, setCurrentPost] = useState<(Post & { comments: Comment[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getPosts = async (category = '', sort = 'latest') => {
    // 이미 로딩 중이면 중복 요청 방지
    if (isLoading) {
      console.log('Request already in progress, skipping...');
      return;
    }

    try {
      setIsLoading(true);
      console.log('PostContext getPosts called with:', { category, sort });
      const result = await apiService.getPosts(1, category, sort);
      console.log('API response:', result.posts.length, 'posts');
      setPosts(result.posts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPost = async (postId: number) => {
    try {
      setIsLoading(true);
      const post = await apiService.getPost(postId);
      setCurrentPost(post);
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (data: { title: string; content: string; category: string }) => {
    try {
      if (!isLoggedIn) {
        throw new Error('Login required');
      }
      
      await apiService.createPost({
        ...data,
        is_anonymous: true,
      });
      
      // Refresh posts after creation
      await refreshPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  };

  const votePost = async (postId: number, isUpvote: boolean) => {
    try {
      if (!isLoggedIn) {
        throw new Error('Login required');
      }
      
      const result = await apiService.votePost(postId, isUpvote);
      
      // Update posts state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, upvotes: result.upvotes, downvotes: result.downvotes, vote_score: result.vote_score }
          : post
      ));
      
      // Update current post if it matches
      if (currentPost && currentPost.id === postId) {
        setCurrentPost(prev => prev ? {
          ...prev,
          upvotes: result.upvotes,
          downvotes: result.downvotes,
          vote_score: result.vote_score
        } : null);
      }
    } catch (error) {
      console.error('Failed to vote post:', error);
      throw error;
    }
  };

  const addComment = async (postId: number, content: string, parentId?: number) => {
    try {
      if (!isLoggedIn) {
        throw new Error('Login required');
      }
      
      const comment = await apiService.createComment(postId, content, parentId);
      
      // Refresh current post comments if it matches
      if (currentPost && currentPost.id === postId) {
        await getPost(postId);
      }
      
      return comment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const toggleLike = async (postId: number) => {
    try {
      if (!isLoggedIn) {
        throw new Error('Login required');
      }
      
      // 기본적으로 upvote(좋아요)로 처리
      await votePost(postId, true);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      throw error;
    }
  };

  const refreshPosts = async () => {
    await getPosts();
  };

  // Load initial posts when component mounts (제거 - 각 화면에서 필요시에만 호출)
  // useEffect(() => {
  //   getPosts();
  // }, []);

  const value: PostContextType = {
    posts,
    isLoading,
    currentPost,
    getPosts,
    getPost,
    createPost,
    votePost,
    toggleLike,
    addComment,
    refreshPosts,
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
}

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};
