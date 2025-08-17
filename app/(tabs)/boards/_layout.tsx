import { Stack } from 'expo-router';

export default function BoardStackLayout() {
  return (
    <Stack>
      {/* 게시판 첫 화면 */}
      <Stack.Screen
        name="index"
        options={{ title: '게시판' }}
      />

      {/* 게시판 상세 (게시글 목록/피드) */}
      <Stack.Screen
        name="[boardId]/index"
        options={{ title: '' /* 상단은 뒤로가기만 */ }}
      />

      {/* 글쓰기 */}
      <Stack.Screen
        name="[boardId]/write"
        options={{ title: '글쓰기' }}
      />
    </Stack>
  );
}
