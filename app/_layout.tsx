// app/_layout.tsx
import { Stack } from "expo-router";
import { PostProvider } from "../context/PostContext"; // 경로 주의

export default function RootLayout() {
  return (
    <PostProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PostProvider>
  );
}
