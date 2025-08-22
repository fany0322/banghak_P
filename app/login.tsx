import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { login, testLogin } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleLogin(response.authentication?.idToken);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string | undefined) => {
    if (!idToken) {
      Alert.alert('로그인 실패', 'Google 인증에 실패했습니다.');
      return;
    }

    try {
      setIsLoading(true);
      await login(idToken);
      
      // Check if user needs to complete profile setup
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message?.includes('school email')) {
        Alert.alert('로그인 실패', '학교 이메일 계정으로만 로그인할 수 있습니다.');
      } else {
        Alert.alert('로그인 실패', '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    Alert.alert(
      '게스트 로그인',
      '게스트로 로그인하시겠습니까? 일부 기능이 제한됩니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '게스트 로그인', 
          onPress: () => router.replace('/(tabs)/home')
        }
      ]
    );
  };

  const handleTestLogin = async () => {
    Alert.alert(
      '테스트 로그인',
      '개발/테스트용 로그인입니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '테스트 로그인', 
          onPress: async () => {
            try {
              setIsLoading(true);
              // Use AuthContext testLogin to properly update state
              await testLogin('test@sunrint.hs.kr', '테스트 사용자');
              router.replace('/(tabs)/home');
            } catch (error: any) {
              Alert.alert('테스트 로그인 실패', error.message);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.title}>banghak_P</Text>
          <Text style={styles.subtitle}>선린인터넷고등학교 커뮤니티</Text>
        </View>

        {/* Login Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.loginButton, styles.googleButton]}
            onPress={() => promptAsync()}
            disabled={!request || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#fff" />
                <Text style={styles.buttonText}>Google로 로그인</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.loginButton, styles.testButton]}
            onPress={handleTestLogin}
            disabled={isLoading}
          >
            <Ionicons name="flask-outline" size={20} color="#ff6b35" />
            <Text style={[styles.buttonText, styles.testButtonText]}>테스트 로그인</Text>
          </Pressable>

          <Pressable
            style={[styles.loginButton, styles.guestButton]}
            onPress={handleGuestLogin}
            disabled={isLoading}
          >
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={[styles.buttonText, styles.guestButtonText]}>게스트로 둘러보기</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            학교 이메일 계정(@school.domain)으로만{'\n'}
            로그인이 가능합니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  testButton: {
    backgroundColor: '#ff6b35',
  },
  guestButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  testButtonText: {
    color: '#fff',
  },
  guestButtonText: {
    color: '#666',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});