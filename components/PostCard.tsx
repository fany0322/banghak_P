import type { Post } from '@/constants/boards';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime())/1000;
  if (d < 60) return '지금';
  if (d < 3600) return `${Math.floor(d/60)}분 전`;
  if (d < 86400) return `${Math.floor(d/3600)}시간 전`;
  return '어제';
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <View style={s.card}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={s.title} numberOfLines={1}>{post.title}</Text>
        <Text style={s.body} numberOfLines={2}>{post.body}</Text>
        <View style={s.meta}>
          <Text style={s.time}>{timeAgo(post.createdAt)}</Text>
          <Text style={s.dot}>•</Text>
          <Text style={s.count}>💬 {post.comments}</Text>
          <Text style={s.count}>❤️ {post.likes}</Text>
        </View>
      </View>
      {post.thumb ? <Image source={{ uri: post.thumb }} style={s.thumb} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection:'row', backgroundColor:'#fff', padding:14, borderRadius:12,
    marginBottom:12, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6,
    shadowOffset:{width:0,height:3}, elevation:2 },
  title:{ fontWeight:'700', fontSize:16, marginBottom:6 },
  body:{ color:'#666' },
  meta:{ flexDirection:'row', gap:8, marginTop:8, alignItems:'center' },
  time:{ color:'#888', fontSize:12 }, dot:{ color:'#ccc', marginHorizontal:2 },
  count:{ color:'#888', fontSize:12 }, thumb:{ width:84, height:56, borderRadius:8 },
});
