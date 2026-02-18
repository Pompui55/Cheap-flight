import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Wait for navigation state to be ready
    if (!navigationState?.key) return;
    if (hasNavigated) return;

    setHasNavigated(true);
    
    // Skip auth and go directly to search
    const timer = setTimeout(() => {
      router.replace('/(tabs)/search');
    }, 500);

    return () => clearTimeout(timer);
  }, [navigationState?.key, hasNavigated]);

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
