import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Modal,
  FlatList,
  Alert,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

// Backend URL
const BACKEND_URL = 'https://cheap-flights-144.preview.emergentagent.com';

// Interfaces
interface Airport {
  code: string;
  city: string;
  country: string;
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
}

interface PopularDestination {
  origin: string;
  destination: string;
  city: string;
  country: string;
  price_from: number;
}

// Données locales
const LOCAL_AIRPORTS: Airport[] = [
  { code: "CDG", city: "Paris", country: "France" },
  { code: "ORY", city: "Paris Orly", country: "France" },
  { code: "LHR", city: "Londres", country: "UK" },
  { code: "JFK", city: "New York", country: "USA" },
  { code: "LAX", city: "Los Angeles", country: "USA" },
  { code: "MIA", city: "Miami", country: "USA" },
  { code: "DXB", city: "Dubai", country: "Émirats" },
  { code: "BCN", city: "Barcelone", country: "Espagne" },
  { code: "FCO", city: "Rome", country: "Italie" },
  { code: "AMS", city: "Amsterdam", country: "Pays-Bas" },
  { code: "MAD", city: "Madrid", country: "Espagne" },
  { code: "CMN", city: "Casablanca", country: "Maroc" },
  { code: "IST", city: "Istanbul", country: "Turquie" },
  { code: "ALG", city: "Alger", country: "Algérie" },
  { code: "TUN", city: "Tunis", country: "Tunisie" },
  { code: "DKR", city: "Dakar", country: "Sénégal" },
  { code: "BKK", city: "Bangkok", country: "Thaïlande" },
  { code: "SIN", city: "Singapour", country: "Singapour" },
  { code: "HKG", city: "Hong Kong", country: "Chine" },
  { code: "NRT", city: "Tokyo Narita", country: "Japon" },
  { code: "HND", city: "Tokyo Haneda", country: "Japon" },
  { code: "ICN", city: "Séoul", country: "Corée du Sud" },
  { code: "PEK", city: "Pékin", country: "Chine" },
  { code: "SYD", city: "Sydney", country: "Australie" },
  { code: "MEX", city: "Mexico", country: "Mexique" },
  { code: "GRU", city: "São Paulo", country: "Brésil" },
  { code: "JNB", city: "Johannesburg", country: "Afrique du Sud" },
  { code: "CAI", city: "Le Caire", country: "Égypte" },
  { code: "DOH", city: "Doha", country: "Qatar" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaisie" },
  { code: "DEL", city: "New Delhi", country: "Inde" },
  { code: "BOM", city: "Mumbai", country: "Inde" },
  { code: "MRU", city: "Maurice", country: "Île Maurice" },
  { code: "RUN", city: "La Réunion", country: "France" },
  { code: "PPT", city: "Tahiti", country: "Polynésie" },
  { code: "FDF", city: "Fort-de-France", country: "Martinique" },
  { code: "PTP", city: "Pointe-à-Pitre", country: "Guadeloupe" },
];

const LOCAL_POPULAR: PopularDestination[] = [
  { origin: "CDG", destination: "BCN", city: "Barcelone", country: "Espagne", price_from: 85 },
  { origin: "CDG", destination: "LHR", city: "Londres", country: "UK", price_from: 95 },
  { origin: "CDG", destination: "FCO", city: "Rome", country: "Italie", price_from: 99 },
  { origin: "CDG", destination: "CMN", city: "Casablanca", country: "Maroc", price_from: 120 },
  { origin: "CDG", destination: "JFK", city: "New York", country: "USA", price_from: 380 },
];

// Générer des vols locaux
const generateFlights = (from: string, to: string): Flight[] => {
  const airlines = ['Air France', 'Lufthansa', 'British Airways', 'Emirates', 'KLM', 'Turkish Airlines'];
  const flights: Flight[] = [];
  
  for (let i = 0; i < 8; i++) {
    const hour = 6 + Math.floor(Math.random() * 14);
    const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    const durationHours = 2 + Math.floor(Math.random() * 8);
    const arrHour = (hour + durationHours) % 24;
    const airline = airlines[i % airlines.length];
    
    flights.push({
      flight_id: `FL${i}${Date.now()}`,
      airline: airline,
      origin: from,
      destination: to,
      departure_time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      arrival_time: `${arrHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      duration: `${durationHours}h${minute > 0 ? minute + 'm' : ''}`,
      price: Math.floor(50 + Math.random() * 500),
      currency: 'EUR',
      stops: Math.random() > 0.7 ? 1 : 0,
      flight_number: `${airline.substring(0, 2).toUpperCase()}${1000 + Math.floor(Math.random() * 9000)}`,
      available_seats: 5 + Math.floor(Math.random() * 40),
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
  const [airports] = useState<Airport[]>(LOCAL_AIRPORTS);
  const [popularDestinations] = useState<PopularDestination[]>(LOCAL_POPULAR);
  
  // Modals
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [airportSearch, setAirportSearch] = useState('');

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDepartureDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSearch = async () => {
    if (!origin || !destination) {
      Alert.alert('Erreur', 'Veuillez sélectionner le départ et la destination');
      return;
    }
    if (origin === destination) {
      Alert.alert('Erreur', 'Le départ et la destination doivent être différents');
      return;
    }

    setLoading(true);
    setSearched(false);
    
    try {
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
          const formatted = data.flights.map((f: any) => ({
            ...f,
            departure_time: f.departure_time?.substring(11, 16) || f.departure_time,
            arrival_time: f.arrival_time?.substring(11, 16) || f.arrival_time,
          }));
          setFlights(formatted);
          setSearched(true);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log('Using local flights');
    }

    // Fallback local
    setTimeout(() => {
      setFlights(generateFlights(origin, destination));
      setSearched(true);
      setLoading(false);
    }, 1000);
  };

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  const handleBookFlight = () => {
    if (selectedFlight) {
      Alert.alert(
        'Réservation',
        `Vol ${selectedFlight.flight_number}\n${selectedFlight.origin} → ${selectedFlight.destination}\n\nPrix: ${selectedFlight.price} ${selectedFlight.currency}\n\nFonctionnalité de paiement bientôt disponible!`,
        [{ text: 'OK', onPress: () => setSelectedFlight(null) }]
      );
    }
  };

  const getAirportName = (code: string) => {
    const airport = airports.find(a => a.code === code);
    return airport ? airport.city : code;
  };

  const filteredAirports = airportSearch
    ? airports.filter(a =>
        a.city.toLowerCase().includes(airportSearch.toLowerCase()) ||
        a.code.toLowerCase().includes(airportSearch.toLowerCase()) ||
        a.country.toLowerCase().includes(airportSearch.toLowerCase())
      )
    : airports;

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="airplane" size={28} color="#C77DFF" />
            <Text style={styles.headerTitle}>CHEAP FLIGHT</Text>
          </View>
          <Text style={styles.subtitle}>Trouvez les vols les moins chers</Text>

          {/* Search Form */}
          <View style={styles.searchCard}>
            <LinearGradient colors={['#5A189A', '#3C096C']} style={styles.cardGradient}>
              
              {/* Origin */}
              <Pressable 
                style={styles.inputContainer}
                onPress={() => {
                  setAirportSearch('');
                  setShowOriginModal(true);
                }}
              >
                <Ionicons name="airplane-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>DÉPART</Text>
                  <Text style={styles.inputValue}>
                    {origin ? `${getAirportName(origin)} (${origin})` : 'Choisir...'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
              </Pressable>

              {/* Swap */}
              <Pressable 
                style={styles.swapButton}
                onPress={() => {
                  if (destination) {
                    const temp = origin;
                    setOrigin(destination);
                    setDestination(temp);
                  }
                }}
              >
                <Ionicons name="swap-vertical" size={22} color="#C77DFF" />
              </Pressable>

              {/* Destination */}
              <Pressable 
                style={styles.inputContainer}
                onPress={() => {
                  setAirportSearch('');
                  setShowDestModal(true);
                }}
              >
                <Ionicons name="location-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>DESTINATION</Text>
                  <Text style={styles.inputValue}>
                    {destination ? `${getAirportName(destination)} (${destination})` : 'Choisir...'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
              </Pressable>

              {/* Date */}
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>DATE DE DÉPART</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={departureDate}
                    onChangeText={setDepartureDate}
                    placeholder="AAAA-MM-JJ"
                    placeholderTextColor="#9D4EDD"
                  />
                </View>
              </View>

              {/* Search Button */}
              <Pressable
                style={({ pressed }) => [styles.searchButton, pressed && styles.buttonPressed]}
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
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="search" size={20} color="#FFF" />
                      <Text style={styles.searchButtonText}>Rechercher</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </View>

          {/* Popular Destinations */}
          {!searched && (
            <View style={styles.popularSection}>
              <Text style={styles.sectionTitle}>Destinations populaires</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {popularDestinations.map((dest, index) => (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [styles.popularCard, pressed && styles.cardPressed]}
                    onPress={() => {
                      setOrigin(dest.origin);
                      setDestination(dest.destination);
                    }}
                  >
                    <LinearGradient colors={['#240046', '#3C096C']} style={styles.popularGradient}>
                      <Text style={styles.popularCity}>{dest.city}</Text>
                      <Text style={styles.popularCountry}>{dest.country}</Text>
                      <Text style={styles.popularPrice}>dès {dest.price_from}€</Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Results */}
          {searched && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>{flights.length} vols trouvés</Text>
                <Pressable onPress={() => setSearched(false)}>
                  <Text style={styles.newSearchText}>Nouvelle recherche</Text>
                </Pressable>
              </View>

              {flights.map((flight) => (
                <Pressable
                  key={flight.flight_id}
                  style={({ pressed }) => [styles.flightCard, pressed && styles.cardPressed]}
                  onPress={() => handleSelectFlight(flight)}
                >
                  <LinearGradient colors={['#240046', '#3C096C']} style={styles.flightGradient}>
                    {/* Airline & Price */}
                    <View style={styles.flightHeader}>
                      <View style={styles.airlineInfo}>
                        <View style={styles.airlineLogo}>
                          <Ionicons name="airplane" size={16} color="#C77DFF" />
                        </View>
                        <View>
                          <Text style={styles.airline}>{flight.airline}</Text>
                          <Text style={styles.flightNumber}>{flight.flight_number}</Text>
                        </View>
                      </View>
                      <View style={styles.priceContainer}>
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
                        <View style={styles.dot} />
                        <View style={styles.line} />
                        {flight.stops > 0 && (
                          <View style={styles.stopBadge}>
                            <Text style={styles.stopText}>{flight.stops} escale</Text>
                          </View>
                        )}
                        <View style={styles.line} />
                        <Ionicons name="airplane" size={12} color="#C77DFF" />
                      </View>
                      <View style={styles.routePoint}>
                        <Text style={styles.routeTime}>{flight.arrival_time}</Text>
                        <Text style={styles.routeCode}>{flight.destination}</Text>
                      </View>
                    </View>

                    {/* Duration & Seats */}
                    <View style={styles.flightFooter}>
                      <Text style={styles.duration}>{flight.duration}</Text>
                      <Text style={styles.seats}>{flight.available_seats} places</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          )}

          {searched && flights.length === 0 && (
            <View style={styles.noResults}>
              <Ionicons name="airplane-outline" size={48} color="#9D4EDD" />
              <Text style={styles.noResultsText}>Aucun vol trouvé</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>

      {/* Origin Modal */}
      <Modal visible={showOriginModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ville de départ</Text>
              <Pressable onPress={() => setShowOriginModal(false)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>
            
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9D4EDD" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Rechercher ou taper code (ex: BKK)"
                placeholderTextColor="#9D4EDD"
                value={airportSearch}
                onChangeText={setAirportSearch}
                autoFocus
                autoCapitalize="characters"
              />
            </View>

            {/* Option code personnalisé */}
            {airportSearch.length >= 3 && !filteredAirports.find(a => a.code.toLowerCase() === airportSearch.toLowerCase().substring(0,3)) && (
              <Pressable
                style={({ pressed }) => [styles.customAirportItem, pressed && styles.itemPressed]}
                onPress={() => {
                  setOrigin(airportSearch.toUpperCase().substring(0,3));
                  setShowOriginModal(false);
                  setAirportSearch('');
                }}
              >
                <View style={[styles.airportCodeBox, {backgroundColor: 'rgba(16,185,129,0.2)'}]}>
                  <Text style={[styles.airportCodeText, {color: '#10B981'}]}>{airportSearch.toUpperCase().substring(0,3)}</Text>
                </View>
                <View style={styles.airportDetails}>
                  <Text style={styles.airportCity}>Utiliser "{airportSearch.toUpperCase().substring(0,3)}"</Text>
                  <Text style={styles.airportCountry}>Code IATA personnalisé</Text>
                </View>
                <Ionicons name="add-circle" size={24} color="#10B981" />
              </Pressable>
            )}

            <FlatList
              data={filteredAirports}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.airportItem, pressed && styles.itemPressed]}
                  onPress={() => {
                    setOrigin(item.code);
                    setShowOriginModal(false);
                  }}
                >
                  <View style={styles.airportCodeBox}>
                    <Text style={styles.airportCodeText}>{item.code}</Text>
                  </View>
                  <View style={styles.airportDetails}>
                    <Text style={styles.airportCity}>{item.city}</Text>
                    <Text style={styles.airportCountry}>{item.country}</Text>
                  </View>
                  {origin === item.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#C77DFF" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Destination Modal */}
      <Modal visible={showDestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ville d'arrivée</Text>
              <Pressable onPress={() => setShowDestModal(false)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>
            
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9D4EDD" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Rechercher ou taper code (ex: BKK)"
                placeholderTextColor="#9D4EDD"
                value={airportSearch}
                onChangeText={setAirportSearch}
                autoFocus
                autoCapitalize="characters"
              />
            </View>

            {/* Option code personnalisé */}
            {airportSearch.length >= 3 && !filteredAirports.find(a => a.code.toLowerCase() === airportSearch.toLowerCase().substring(0,3)) && (
              <Pressable
                style={({ pressed }) => [styles.customAirportItem, pressed && styles.itemPressed]}
                onPress={() => {
                  setDestination(airportSearch.toUpperCase().substring(0,3));
                  setShowDestModal(false);
                  setAirportSearch('');
                }}
              >
                <View style={[styles.airportCodeBox, {backgroundColor: 'rgba(16,185,129,0.2)'}]}>
                  <Text style={[styles.airportCodeText, {color: '#10B981'}]}>{airportSearch.toUpperCase().substring(0,3)}</Text>
                </View>
                <View style={styles.airportDetails}>
                  <Text style={styles.airportCity}>Utiliser "{airportSearch.toUpperCase().substring(0,3)}"</Text>
                  <Text style={styles.airportCountry}>Code IATA personnalisé</Text>
                </View>
                <Ionicons name="add-circle" size={24} color="#10B981" />
              </Pressable>
            )}

            <FlatList
              data={filteredAirports}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.airportItem, pressed && styles.itemPressed]}
                  onPress={() => {
                    setDestination(item.code);
                    setShowDestModal(false);
                  }}
                >
                  <View style={styles.airportCodeBox}>
                    <Text style={styles.airportCodeText}>{item.code}</Text>
                  </View>
                  <View style={styles.airportDetails}>
                    <Text style={styles.airportCity}>{item.city}</Text>
                    <Text style={styles.airportCountry}>{item.country}</Text>
                  </View>
                  {destination === item.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#C77DFF" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Flight Details Modal */}
      <Modal visible={selectedFlight !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.flightModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails du vol</Text>
              <Pressable onPress={() => setSelectedFlight(null)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>

            {selectedFlight && (
              <View style={styles.flightDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Compagnie</Text>
                  <Text style={styles.detailValue}>{selectedFlight.airline}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Numéro de vol</Text>
                  <Text style={styles.detailValue}>{selectedFlight.flight_number}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Trajet</Text>
                  <Text style={styles.detailValue}>{selectedFlight.origin} → {selectedFlight.destination}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Horaires</Text>
                  <Text style={styles.detailValue}>{selectedFlight.departure_time} - {selectedFlight.arrival_time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Durée</Text>
                  <Text style={styles.detailValue}>{selectedFlight.duration}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Escales</Text>
                  <Text style={styles.detailValue}>{selectedFlight.stops === 0 ? 'Direct' : `${selectedFlight.stops} escale(s)`}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Places disponibles</Text>
                  <Text style={styles.detailValue}>{selectedFlight.available_seats}</Text>
                </View>
                
                <View style={styles.priceSection}>
                  <Text style={styles.totalLabel}>Prix total</Text>
                  <Text style={styles.totalPrice}>{selectedFlight.price} {selectedFlight.currency}</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.bookButton, pressed && styles.buttonPressed]}
                  onPress={handleBookFlight}
                >
                  <LinearGradient
                    colors={['#7B2CBF', '#C77DFF']}
                    style={styles.bookButtonGradient}
                  >
                    <Text style={styles.bookButtonText}>Réserver ce vol</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginLeft: 10 },
  subtitle: { fontSize: 14, color: '#9D4EDD', marginBottom: 20, marginLeft: 38 },
  
  searchCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 24 },
  cardGradient: { padding: 20 },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#7B2CBF',
  },
  inputContent: { flex: 1, marginLeft: 12 },
  inputLabel: { fontSize: 10, color: '#9D4EDD', marginBottom: 2 },
  inputValue: { fontSize: 15, color: '#FFF', fontWeight: '600' },
  dateInput: { fontSize: 15, color: '#FFF', fontWeight: '600', padding: 0 },
  
  swapButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(199,125,255,0.3)',
    padding: 10,
    borderRadius: 25,
    marginVertical: 4,
  },
  
  searchButton: { marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  searchButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  searchButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  buttonPressed: { opacity: 0.8 },
  
  popularSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#E0AAFF', marginBottom: 12 },
  popularCard: { marginRight: 10, borderRadius: 12, overflow: 'hidden', width: 120 },
  popularGradient: { padding: 12, height: 85, justifyContent: 'space-between' },
  popularCity: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  popularCountry: { fontSize: 11, color: '#9D4EDD' },
  popularPrice: { fontSize: 13, fontWeight: '700', color: '#C77DFF' },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  
  resultsContainer: { marginBottom: 20 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultsTitle: { fontSize: 18, fontWeight: 'bold', color: '#C77DFF' },
  newSearchText: { color: '#9D4EDD', fontSize: 14, textDecorationLine: 'underline' },
  
  flightCard: { marginBottom: 12, borderRadius: 14, overflow: 'hidden' },
  flightGradient: { padding: 14 },
  flightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  airlineInfo: { flexDirection: 'row', alignItems: 'center' },
  airlineLogo: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(199,125,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  airline: { fontSize: 13, fontWeight: 'bold', color: '#FFF' },
  flightNumber: { fontSize: 11, color: '#9D4EDD' },
  priceContainer: { alignItems: 'flex-end' },
  price: { fontSize: 24, fontWeight: 'bold', color: '#C77DFF' },
  currency: { fontSize: 11, color: '#9D4EDD' },
  
  routeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  routePoint: { alignItems: 'center', width: 50 },
  routeTime: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  routeCode: { fontSize: 12, color: '#E0AAFF', fontWeight: '600' },
  routeLine: { flexDirection: 'row', alignItems: 'center', flex: 1, marginHorizontal: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C77DFF' },
  line: { flex: 1, height: 2, backgroundColor: '#7B2CBF' },
  stopBadge: { backgroundColor: '#FF6B35', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginHorizontal: 4 },
  stopText: { fontSize: 9, color: '#FFF', fontWeight: '600' },
  
  flightFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#5A189A' },
  duration: { color: '#E0AAFF', fontSize: 12 },
  seats: { color: '#9D4EDD', fontSize: 12 },
  
  noResults: { alignItems: 'center', paddingVertical: 40 },
  noResultsText: { fontSize: 16, color: '#9D4EDD', marginTop: 12 },
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E0B3C', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', minHeight: '50%' },
  flightModalContent: { backgroundColor: '#1E0B3C', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#5A189A' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', margin: 16, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#7B2CBF' },
  modalSearchInput: { flex: 1, color: '#FFF', fontSize: 16, paddingVertical: 14, marginLeft: 10 },
  
  airportItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#3C096C' },
  itemPressed: { backgroundColor: 'rgba(199,125,255,0.1)' },
  airportCodeBox: { width: 50, height: 50, borderRadius: 10, backgroundColor: 'rgba(199,125,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  airportCodeText: { fontSize: 14, fontWeight: 'bold', color: '#C77DFF' },
  airportDetails: { flex: 1, marginLeft: 14 },
  airportCity: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  airportCountry: { fontSize: 13, color: '#9D4EDD' },
  customAirportItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 2, borderBottomColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.05)' },
  
  flightDetails: { padding: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#3C096C' },
  detailLabel: { fontSize: 14, color: '#9D4EDD' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  
  priceSection: { alignItems: 'center', paddingVertical: 20, marginTop: 10 },
  totalLabel: { fontSize: 14, color: '#9D4EDD', marginBottom: 4 },
  totalPrice: { fontSize: 36, fontWeight: 'bold', color: '#C77DFF' },
  
  bookButton: { borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  bookButtonGradient: { padding: 16, alignItems: 'center' },
  bookButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
