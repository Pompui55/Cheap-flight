import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { LanguageProvider } from '../contexts/LanguageContext';
import { useAuthStore } from '../stores/authStore';
import mobileAds from 'react-native-google-mobile-ads';

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Vérifier l'authentification
    checkAuth();
    
    // Initialiser AdMob
    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log('AdMob initialized:', adapterStatuses);
      })
      .catch((error) => {
        console.warn('AdMob init error:', error);
      });
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
