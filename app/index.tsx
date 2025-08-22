import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isLoggedIn, isLoading, user } = useAuth();
  const [shouldCheckSetup, setShouldCheckSetup] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShouldCheckSetup(true);
    }
  }, [isLoading]);

  // Show loading while checking auth status
  if (isLoading || !shouldCheckSetup) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Not logged in, redirect to login
  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  // Logged in but needs profile setup
  if (user && (!user.grade || !user.class_num)) {
    return <Redirect href="/setup" />;
  }

  // All good, go to home
  return <Redirect href="/(tabs)/home" />;
}
