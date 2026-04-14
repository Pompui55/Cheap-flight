
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E0B3C',
          borderTopColor: '#5A189A',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#C77DFF',
        tabBarInactiveTintColor: '#9D4EDD',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
      initialRouteName="search"
    >
      <Tabs.Screen
        name="search"
        options={{
          title: 'Vols',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="airplane" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hotels"
        options={{
          title: 'Hôtels',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bed" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cars"
        options={{
          title: 'Voitures',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alertes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
