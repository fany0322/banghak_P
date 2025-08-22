import { Stack } from "expo-router";
import { PostProvider } from "@/context/PostContext";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PostProvider>
        <Stack>
          {/* 탭 그룹 */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="setup" options={{ 
            headerShown: true, 
            title: "프로필 설정",
            headerBackVisible: false
          }} />
        </Stack>
      </PostProvider>
    </AuthProvider>
  );
}
