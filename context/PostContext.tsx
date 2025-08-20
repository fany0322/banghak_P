// context/PostContext.tsx
import React, { createContext, useContext, useState } from "react";

const PostContext = createContext<any>(null);

export function PostProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState([
    { id: "1", boardId: "1", title: "글제목", content: "첫 번째 글", time: "지금", likes: 0, comments: [] },
  ]);

  const addPost = (boardId: string, title: string, content: string, image?: string) => {
    const newPost = {
      id: String(Date.now()),
      boardId,
      title,
      content,
      image,
      time: "방금 전",
      likes: 0,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const addComment = (postId: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, { id: Date.now(), text }] } : p
      )
    );
  };

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      )
    );
  };

  return (
    <PostContext.Provider value={{ posts, addPost, addComment, toggleLike }}>
      {children}
    </PostContext.Provider>
  );
}

export const usePosts = () => useContext(PostContext);
