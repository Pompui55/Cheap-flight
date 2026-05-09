
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Linking from 'expo-linking';

// Liste des villes mondiales
const CITIES = [
  // FRANCE
  { name: "Paris", country: "France" },
  { name: "Lyon", country: "France" },
  { name: "Nice", country: "France" },
  { name: "Marseille", country: "France" },
  { name: "Bordeaux", country: "France" },
  { name: "Toulouse", country: "France" },
  { name: "Nantes", country: "France" },
  { name: "Strasbourg", country: "France" },
  { name: "Montpellier", country: "France" },
  { name: "Lille", country: "France" },
  // EUROPE
  { name: "Londres", country: "Royaume-Uni" },
  { name: "Manchester", country: "Royaume-Uni" },
  { name: "Édimbourg", country: "Royaume-Uni" },
  { name: "Amsterdam", country: "Pays-Bas" },
  { name: "Bruxelles", country: "Belgique" },
  { name: "Berlin", country: "Allemagne" },
  { name: "Munich", country: "Allemagne" },
  { name: "Francfort", country: "Allemagne" },
  { name: "Zurich", country: "Suisse" },
  { name: "Genève", country: "Suisse" },
  { name: "Vienne", country: "Autriche" },
  { name: "Barcelone", country: "Espagne" },
  { name: "Madrid", country: "Espagne" },
  { name: "Séville", country: "Espagne" },
  { name: "Valence", country: "Espagne" },
  { name: "Malaga", country: "Espagne" },
  { name: "Ibiza", country: "Espagne" },
  { name: "Palma de Majorque", country: "Espagne" },
  { name: "Rome", country: "Italie" },
  { name: "Milan", country: "Italie" },
  { name: "Venise", country: "Italie" },
  { name: "Florence", country: "Italie" },
  { name: "Naples", country: "Italie" },
  { name: "Lisbonne", country: "Portugal" },
  { name: "Porto", country: "Portugal" },
  { name: "Athènes", country: "Grèce" },
  { name: "Santorin", country: "Grèce" },
  { name: "Mykonos", country: "Grèce" },
  { name: "Dublin", country: "Irlande" },
  { name: "Copenhague", country: "Danemark" },
  { name: "Stockholm", country: "Suède" },
  { name: "Oslo", country: "Norvège" },
  { name: "Helsinki", country: "Finlande" },
  { name: "Prague", country: "Tchéquie" },
  { name: "Budapest", country: "Hongrie" },
  { name: "Varsovie", country: "Pologne" },
  { name: "Cracovie", country: "Pologne" },
  { name: "Dubrovnik", country: "Croatie" },
  { name: "Split", country: "Croatie" },
  // TURQUIE
  { name: "Istanbul", country: "Turquie" },
  { name: "Antalya", country: "Turquie" },
  { name: "Bodrum", country: "Turquie" },
  // AFRIQUE DU NORD
  { name: "Marrakech", country: "Maroc" },
  { name: "Casablanca", country: "Maroc" },
  { name: "Agadir", country: "Maroc" },
  { name: "Fès", country: "Maroc" },
  { name: "Tanger", country: "Maroc" },
  { name: "Tunis", country: "Tunisie" },
  { name: "Djerba", country: "Tunisie" },
  { name: "Le Caire", country: "Égypte" },
  { name: "Hurghada", country: "Égypte" },
  { name: "Sharm el-Sheikh", country: "Égypte" },
  // MOYEN-ORIENT
  { name: "Dubaï", country: "Émirats" },
  { name: "Abu Dhabi", country: "Émirats" },
  { name: "Doha", country: "Qatar" },
  { name: "Tel Aviv", country: "Israël" },
  { name: "Amman", country: "Jordanie" },
  // ASIE
  { name: "Bangkok", country: "Thaïlande" },
  { name: "Phuket", country: "Thaïlande" },
  { name: "Pattaya", country: "Thaïlande" },
  { name: "Chiang Mai", country: "Thaïlande" },
  { name: "Bali", country: "Indonésie" },
  { name: "Jakarta", country: "Indonésie" },
  { name: "Singapour", country: "Singapour" },
  { name: "Kuala Lumpur", country: "Malaisie" },
  { name: "Hong Kong", country: "Hong Kong" },
  { name: "Tokyo", country: "Japon" },
  { name: "Osaka", country: "Japon" },
  { name: "Kyoto", country: "Japon" },
  { name: "Séoul", country: "Corée du Sud" },
  { name: "Pékin", country: "Chine" },
  { name: "Shanghai", country: "Chine" },
  { name: "Ho Chi Minh", country: "Vietnam" },
  { name: "Hanoi", country: "Vietnam" },
  { name: "Mumbai", country: "Inde" },
  { name: "New Delhi", country: "Inde" },
  { name: "Goa", country: "Inde" },
  { name: "Manille", country: "Philippines" },
  { name: "Cebu", country: "Philippines" },
  // AMÉRIQUE DU NORD
  { name: "New York", country: "États-Unis" },
  { name: "Los Angeles", country: "États-Unis" },
  { name: "Miami", country: "États-Unis" },
  { name: "Las Vegas", country: "États-Unis" },
  { name: "San Francisco", country: "États-Unis" },
  { name: "Chicago", country: "États-Unis" },
  { name: "Boston", country: "États-Unis" },
  { name: "Washington", country: "États-Unis" },
  { name: "Orlando", country: "États-Unis" },
  { name: "Honolulu", country: "États-Unis" },
  { name: "Montréal", country: "Canada" },
  { name: "Toronto", country: "Canada" },
  { name: "Vancouver", country: "Canada" },
  { name: "Cancún", country: "Mexique" },
  { name: "Mexico", country: "Mexique" },
  // AMÉRIQUE DU SUD
  { name: "Rio de Janeiro", country: "Brésil" },
  { name: "São Paulo", country: "Brésil" },
  { name: "Buenos Aires", country: "Argentine" },
  { name: "Lima", country: "Pérou" },
  { name: "Bogota", country: "Colombie" },
  { name: "Carthagène", country: "Colombie" },
  // CARAÏBES
  { name: "La Havane", country: "Cuba" },
  { name: "Punta Cana", country: "Rép. Dominicaine" },
  { name: "Fort-de-France", country: "Martinique" },
  { name: "Pointe-à-Pitre", country: "Guadeloupe" },
  // AFRIQUE
  { name: "Le Cap", country: "Afrique du Sud" },
  { name: "Johannesburg", country: "Afrique du Sud" },
  { name: "Nairobi", country: "Kenya" },
  { name: "Zanzibar", country: "Tanzanie" },
  { name: "Maurice", country: "Île Maurice" },
  { name: "Saint-Denis", country: "La Réunion" },
  // OCÉANIE
  { name: "Sydney", country: "Australie" },
  { name: "Melbourne", country: "Australie" },
  { name: "Auckland", country: "Nouvelle-Zélande" },
  { name: "Papeete", country: "Tahiti" },
  // AFRIQUE SUBSAHARIENNE
  { name: "Antananarivo", country: "Madagascar" },
  { name: "Dakar", country: "Sénégal" },
  { name: "Abidjan", country: "Côte d'Ivoire" },
  { name: "Accra", country: "Ghana" },
  { name: "Lagos", country: "Nigeria" },
  { name: "Douala", country: "Cameroun" },
  { name: "Libreville", country: "Gabon" },
  { name: "Kinshasa", country: "RD Congo" },
  { name: "Addis-Abeba", country: "Éthiopie" },
  { name: "Mombasa", country: "Kenya" },
  { name: "Dar es Salaam", country: "Tanzanie" },
  { name: "Kigali", country: "Rwanda" },
  { name: "Kampala", country: "Ouganda" },
  { name: "Windhoek", country: "Namibie" },
  { name: "Victoria Falls", country: "Zimbabwe" },
  { name: "Maputo", country: "Mozambique" },
  { name: "Lusaka", country: "Zambie" },
  { name: "Seychelles", country: "Seychelles" },
  // ASIE COMPLÉMENTAIRE
  { name: "Maldives", country: "Maldives" },
  { name: "Sri Lanka", country: "Sri Lanka" },
  { name: "Katmandou", country: "Népal" },
  { name: "Phnom Penh", country: "Cambodge" },
  { name: "Siem Reap", country: "Cambodge" },
  { name: "Vientiane", country: "Laos" },
  { name: "Yangon", country: "Myanmar" },
  { name: "Taipei", country: "Taïwan" },
  { name: "Macao", country: "Macao" },
  // MOYEN-ORIENT COMPLÉMENTAIRE
  { name: "Mascate", country: "Oman" },
  { name: "Koweït", country: "Koweït" },
  { name: "Bahreïn", country: "Bahreïn" },
  { name: "Riyad", country: "Arabie Saoudite" },
  { name: "Djeddah", country: "Arabie Saoudite" },
  { name: "Beyrouth", country: "Liban" },
  // EUROPE COMPLÉMENTAIRE
  { name: "Reykjavik", country: "Islande" },
  { name: "Malte", country: "Malte" },
  { name: "Chypre", country: "Chypre" },
  { name: "Monaco", country: "Monaco" },
  { name: "Luxembourg", country: "Luxembourg" },
  { name: "Bratislava", country: "Slovaquie" },
  { name: "Ljubljana", country: "Slovénie" },
  { name: "Sarajevo", country: "Bosnie" },
  { name: "Tirana", country: "Albanie" },
  { name: "Monténégro", country: "Monténégro" },
  // AMÉRIQUES COMPLÉMENTAIRE
  { name: "Santiago", country: "Chili" },
  { name: "Montevideo", country: "Uruguay" },
  { name: "Quito", country: "Équateur" },
  { name: "Panama", country: "Panama" },
  { name: "San José", country: "Costa Rica" },
  { name: "Nassau", country: "Bahamas" },
  { name: "Kingston", country: "Jamaïque" },
  // OCÉANIE COMPLÉMENTAIRE
  { name: "Fiji", country: "Fidji" },
  { name: "Bora Bora", country: "Polynésie" },
  { name: "Nouméa", country: "Nouvelle-Calédonie" },
];

export default function HotelsScreen() {
  const [city, setCity] = useState('Paris');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const searchHotels = () => {
    if (!checkIn || !checkOut) {
      Alert.alert('Erreur', 'Veuillez sélectionner les dates');
      return;
    }

    const url = `https://search.hotellook.com/?destination=${encodeURIComponent(city)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${guests}&marker=515b05`;
    Linking.openURL(url);
  };

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <Ionicons name="bed" size={28} color="#C77DFF" />
          <Text style={styles.headerTitle}>Hôtels</Text>
        </View>
        <Text style={styles.subtitle}>Trouvez les meilleurs hôtels</Text>

        <View style={styles.searchCard}>
          <LinearGradient colors={['#5A189A', '#3C096C']} style={styles.cardGradient}>
            
            {/* City - Clickable */}
            <Pressable style={styles.inputContainer} onPress={() => setShowCityModal(true)}>
              <Ionicons name="location-outline" size={20} color="#C77DFF" />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>VILLE</Text>
                <Text style={styles.inputValue}>{city}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
            </Pressable>

            {/* Check-in Date */}
            <Pressable style={styles.inputContainer} onPress={() => setShowCheckInPicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#C77DFF" />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>ARRIVÉE</Text>
                <Text style={styles.inputValue}>{checkIn || 'Choisir une date'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
            </Pressable>

            {/* Check-out Date */}
            <Pressable style={styles.inputContainer} onPress={() => setShowCheckOutPicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#C77DFF" />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>DÉPART</Text>
                <Text style={styles.inputValue}>{checkOut || 'Choisir une date'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
            </Pressable>

            {/* Guests */}
            <View style={styles.inputContainer}>
              <Ionicons name="people-outline" size={20} color="#C77DFF" />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>VOYAGEURS</Text>
                <Text style={styles.inputValue}>{guests} {guests > 1 ? 'personnes' : 'personne'}</Text>
              </View>
              <View style={styles.guestsControl}>
                <Pressable style={styles.guestBtn} onPress={() => setGuests(Math.max(1, guests - 1))}>
                  <Ionicons name="remove" size={18} color="#C77DFF" />
                </Pressable>
                <Pressable style={styles.guestBtn} onPress={() => setGuests(Math.min(10, guests + 1))}>
                  <Ionicons name="add" size={18} color="#C77DFF" />
                </Pressable>
              </View>
            </View>

            {/* Search Button */}
            <Pressable style={styles.searchButton} onPress={searchHotels}>
              <LinearGradient
                colors={['#7B2CBF', '#C77DFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.searchButtonGradient}
              >
                <Ionicons name="search" size={20} color="#FFF" />
                <Text style={styles.searchButtonText}>Rechercher</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#9D4EDD" />
          <Text style={styles.infoText}>
            Vous serez redirigé vers notre partenaire pour finaliser la réservation
          </Text>
        </View>

      </SafeAreaView>

      {/* City Selection Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une ville</Text>
              <Pressable onPress={() => setShowCityModal(false)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>
            
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9D4EDD" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Rechercher une ville..."
                placeholderTextColor="#9D4EDD"
                value={citySearch}
                onChangeText={setCitySearch}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.name + item.country}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.cityItem, pressed && styles.itemPressed]}
                  onPress={() => {
                    setCity(item.name);
                    setShowCityModal(false);
                    setCitySearch('');
                  }}
                >
                  <View style={styles.cityIcon}>
                    <Ionicons name="location" size={20} color="#C77DFF" />
                  </View>
                  <View style={styles.cityDetails}>
                    <Text style={styles.cityName}>{item.name}</Text>
                    <Text style={styles.cityCountry}>{item.country}</Text>
                  </View>
                  {city === item.name && (
                    <Ionicons name="checkmark-circle" size={24} color="#C77DFF" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showCheckInPicker && (
        <DateTimePicker
          value={checkIn ? new Date(checkIn) : new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowCheckInPicker(false);
            if (selectedDate) {
              setCheckIn(selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}

      {showCheckOutPicker && (
        <DateTimePicker
          value={checkOut ? new Date(checkOut) : new Date()}
          mode="date"
          display="default"
          minimumDate={checkIn ? new Date(checkIn) : new Date()}
          onChange={(event, selectedDate) => {
            setShowCheckOutPicker(false);
            if (selectedDate) {
              setCheckOut(selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: 16 },
  
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginLeft: 10 },
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
  inputValue: { fontSize: 15, color: '#FFD700', fontWeight: '600' },
  
  guestsControl: { flexDirection: 'row', alignItems: 'center' },
  guestBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(199,125,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  
  searchButton: { marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  searchButtonText: { color: '#FFD700', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157,78,221,0.1)',
    padding: 12,
    borderRadius: 12,
  },
  infoText: { flex: 1, marginLeft: 10, color: '#9D4EDD', fontSize: 12 },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E0B3C', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', minHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#5A189A' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFD700' },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', margin: 16, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#7B2CBF' },
  modalSearchInput: { flex: 1, color: '#FFD700', fontSize: 16, paddingVertical: 14, marginLeft: 10 },
  
  cityItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#3C096C' },
  itemPressed: { backgroundColor: 'rgba(199,125,255,0.1)' },
  cityIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(199,125,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  cityDetails: { flex: 1, marginLeft: 14 },
  cityName: { fontSize: 16, fontWeight: '600', color: '#FFD700' },
  cityCountry: { fontSize: 13, color: '#9D4EDD' },
});

