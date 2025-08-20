import { Stack } from "expo-router";
import { PostProvider } from "../context/PostContext";

export default function RootLayout() {
  return (
    <PostProvider>
      <Stack>
        {/* 탭 그룹 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PostProvider>
  );
}
