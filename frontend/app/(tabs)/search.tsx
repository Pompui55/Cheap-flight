import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Flight {
  flight_id: string;
  airline: string;
  airline_logo?: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  currency: string;
  stops: number;
  flight_number: string;
  available_seats: number;
}

export default function SearchScreen() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!origin || !destination) {
      alert('Please enter origin and destination');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/flights/search`,
        {
          origin,
          destination,
          departure_date: departureDate,
          adults: 1,
        },
        { withCredentials: true }
      );
      setFlights(response.data.flights);
      setSearched(true);
    } catch (error: any) {
      console.error('Search error:', error);
      alert(error.response?.data?.detail || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (flight: Flight) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/flights/favorites`,
        flight,
        { withCredentials: true }
      );
      alert('Added to favorites!');
    } catch (error) {
      console.error('Add to favorites error:', error);
      alert('Failed to add to favorites');
    }
  };

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="airplane" size={32} color="#C77DFF" />
              <Text style={styles.headerTitle}>CHEAP FLIGHT</Text>
            </View>

            {/* Search Form */}
            <View style={styles.searchCard}>
              <LinearGradient
                colors={['#5A189A', '#3C096C']}
                style={styles.cardGradient}
              >
                <Text style={styles.cardTitle}>Find Your Perfect Flight</Text>

                {/* Origin */}
                <View style={styles.inputContainer}>
                  <Ionicons name="location" size={20} color="#C77DFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="From (e.g., PAR)"
                    placeholderTextColor="#9D4EDD"
                    value={origin}
                    onChangeText={setOrigin}
                    autoCapitalize="characters"
                    maxLength={3}
                  />
                </View>

                {/* Destination */}
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#C77DFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="To (e.g., NYC)"
                    placeholderTextColor="#9D4EDD"
                    value={destination}
                    onChangeText={setDestination}
                    autoCapitalize="characters"
                    maxLength={3}
                  />
                </View>

                {/* Date */}
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar" size={20} color="#C77DFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Departure Date (YYYY-MM-DD)"
                    placeholderTextColor="#9D4EDD"
                    value={departureDate}
                    onChangeText={setDepartureDate}
                  />
                </View>

                {/* Search Button */}
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearch}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#7B2CBF', '#C77DFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.searchButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="search" size={20} color="#FFF" />
                        <Text style={styles.searchButtonText}>Search Flights</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Results */}
            {searched && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>
                  {flights.length} Flights Found
                </Text>

                {flights.map((flight) => (
                  <View key={flight.flight_id} style={styles.flightCard}>
                    <LinearGradient
                      colors={['#240046', '#3C096C']}
                      style={styles.flightGradient}
                    >
                      {/* Airline Info */}
                      <View style={styles.flightHeader}>
                        <View style={styles.airlineInfo}>
                          <Ionicons name="airplane" size={24} color="#C77DFF" />
                          <View style={styles.airlineText}>
                            <Text style={styles.airline}>{flight.airline}</Text>
                            <Text style={styles.flightNumber}>{flight.flight_number}</Text>
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => addToFavorites(flight)}>
                          <Ionicons name="heart-outline" size={24} color="#E0AAFF" />
                        </TouchableOpacity>
                      </View>

                      {/* Flight Route */}
                      <View style={styles.routeContainer}>
                        <View style={styles.routePoint}>
                          <Text style={styles.routeTime}>
                            {new Date(flight.departure_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                          <Text style={styles.routeCode}>{flight.origin}</Text>
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
                            {new Date(flight.arrival_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                          <Text style={styles.routeCode}>{flight.destination}</Text>
                        </View>
                      </View>

                      {/* Flight Details */}
                      <View style={styles.flightDetails}>
                        <View style={styles.detailItem}>
                          <Ionicons name="time" size={16} color="#9D4EDD" />
                          <Text style={styles.detailText}>{flight.duration}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Ionicons name="swap-horizontal" size={16} color="#9D4EDD" />
                          <Text style={styles.detailText}>
                            {flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Ionicons name="people" size={16} color="#9D4EDD" />
                          <Text style={styles.detailText}>{flight.available_seats} seats</Text>
                        </View>
                      </View>

                      {/* Price */}
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>
                          ${flight.price.toFixed(2)}
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
              </View>
            )}

            {searched && flights.length === 0 && !loading && (
              <View style={styles.noResults}>
                <Ionicons name="sad-outline" size={48} color="#9D4EDD" />
                <Text style={styles.noResultsText}>No flights found</Text>
                <Text style={styles.noResultsSubtext}>Try different dates or destinations</Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
    letterSpacing: 1,
  },
  searchCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7B2CBF',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 14,
  },
  searchButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginBottom: 16,
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
  noResults: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9D4EDD',
    marginTop: 8,
  },
});
