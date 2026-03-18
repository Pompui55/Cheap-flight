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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

// Backend URL - API avec Aviationstack
const BACKEND_URL = 'https://cheap-flights-144.preview.emergentagent.com';

// Interfaces
interface Airport {
  code: string;
  city: string;
  country: string;
  name: string;
}

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
  available_seats: number;
  is_real_data?: boolean;
}

interface PopularDestination {
  origin: string;
  destination: string;
  city: string;
  country: string;
  price_from: number;
}

// Données locales (fallback)
const LOCAL_AIRPORTS: Airport[] = [
  { code: "CDG", city: "Paris", country: "France", name: "Charles de Gaulle" },
  { code: "ORY", city: "Paris", country: "France", name: "Orly" },
  { code: "LHR", city: "Londres", country: "Royaume-Uni", name: "Heathrow" },
  { code: "JFK", city: "New York", country: "USA", name: "JFK" },
  { code: "LAX", city: "Los Angeles", country: "USA", name: "LAX" },
  { code: "DXB", city: "Dubai", country: "Émirats", name: "Dubai" },
  { code: "BCN", city: "Barcelone", country: "Espagne", name: "El Prat" },
  { code: "FCO", city: "Rome", country: "Italie", name: "Fiumicino" },
  { code: "AMS", city: "Amsterdam", country: "Pays-Bas", name: "Schiphol" },
  { code: "MAD", city: "Madrid", country: "Espagne", name: "Barajas" },
  { code: "CMN", city: "Casablanca", country: "Maroc", name: "Mohammed V" },
  { code: "IST", city: "Istanbul", country: "Turquie", name: "Istanbul" },
  { code: "ALG", city: "Alger", country: "Algérie", name: "Houari Boumediene" },
  { code: "TUN", city: "Tunis", country: "Tunisie", name: "Carthage" },
  { code: "DKR", city: "Dakar", country: "Sénégal", name: "Blaise Diagne" },
];

const LOCAL_POPULAR: PopularDestination[] = [
  { origin: "CDG", destination: "BCN", city: "Barcelone", country: "Espagne", price_from: 85 },
  { origin: "CDG", destination: "LHR", city: "Londres", country: "UK", price_from: 95 },
  { origin: "CDG", destination: "FCO", city: "Rome", country: "Italie", price_from: 99 },
  { origin: "CDG", destination: "MAD", city: "Madrid", country: "Espagne", price_from: 89 },
  { origin: "CDG", destination: "CMN", city: "Casablanca", country: "Maroc", price_from: 120 },
  { origin: "CDG", destination: "JFK", city: "New York", country: "USA", price_from: 380 },
];

// Générer des vols (fallback si pas de connexion)
const generateLocalFlights = (from: string, to: string): Flight[] => {
  const airlines = ['Air France', 'Lufthansa', 'British Airways', 'Emirates', 'KLM', 'Turkish Airlines'];
  const flights: Flight[] = [];
  
  for (let i = 0; i < 6; i++) {
    const hour = 6 + Math.floor(Math.random() * 14);
    const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    const durationHours = 2 + Math.floor(Math.random() * 6);
    const arrHour = (hour + durationHours) % 24;
    const airline = airlines[i % airlines.length];
    
    flights.push({
      flight_id: `FL${i}${Date.now()}`,
      airline: airline,
      origin: from,
      destination: to,
      departure_time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      arrival_time: `${arrHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      duration: `${durationHours}h ${minute}m`,
      price: Math.floor(80 + Math.random() * 400),
      currency: 'EUR',
      stops: Math.random() > 0.7 ? 1 : 0,
      flight_number: `${airline.substring(0, 2).toUpperCase()}${1000 + i * 111}`,
      available_seats: 5 + Math.floor(Math.random() * 40),
      is_real_data: false,
    });
  }
  
  return flights.sort((a, b) => a.price - b.price);
};

export default function SearchScreen() {
  const [origin, setOrigin] = useState('CDG');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [airports, setAirports] = useState<Airport[]>(LOCAL_AIRPORTS);
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>(LOCAL_POPULAR);
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [airportSearch, setAirportSearch] = useState('');
  const [isRealData, setIsRealData] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Set default date + check backend
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDepartureDate(tomorrow.toISOString().split('T')[0]);
    
    // Check backend status
    checkBackend();
    loadAirports();
    loadPopularDestinations();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  const loadAirports = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/airports`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setAirports(data);
        }
      }
    } catch (error) {
      console.log('Using local airports');
    }
  };

  const loadPopularDestinations = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/flights/popular`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setPopularDestinations(data);
        }
      }
    } catch (error) {
      console.log('Using local popular destinations');
    }
  };

  const handleSearch = async () => {
    if (!origin || !destination) {
      Alert.alert('Erreur', 'Veuillez sélectionner le départ et la destination');
      return;
    }

    setLoading(true);
    setSearched(false);
    setIsRealData(false);
    
    try {
      // Essayer le backend réel
      const response = await fetch(`${BACKEND_URL}/api/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departure_date: departureDate,
          adults: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.flights && data.flights.length > 0) {
          // Formater les heures si nécessaire
          const formattedFlights = data.flights.map((f: any) => ({
            ...f,
            departure_time: formatTime(f.departure_time),
            arrival_time: formatTime(f.arrival_time),
            is_real_data: true,
          }));
          setFlights(formattedFlights);
          setIsRealData(true);
          setSearched(true);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log('Backend error, using local data');
    }

    // Fallback: données locales
    setTimeout(() => {
      const localFlights = generateLocalFlights(origin, destination);
      setFlights(localFlights);
      setSearched(true);
      setLoading(false);
    }, 1000);
  };

  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '--:--';
    // Si c'est déjà au format HH:MM
    if (timeStr.length === 5 && timeStr.includes(':')) return timeStr;
    // Si c'est une date ISO
    try {
      const date = new Date(timeStr);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return timeStr.substring(0, 5);
    }
  };

  const handlePopularClick = (dest: PopularDestination) => {
    setOrigin(dest.origin);
    setDestination(dest.destination);
  };

  const getAirportName = (code: string) => {
    const airport = airports.find(a => a.code === code);
    return airport ? `${airport.city} (${code})` : code;
  };

  const filteredAirports = airportSearch.length > 0 
    ? airports.filter(a => 
        a.city.toLowerCase().includes(airportSearch.toLowerCase()) ||
        a.code.toLowerCase().includes(airportSearch.toLowerCase()) ||
        a.country.toLowerCase().includes(airportSearch.toLowerCase())
      )
    : airports;

  // Modal de sélection d'aéroport
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
              placeholder="Rechercher..."
              placeholderTextColor="#9D4EDD"
              value={airportSearch}
              onChangeText={setAirportSearch}
            />
          </View>

          <FlatList
            data={filteredAirports}
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
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="airplane" size={32} color="#C77DFF" />
              <Text style={styles.headerTitle}>CHEAP FLIGHT</Text>
              {/* Status indicator */}
              <View style={[styles.statusDot, { backgroundColor: backendStatus === 'online' ? '#10B981' : backendStatus === 'offline' ? '#EF4444' : '#F59E0B' }]} />
            </View>
            <Text style={styles.subtitle}>
              {backendStatus === 'online' ? '🟢 Vols en temps réel' : '🔴 Mode hors ligne'}
            </Text>

            {/* Search Form */}
            <View style={styles.searchCard}>
              <LinearGradient colors={['#5A189A', '#3C096C']} style={styles.cardGradient}>
                
                {/* Origin */}
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowOriginModal(true)}
                >
                  <Ionicons name="location" size={20} color="#C77DFF" />
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>DÉPART</Text>
                    <Text style={styles.inputValue}>
                      {origin ? getAirportName(origin) : 'Sélectionner'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#C77DFF" />
                </TouchableOpacity>

                {/* Swap */}
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
                  <Ionicons name="location-outline" size={20} color="#C77DFF" />
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>DESTINATION</Text>
                    <Text style={styles.inputValue}>
                      {destination ? getAirportName(destination) : 'Sélectionner'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#C77DFF" />
                </TouchableOpacity>

                {/* Date */}
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar" size={20} color="#C77DFF" />
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>DATE</Text>
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
            {!searched && (
              <View style={styles.popularSection}>
                <Text style={styles.sectionTitle}>✈️ Destinations populaires</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {popularDestinations.map((dest) => (
                    <TouchableOpacity
                      key={dest.destination}
                      style={styles.popularCard}
                      onPress={() => handlePopularClick(dest)}
                    >
                      <LinearGradient colors={['#240046', '#3C096C']} style={styles.popularGradient}>
                        <Text style={styles.popularCity}>{dest.city}</Text>
                        <Text style={styles.popularCountry}>{dest.country}</Text>
                        <Text style={styles.popularPrice}>dès {dest.price_from} €</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Results */}
            {searched && (
              <View style={styles.resultsContainer}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    {flights.length} vol{flights.length > 1 ? 's' : ''} trouvé{flights.length > 1 ? 's' : ''}
                  </Text>
                  {isRealData && (
                    <View style={styles.realDataBadge}>
                      <Text style={styles.realDataText}>EN DIRECT</Text>
                    </View>
                  )}
                </View>

                {flights.map((flight) => (
                  <View key={flight.flight_id} style={styles.flightCard}>
                    <LinearGradient colors={['#240046', '#3C096C']} style={styles.flightGradient}>
                      {/* Header */}
                      <View style={styles.flightHeader}>
                        <View style={styles.airlineInfoRow}>
                          <View style={styles.airlineLogo}>
                            <Ionicons name="airplane" size={18} color="#C77DFF" />
                          </View>
                          <View>
                            <Text style={styles.airline}>{flight.airline}</Text>
                            <Text style={styles.flightNumber}>{flight.flight_number}</Text>
                          </View>
                        </View>
                        <View style={styles.priceTag}>
                          <Text style={styles.price}>{Math.round(flight.price)}</Text>
                          <Text style={styles.currency}>{flight.currency}</Text>
                        </View>
                      </View>

                      {/* Route */}
                      <View style={styles.routeContainer}>
                        <View style={styles.routePoint}>
                          <Text style={styles.routeTime}>{flight.departure_time}</Text>
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
                          <Ionicons name="airplane" size={14} color="#C77DFF" />
                        </View>

                        <View style={styles.routePoint}>
                          <Text style={styles.routeTime}>{flight.arrival_time}</Text>
                          <Text style={styles.routeCode}>{flight.destination}</Text>
                        </View>
                      </View>

                      {/* Details */}
                      <View style={styles.flightDetails}>
                        <View style={styles.detailItem}>
                          <Ionicons name="time-outline" size={14} color="#9D4EDD" />
                          <Text style={styles.detailText}>{flight.duration}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Ionicons name="people-outline" size={14} color="#9D4EDD" />
                          <Text style={styles.detailText}>{flight.available_seats} places</Text>
                        </View>
                        {flight.is_real_data && (
                          <View style={styles.detailItem}>
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                            <Text style={[styles.detailText, { color: '#10B981' }]}>Réel</Text>
                          </View>
                        )}
                      </View>

                      {/* Book Button */}
                      <TouchableOpacity style={styles.bookButton}>
                        <LinearGradient colors={['#7B2CBF', '#5A189A']} style={styles.bookButtonGradient}>
                          <Text style={styles.bookButtonText}>Sélectionner</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                ))}

                {/* Back to search */}
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setSearched(false)}
                >
                  <Ionicons name="arrow-back" size={20} color="#C77DFF" />
                  <Text style={styles.backButtonText}>Nouvelle recherche</Text>
                </TouchableOpacity>
              </View>
            )}

            {searched && flights.length === 0 && !loading && (
              <View style={styles.noResults}>
                <Ionicons name="sad-outline" size={48} color="#9D4EDD" />
                <Text style={styles.noResultsText}>Aucun vol trouvé</Text>
                <TouchableOpacity onPress={() => setSearched(false)}>
                  <Text style={styles.tryAgainText}>Essayer une autre recherche</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Modals */}
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
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingTop: 8 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginLeft: 12, flex: 1 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 4 },
  subtitle: { fontSize: 14, color: '#9D4EDD', marginBottom: 20, marginLeft: 44 },
  searchCard: { marginBottom: 24, borderRadius: 20, overflow: 'hidden' },
  cardGradient: { padding: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7B2CBF',
  },
  inputContent: { flex: 1, marginLeft: 12 },
  inputLabel: { fontSize: 10, color: '#9D4EDD', marginBottom: 2 },
  inputValue: { fontSize: 16, color: '#FFF', fontWeight: '600' },
  dateInput: { fontSize: 16, color: '#FFF', fontWeight: '600', padding: 0 },
  swapButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(199,125,255,0.2)',
    padding: 8,
    borderRadius: 20,
    marginVertical: -6,
    marginBottom: 6,
  },
  searchButton: { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  searchButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  popularSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#E0AAFF', marginBottom: 12 },
  popularCard: { marginRight: 12, borderRadius: 14, overflow: 'hidden', width: 130 },
  popularGradient: { padding: 14, height: 90, justifyContent: 'space-between' },
  popularCity: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },
  popularCountry: { fontSize: 11, color: '#9D4EDD' },
  popularPrice: { fontSize: 13, fontWeight: '700', color: '#C77DFF' },
  resultsContainer: { marginBottom: 24 },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  resultsTitle: { fontSize: 18, fontWeight: 'bold', color: '#C77DFF', flex: 1 },
  realDataBadge: { backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  realDataText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  flightCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  flightGradient: { padding: 16 },
  flightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  airlineInfoRow: { flexDirection: 'row', alignItems: 'center' },
  airlineLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(199,125,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  airline: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  flightNumber: { fontSize: 11, color: '#9D4EDD' },
  priceTag: { alignItems: 'flex-end' },
  price: { fontSize: 26, fontWeight: 'bold', color: '#C77DFF' },
  currency: { fontSize: 12, color: '#9D4EDD' },
  routeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  routePoint: { alignItems: 'center', width: 55 },
  routeTime: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 2 },
  routeCode: { fontSize: 13, color: '#E0AAFF', fontWeight: '600' },
  routeLine: { flexDirection: 'row', alignItems: 'center', flex: 1, marginHorizontal: 10 },
  routeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C77DFF' },
  line: { flex: 1, height: 2, backgroundColor: '#7B2CBF' },
  stopBadge: { backgroundColor: '#FF6B35', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginHorizontal: 4 },
  stopText: { fontSize: 9, color: '#FFF', fontWeight: '600' },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#5A189A',
  },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { color: '#E0AAFF', fontSize: 12, marginLeft: 5 },
  bookButton: { borderRadius: 10, overflow: 'hidden' },
  bookButtonGradient: { paddingVertical: 12, alignItems: 'center' },
  bookButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  backButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  backButtonText: { color: '#C77DFF', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  noResults: { alignItems: 'center', paddingVertical: 48 },
  noResultsText: { fontSize: 18, fontWeight: 'bold', color: '#C77DFF', marginTop: 16 },
  tryAgainText: { color: '#9D4EDD', marginTop: 12, textDecorationLine: 'underline' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E0B3C', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#5A189A',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#7B2CBF',
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 16, paddingVertical: 14, marginLeft: 12 },
  airportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3C096C',
  },
  airportCode: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: 'rgba(199,125,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  airportCodeText: { fontSize: 13, fontWeight: 'bold', color: '#C77DFF' },
  airportInfo: { marginLeft: 14 },
  airportCity: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  airportCountry: { fontSize: 12, color: '#9D4EDD' },
});
