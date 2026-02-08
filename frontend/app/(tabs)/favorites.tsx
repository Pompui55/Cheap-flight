import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Flight {
  flight_id: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  currency: string;
  stops: number;
  flight_number: string;
}

interface Favorite {
  favorite_id: string;
  flight: Flight;
  created_at: string;
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/flights/favorites`, {
        withCredentials: true,
      });
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('Load favorites error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/flights/favorites/${favoriteId}`, {
        withCredentials: true,
      });
      setFavorites(favorites.filter((f) => f.favorite_id !== favoriteId));
    } catch (error) {
      console.error('Remove favorite error:', error);
      alert('Failed to remove favorite');
    }
  };

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="heart" size={32} color="#E0AAFF" />
          <Text style={styles.headerTitle}>Favorites</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C77DFF" />
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#5A189A" />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Start adding flights to your favorites
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {favorites.map((favorite) => (
              <View key={favorite.favorite_id} style={styles.flightCard}>
                <LinearGradient
                  colors={['#240046', '#3C096C']}
                  style={styles.flightGradient}
                >
                  {/* Header */}
                  <View style={styles.flightHeader}>
                    <View style={styles.airlineInfo}>
                      <Ionicons name="airplane" size={24} color="#C77DFF" />
                      <View style={styles.airlineText}>
                        <Text style={styles.airline}>{favorite.flight.airline}</Text>
                        <Text style={styles.flightNumber}>
                          {favorite.flight.flight_number}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => removeFavorite(favorite.favorite_id)}>
                      <Ionicons name="heart" size={24} color="#E0AAFF" />
                    </TouchableOpacity>
                  </View>

                  {/* Route */}
                  <View style={styles.routeContainer}>
                    <View style={styles.routePoint}>
                      <Text style={styles.routeTime}>
                        {new Date(favorite.flight.departure_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      <Text style={styles.routeCode}>{favorite.flight.origin}</Text>
                    </View>

                    <View style={styles.routeLine}>
                      <View style={styles.routeDot} />
                      <View style={styles.line} />
                      <Ionicons name="airplane" size={16} color="#C77DFF" />
                      <View style={styles.line} />
                      <View style={styles.routeDot} />
                    </View>

                    <View style={styles.routePoint}>
                      <Text style={styles.routeTime}>
                        {new Date(favorite.flight.arrival_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      <Text style={styles.routeCode}>{favorite.flight.destination}</Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={styles.flightDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="time" size={16} color="#9D4EDD" />
                      <Text style={styles.detailText}>{favorite.flight.duration}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="swap-horizontal" size={16} color="#9D4EDD" />
                      <Text style={styles.detailText}>
                        {favorite.flight.stops === 0 ? 'Direct' : `${favorite.flight.stops} stop(s)`}
                      </Text>
                    </View>
                  </View>

                  {/* Price */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>
                      ${favorite.flight.price.toFixed(2)}
                    </Text>
                    <TouchableOpacity style={styles.bookButton}>
                      <LinearGradient
                        colors={['#7B2CBF', '#5A189A']}
                        style={styles.bookButtonGradient}
                      >
                        <Text style={styles.bookButtonText}>Book Now</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
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
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  flightCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  flightGradient: {
    padding: 16,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airlineText: {
    marginLeft: 12,
  },
  airline: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  flightNumber: {
    fontSize: 12,
    color: '#9D4EDD',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  routePoint: {
    alignItems: 'center',
  },
  routeTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  routeCode: {
    fontSize: 14,
    color: '#E0AAFF',
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C77DFF',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#7B2CBF',
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#5A189A',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#E0AAFF',
    fontSize: 12,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C77DFF',
  },
  bookButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
