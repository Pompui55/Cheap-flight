import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { user, isLoading } = useAuthStore();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Wait for navigation state to be ready before navigating
    if (!navigationState?.key) return;
    if (isLoading) return;
    if (isNavigating) return;

    setIsNavigating(true);
    
    // Use setTimeout to ensure layout is mounted
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/(tabs)/search');
      } else {
        router.replace('/auth');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, isLoading, navigationState?.key, isNavigating]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#C77DFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0118',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
