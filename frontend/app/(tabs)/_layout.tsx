
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
          borderTopWidth: 0,      // On enlève la bordure pour un look plus moderne
          height: 95,             // On augmente la hauteur totale
          paddingBottom: 35,      // ON REMONTE LES ICÔNES (C'est le plus important !)
          paddingTop: 10,         // On donne un peu d'espace en haut
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#FFA500',
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
            <Ionicons name="airplane" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hotels"
        options={{
          title: 'Hôtels',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bed" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cars"
        options={{
          title: 'Voitures',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alertes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
