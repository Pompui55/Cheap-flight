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
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays } from 'date-fns';

// IMPORTANT: Mettez votre URL backend ici après déploiement
const BACKEND_URL = 'https://cheap-flights-144.preview.emergentagent.com';

// Données locales en cas de problème réseau
const LOCAL_AIRPORTS: Airport[] = [
  { code: "CDG", city: "Paris", country: "France", name: "Charles de Gaulle" },
  { code: "ORY", city: "Paris", country: "France", name: "Orly" },
  { code: "LHR", city: "Londres", country: "Royaume-Uni", name: "Heathrow" },
  { code: "JFK", city: "New York", country: "USA", name: "John F. Kennedy" },
  { code: "LAX", city: "Los Angeles", country: "USA", name: "Los Angeles Intl" },
  { code: "DXB", city: "Dubai", country: "Émirats", name: "Dubai Intl" },
  { code: "BCN", city: "Barcelone", country: "Espagne", name: "El Prat" },
  { code: "FCO", city: "Rome", country: "Italie", name: "Fiumicino" },
  { code: "AMS", city: "Amsterdam", country: "Pays-Bas", name: "Schiphol" },
  { code: "MAD", city: "Madrid", country: "Espagne", name: "Barajas" },
  { code: "CMN", city: "Casablanca", country: "Maroc", name: "Mohammed V" },
  { code: "IST", city: "Istanbul", country: "Turquie", name: "Istanbul" },
];

const LOCAL_POPULAR: PopularDestination[] = [
  { origin: "CDG", destination: "BCN", city: "Barcelone", country: "Espagne", price_from: 85 },
  { origin: "CDG", destination: "LHR", city: "Londres", country: "Royaume-Uni", price_from: 95 },
  { origin: "CDG", destination: "FCO", city: "Rome", country: "Italie", price_from: 99 },
  { origin: "CDG", destination: "MAD", city: "Madrid", country: "Espagne", price_from: 89 },
  { origin: "CDG", destination: "AMS", city: "Amsterdam", country: "Pays-Bas", price_from: 79 },
  { origin: "CDG", destination: "CMN", city: "Casablanca", country: "Maroc", price_from: 120 },
  { origin: "CDG", destination: "JFK", city: "New York", country: "USA", price_from: 380 },
  { origin: "CDG", destination: "DXB", city: "Dubai", country: "Émirats", price_from: 350 },
];

interface Airport {
  code: string;
  city: string;
  country: string;
  name: string;
}

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

interface PopularDestination {
  origin: string;
  destination: string;
  city: string;
  country: string;
  price_from: number;
}

export default function SearchScreen() {
  const [origin, setOrigin] = useState('CDG');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [airportSearch, setAirportSearch] = useState('');

  // Load airports and popular destinations on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [airportsRes, popularRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/airports`, { timeout: 5000 }),
        axios.get(`${BACKEND_URL}/api/flights/popular`, { timeout: 5000 })
      ]);
      setAirports(airportsRes.data);
      setPopularDestinations(popularRes.data);
    } catch (error) {
      console.log('Using local data (backend not available)');
      // Utiliser les données locales si le backend n'est pas disponible
      setAirports(LOCAL_AIRPORTS);
      setPopularDestinations(LOCAL_POPULAR);
    }
  };

  const searchAirports = async (query: string) => {
    if (query.length < 2) {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/airports`, { timeout: 5000 });
        setAirports(res.data);
      } catch {
        setAirports(LOCAL_AIRPORTS);
      }
      return;
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/api/airports?query=${query}`, { timeout: 5000 });
      setAirports(response.data);
    } catch (error) {
      // Filtrer localement
      const filtered = LOCAL_AIRPORTS.filter(a => 
        a.city.toLowerCase().includes(query.toLowerCase()) ||
        a.code.toLowerCase().includes(query.toLowerCase()) ||
        a.country.toLowerCase().includes(query.toLowerCase())
      );
      setAirports(filtered.length > 0 ? filtered : LOCAL_AIRPORTS);
    }
  };

  const handleSearch = async () => {
    if (!origin || !destination) {
      alert('Veuillez sélectionner le départ et la destination');
      return;
    }

    setLoading(true);
    setSearched(false);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/flights/search`, {
        origin,
        destination,
        departure_date: departureDate,
        adults: 1,
      }, { timeout: 15000 });
      setFlights(response.data.flights || []);
      setSearched(true);
    } catch (error: any) {
      console.log('Search error, using mock data');
      // Générer des vols de démonstration si le backend n'est pas disponible
      const mockFlights = generateMockFlights(origin, destination, departureDate);
      setFlights(mockFlights);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Générer des vols de démonstration
  const generateMockFlights = (from: string, to: string, date: string): Flight[] => {
    const airlines = ['Air France', 'Lufthansa', 'British Airways', 'Emirates', 'KLM', 'Turkish Airlines'];
    const flights: Flight[] = [];
    
    for (let i = 0; i < 6; i++) {
      const hour = 6 + Math.floor(Math.random() * 16);
      const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      const durationHours = 2 + Math.floor(Math.random() * 8);
      const arrHour = (hour + durationHours) % 24;
      
      flights.push({
        flight_id: `FL${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        airline: airlines[Math.floor(Math.random() * airlines.length)],
        origin: from,
        destination: to,
        departure_time: `${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`,
        arrival_time: `${date}T${arrHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`,
        duration: `${durationHours}h ${minute}m`,
        price: Math.floor(80 + Math.random() * 400),
        currency: 'EUR',
        stops: Math.random() > 0.7 ? 1 : 0,
        flight_number: `${airlines[i % airlines.length].substring(0, 2).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
        available_seats: Math.floor(5 + Math.random() * 40),
      });
    }
    
    return flights.sort((a, b) => a.price - b.price);
  };

  const handlePopularClick = (dest: PopularDestination) => {
    setOrigin(dest.origin);
    setDestination(dest.destination);
  };

  const getAirportName = (code: string) => {
    const airport = airports.find(a => a.code === code);
    return airport ? `${airport.city} (${code})` : code;
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  // Airport Selection Modal
  const AirportModal = ({ 
    visible, 
    onClose, 
    onSelect, 
    title 
  }: { 
    visible: boolean; 
    onClose: () => void; 
    onSelect: (code: string) => void;
    title: string;
  }) => (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9D4EDD" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une ville..."
              placeholderTextColor="#9D4EDD"
              value={airportSearch}
              onChangeText={(text) => {
                setAirportSearch(text);
                searchAirports(text);
              }}
            />
          </View>

          <FlatList
            data={airports}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.airportItem}
                onPress={() => {
                  onSelect(item.code);
                  onClose();
                  setAirportSearch('');
                }}
              >
                <View style={styles.airportCode}>
                  <Text style={styles.airportCodeText}>{item.code}</Text>
                </View>
                <View style={styles.airportInfo}>
                  <Text style={styles.airportCity}>{item.city}</Text>
                  <Text style={styles.airportCountry}>{item.country}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

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
            <Text style={styles.subtitle}>Trouvez les vols les moins chers</Text>

            {/* Search Form */}
            <View style={styles.searchCard}>
              <LinearGradient
                colors={['#5A189A', '#3C096C']}
                style={styles.cardGradient}
              >
                {/* Origin */}
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowOriginModal(true)}
                >
                  <Ionicons name="location" size={20} color="#C77DFF" style={styles.inputIcon} />
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Départ</Text>
                    <Text style={styles.inputValue}>
                      {origin ? getAirportName(origin) : 'Sélectionner'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#C77DFF" />
                </TouchableOpacity>

                {/* Swap Button */}
                <TouchableOpacity 
                  style={styles.swapButton}
                  onPress={() => {
                    const temp = origin;
                    setOrigin(destination);
                    setDestination(temp);
                  }}
                >
                  <Ionicons name="swap-vertical" size={20} color="#C77DFF" />
                </TouchableOpacity>

                {/* Destination */}
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowDestModal(true)}
                >
                  <Ionicons name="location-outline" size={20} color="#C77DFF" style={styles.inputIcon} />
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Destination</Text>
                    <Text style={styles.inputValue}>
                      {destination ? getAirportName(destination) : 'Sélectionner'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#C77DFF" />
                </TouchableOpacity>

                {/* Date */}
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar" size={20} color="#C77DFF" style={styles.inputIcon} />
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Date de départ</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="AAAA-MM-JJ"
                      placeholderTextColor="#9D4EDD"
                      value={departureDate}
                      onChangeText={setDepartureDate}
                    />
                  </View>
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
                        <Text style={styles.searchButtonText}>Rechercher</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Popular Destinations */}
            {!searched && popularDestinations.length > 0 && (
              <View style={styles.popularSection}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="trending-up" size={18} color="#C77DFF" /> Destinations populaires
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {popularDestinations.map((dest) => (
                    <TouchableOpacity
                      key={dest.destination}
                      style={styles.popularCard}
                      onPress={() => handlePopularClick(dest)}
                    >
                      <LinearGradient
                        colors={['#240046', '#3C096C']}
                        style={styles.popularGradient}
                      >
                        <Text style={styles.popularCity}>{dest.city}</Text>
                        <Text style={styles.popularCountry}>{dest.country}</Text>
                        <Text style={styles.popularPrice}>
                          dès {dest.price_from} €
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Results */}
            {searched && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>
                  {flights.length} vol{flights.length > 1 ? 's' : ''} trouvé{flights.length > 1 ? 's' : ''}
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
                          <View style={styles.airlineLogo}>
                            <Ionicons name="airplane" size={20} color="#C77DFF" />
                          </View>
                          <View style={styles.airlineText}>
                            <Text style={styles.airline}>{flight.airline}</Text>
                            <Text style={styles.flightNumber}>{flight.flight_number}</Text>
                          </View>
                        </View>
                        <View style={styles.priceTag}>
                          <Text style={styles.price}>{flight.price.toFixed(0)}</Text>
                          <Text style={styles.currency}>{flight.currency}</Text>
                        </View>
                      </View>

                      {/* Flight Route */}
                      <View style={styles.routeContainer}>
                        <View style={styles.routePoint}>
                          <Text style={styles.routeTime}>{formatTime(flight.departure_time)}</Text>
                          <Text style={styles.routeCode}>{flight.origin}</Text>
                        </View>

                        <View style={styles.routeLine}>
                          <View style={styles.routeDot} />
                          <View style={styles.line} />
                          {flight.stops > 0 && (
                            <View style={styles.stopBadge}>
                              <Text style={styles.stopText}>{flight.stops} escale</Text>
                            </View>
                          )}
                          <View style={styles.line} />
                          <Ionicons name="airplane" size={16} color="#C77DFF" />
                        </View>

                        <View style={styles.routePoint}>
                          <Text style={styles.routeTime}>{formatTime(flight.arrival_time)}</Text>
                          <Text style={styles.routeCode}>{flight.destination}</Text>
                        </View>
                      </View>

                      {/* Flight Details */}
                      <View style={styles.flightDetails}>
                        <View style={styles.detailItem}>
                          <Ionicons name="time" size={14} color="#9D4EDD" />
                          <Text style={styles.detailText}>{flight.duration}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Ionicons name="people" size={14} color="#9D4EDD" />
                          <Text style={styles.detailText}>{flight.available_seats} places</Text>
                        </View>
                      </View>

                      {/* Book Button */}
                      <TouchableOpacity style={styles.bookButton}>
                        <LinearGradient
                          colors={['#7B2CBF', '#5A189A']}
                          style={styles.bookButtonGradient}
                        >
                          <Text style={styles.bookButtonText}>Sélectionner</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}

            {searched && flights.length === 0 && !loading && (
              <View style={styles.noResults}>
                <Ionicons name="sad-outline" size={48} color="#9D4EDD" />
                <Text style={styles.noResultsText}>Aucun vol trouvé</Text>
                <Text style={styles.noResultsSubtext}>Essayez d'autres dates ou destinations</Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Airport Modals */}
      <AirportModal
        visible={showOriginModal}
        onClose={() => setShowOriginModal(false)}
        onSelect={setOrigin}
        title="Aéroport de départ"
      />
      <AirportModal
        visible={showDestModal}
        onClose={() => setShowDestModal(false)}
        onSelect={setDestination}
        title="Aéroport d'arrivée"
      />
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#9D4EDD',
    marginBottom: 20,
    marginLeft: 44,
  },
  searchCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7B2CBF',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: '#9D4EDD',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  inputValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  dateInput: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    padding: 0,
  },
  swapButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(199, 125, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    marginVertical: -6,
    marginBottom: 6,
    zIndex: 1,
  },
  searchButton: {
    marginTop: 8,
    borderRadius: 14,
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
    fontWeight: '700',
    marginLeft: 8,
  },
  popularSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0AAFF',
    marginBottom: 12,
  },
  popularCard: {
    marginRight: 12,
    borderRadius: 14,
    overflow: 'hidden',
    width: 140,
  },
  popularGradient: {
    padding: 16,
    height: 100,
    justifyContent: 'space-between',
  },
  popularCity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  popularCountry: {
    fontSize: 12,
    color: '#9D4EDD',
  },
  popularPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C77DFF',
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
    borderRadius: 18,
    overflow: 'hidden',
  },
  flightGradient: {
    padding: 18,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airlineLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(199, 125, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  airlineText: {
    marginLeft: 12,
  },
  airline: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  flightNumber: {
    fontSize: 12,
    color: '#9D4EDD',
  },
  priceTag: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C77DFF',
  },
  currency: {
    fontSize: 14,
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
    width: 60,
  },
  routeTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  routeCode: {
    fontSize: 14,
    color: '#E0AAFF',
    fontWeight: '600',
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
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
  stopBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  stopText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
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
    fontSize: 13,
    marginLeft: 6,
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E0B3C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#5A189A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#7B2CBF',
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 14,
    marginLeft: 12,
  },
  airportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3C096C',
  },
  airportCode: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(199, 125, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  airportCodeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C77DFF',
  },
  airportInfo: {
    marginLeft: 16,
  },
  airportCity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  airportCountry: {
    fontSize: 13,
    color: '#9D4EDD',
  },
});
