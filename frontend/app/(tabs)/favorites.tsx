import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Favorite {
  favorite_id: string;
  user_id: string;
  origin: string;
  destination: string;
  origin_city: string;
  destination_city: string;
  created_at: string;
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
    return token;
  };

  const loadFavorites = async () => {
    try {
      const token = await checkAuth();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Load favorites error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites();
  }, []);

  const removeFavorite = async (favoriteId: string) => {
    Alert.alert(
      'Supprimer le favori',
      'Voulez-vous vraiment supprimer ce trajet de vos favoris ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${BACKEND_URL}/api/favorites/${favoriteId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                setFavorites(favorites.filter((f) => f.favorite_id !== favoriteId));
              }
            } catch (error) {
              console.error('Remove favorite error:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le favori');
            }
          },
        },
      ]
    );
  };

  const searchFavorite = (favorite: Favorite) => {
    // Navigate to search with pre-filled values
    Alert.alert(
      'Rechercher ce trajet',
      `${favorite.origin_city} → ${favorite.destination_city}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rechercher',
          onPress: () => {
            // Store search params and navigate
            AsyncStorage.setItem('searchOrigin', favorite.origin);
            AsyncStorage.setItem('searchDestination', favorite.destination);
            router.push('/(tabs)/search');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C77DFF" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!isLoggedIn) {
    return (
      <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Ionicons name="heart" size={28} color="#C77DFF" />
            <Text style={styles.headerTitle}>Favoris</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="lock-closed-outline" size={64} color="#5A189A" />
            <Text style={styles.emptyText}>Connexion requise</Text>
            <Text style={styles.emptySubtext}>
              Connectez-vous pour sauvegarder vos trajets favoris
            </Text>
            <Pressable
              style={styles.loginButton}
              onPress={() => router.push('/auth')}
            >
              <LinearGradient
                colors={['#7B2CBF', '#C77DFF']}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Ionicons name="heart" size={28} color="#C77DFF" />
          <Text style={styles.headerTitle}>Favoris</Text>
          <Text style={styles.headerCount}>{favorites.length}</Text>
        </View>

        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#5A189A" />
            <Text style={styles.emptyText}>Aucun favori</Text>
            <Text style={styles.emptySubtext}>
              Recherchez des vols et ajoutez vos trajets préférés !
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#C77DFF"
              />
            }
          >
            {favorites.map((favorite) => (
              <Pressable
                key={favorite.favorite_id}
                style={({ pressed }) => [
                  styles.favoriteCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => searchFavorite(favorite)}
              >
                <LinearGradient
                  colors={['#240046', '#3C096C']}
                  style={styles.cardGradient}
                >
                  <View style={styles.routeRow}>
                    <View style={styles.routePoint}>
                      <Text style={styles.routeCode}>{favorite.origin}</Text>
                      <Text style={styles.routeCity}>{favorite.origin_city}</Text>
                    </View>

                    <View style={styles.routeLine}>
                      <View style={styles.dot} />
                      <View style={styles.line} />
                      <Ionicons name="airplane" size={18} color="#C77DFF" />
                      <View style={styles.line} />
                      <View style={styles.dot} />
                    </View>

                    <View style={styles.routePoint}>
                      <Text style={styles.routeCode}>{favorite.destination}</Text>
                      <Text style={styles.routeCity}>{favorite.destination_city}</Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Pressable
                      style={styles.searchButton}
                      onPress={() => searchFavorite(favorite)}
                    >
                      <Ionicons name="search" size={16} color="#C77DFF" />
                      <Text style={styles.searchButtonText}>Rechercher</Text>
                    </Pressable>

                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => removeFavorite(favorite.favorite_id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                    </Pressable>
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
    flex: 1,
  },
  headerCount: {
    fontSize: 16,
    color: '#9D4EDD',
    backgroundColor: 'rgba(157,78,221,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9D4EDD',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  loginButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },

  favoriteCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  cardGradient: { padding: 16 },

  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routePoint: {
    alignItems: 'center',
    width: 70,
  },
  routeCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  routeCity: {
    fontSize: 11,
    color: '#9D4EDD',
    marginTop: 2,
  },

  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C77DFF',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#7B2CBF',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#5A189A',
  },

  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(199,125,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#C77DFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  deleteButton: {
    padding: 8,
  },
});
