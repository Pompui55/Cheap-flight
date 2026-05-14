import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { LanguageProvider } from '../contexts/LanguageContext';
import { useAuthStore } from '../stores/authStore';

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
      </Stack>
    </LanguageProvider>
  );
}
