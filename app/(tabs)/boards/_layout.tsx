import { Stack } from "expo-router";

export default function BoardStackLayout() {
  return (
    <Stack>
      {/* 게시판 첫 화면 */}
      <Stack.Screen
        name="index"
        options={{ title: "게시판" }}
      />

      {/* 게시판 상세 */}
      <Stack.Screen
        name="[boardId]/index"
        options={{ title: "" }} // 뒤로가기만 표시
      />

      {/* 게시글 상세 */}
      <Stack.Screen
        name="[boardId]/[PostId]"
        options={{ title: "게시글" }}
      />

      {/* 글쓰기 */}
      <Stack.Screen
        name="[boardId]/write"
        options={{ title: "글쓰기" }}
      />
    </Stack>
  );
}
