import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import notificationService from '../../src/services/notifications';

export default function TabLayout() {
  useEffect(() => {
    notificationService.registerForPushNotifications();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#9D4EDD',
        tabBarStyle: {
          backgroundColor: '#0A0118',
          borderTopColor: '#5A189A',
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="search" options={{ title: 'Vols', tabBarIcon: ({ color, size }) => <Ionicons name="airplane" size={size} color={color} /> }} />
      <Tabs.Screen name="hotels" options={{ title: 'Hotels', tabBarIcon: ({ color, size }) => <Ionicons name="bed" size={size} color={color} /> }} />
      <Tabs.Screen name="cars" options={{ title: 'Voitures', tabBarIcon: ({ color, size }) => <Ionicons name="car-sport" size={size} color={color} /> }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alertes', tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tabs>
  );
}
