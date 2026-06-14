
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

const CITIES = [
  { name: "Paris", country: "France" },
  { name: "Lyon", country: "France" },
  { name: "Nice", country: "France" },
  { name: "Marseille", country: "France" },
  { name: "Bordeaux", country: "France" },
  { name: "Toulouse", country: "France" },
  { name: "Londres", country: "Royaume-Uni" },
  { name: "Amsterdam", country: "Pays-Bas" },
  { name: "Bruxelles", country: "Belgique" },
  { name: "Berlin", country: "Allemagne" },
  { name: "Munich", country: "Allemagne" },
  { name: "Barcelone", country: "Espagne" },
  { name: "Madrid", country: "Espagne" },
  { name: "Rome", country: "Italie" },
  { name: "Milan", country: "Italie" },
  { name: "Lisbonne", country: "Portugal" },
  { name: "Athènes", country: "Grèce" },
  { name: "Prague", country: "Tchéquie" },
  { name: "Budapest", country: "Hongrie" },
  { name: "Dubrovnik", country: "Croatie" },
  { name: "Istanbul", country: "Turquie" },
  { name: "Marrakech", country: "Maroc" },
  { name: "Dubaï", country: "Émirats" },
  { name: "Bangkok", country: "Thaïlande" },
  { name: "Bali", country: "Indonésie" },
  { name: "Singapour", country: "Singapour" },
  { name: "Tokyo", country: "Japon" },
  { name: "New York", country: "États-Unis" },
  { name: "Los Angeles", country: "États-Unis" },
  { name: "Miami", country: "États-Unis" },
  { name: "Cancún", country: "Mexique" },
  { name: "Rio de Janeiro", country: "Brésil" },
  { name: "Sydney", country: "Australie" },
  { name: "Le Cap", country: "Afrique du Sud" },
  { name: "Maurice", country: "Île Maurice" },
  // AFRIQUE SUBSAHARIENNE
  { name: "Antananarivo", country: "Madagascar" },
  { name: "Dakar", country: "Sénégal" },
  { name: "Abidjan", country: "Côte d'Ivoire" },
  { name: "Accra", country: "Ghana" },
  { name: "Lagos", country: "Nigeria" },
  { name: "Nairobi", country: "Kenya" },
  { name: "Mombasa", country: "Kenya" },
  { name: "Dar es Salaam", country: "Tanzanie" },
  { name: "Zanzibar", country: "Tanzanie" },
  { name: "Kigali", country: "Rwanda" },
  { name: "Addis-Abeba", country: "Éthiopie" },
  { name: "Johannesburg", country: "Afrique du Sud" },
  { name: "Windhoek", country: "Namibie" },
  { name: "Maputo", country: "Mozambique" },
  { name: "Seychelles", country: "Seychelles" },
  // ASIE COMPLÉMENTAIRE
  { name: "Maldives", country: "Maldives" },
  { name: "Colombo", country: "Sri Lanka" },
  { name: "Katmandou", country: "Népal" },
  { name: "Phnom Penh", country: "Cambodge" },
  { name: "Hanoï", country: "Vietnam" },
  { name: "Ho Chi Minh", country: "Vietnam" },
  { name: "Kuala Lumpur", country: "Malaisie" },
  { name: "Jakarta", country: "Indonésie" },
  { name: "Manille", country: "Philippines" },
  { name: "Taipei", country: "Taïwan" },
  { name: "Séoul", country: "Corée du Sud" },
  { name: "Pékin", country: "Chine" },
  { name: "Shanghai", country: "Chine" },
  { name: "Hong Kong", country: "Hong Kong" },
  // MOYEN-ORIENT
  { name: "Mascate", country: "Oman" },
  { name: "Doha", country: "Qatar" },
  { name: "Abu Dhabi", country: "Émirats" },
  { name: "Tel Aviv", country: "Israël" },
  { name: "Amman", country: "Jordanie" },
  // AMÉRIQUES
  { name: "Toronto", country: "Canada" },
  { name: "Montréal", country: "Canada" },
  { name: "Vancouver", country: "Canada" },
  { name: "Santiago", country: "Chili" },
  { name: "Buenos Aires", country: "Argentine" },
  { name: "Lima", country: "Pérou" },
  { name: "Bogota", country: "Colombie" },
  { name: "Panama", country: "Panama" },
  { name: "San José", country: "Costa Rica" },
  // OCÉANIE
  { name: "Melbourne", country: "Australie" },
  { name: "Auckland", country: "Nouvelle-Zélande" },
  { name: "Fiji", country: "Fidji" },
];

export default function CarsScreen() {
  const [city, setCity] = useState('Paris');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const searchCars = async () => {
    if (!pickupDate || !returnDate) {
      Alert.alert('Erreur', 'Veuillez sélectionner les dates');
      return;
    }
    
    // Kayak uses encoded city names with the pickup/dropoff times
    // Format: https://www.kayak.fr/cars/CityName/YYYY-MM-DD-10h00/YYYY-MM-DD-10h00
    const formatCityForKayak = (name: string) => {
      // Remove accents and encode for URL
      return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-');
    };
    
    const cityForUrl = formatCityForKayak(city);
    
    // Add default pickup time (10:00) and return time (10:00)
    const pickupWithTime = `${pickupDate}-10h00`;
    const returnWithTime = `${returnDate}-10h00`;
    
    // Kayak car rental URL with city, dates and times
    const url = `https://www.kayak.fr/cars/${cityForUrl}/${pickupWithTime}/${returnWithTime}?sort=price_a`;
    
    console.log('Opening Kayak URL:', url);
    
    // Open in browser
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir le navigateur. Veuillez réessayer.');
    }
  };

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <Ionicons name="car-sport" size={28} color="#C77DFF" />
          <Text style={styles.headerTitle}>Location Voiture</Text>
        </View>
        <Text style={styles.subtitle}>Louez au meilleur prix</Text>

        <View style={styles.searchCard}>
          <LinearGradient colors={['#5A189A', '#3C096C']} style={styles.cardGradient}>
            
            <Pressable style={styles.inputContainer} onPress={() => setShowCityModal(true)}>
              <Ionicons name="location-outline" size={20} color="#C77DFF" />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>LIEU DE PRISE EN CHARGE</Text>
                <Text style={styles.inputValue}>{city}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
            </Pressable>

            <Pressable style={styles.inputContainer} onPress={() => setShowPickupPicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#C77DFF" />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>DATE DE PRISE EN CHARGE</Text>
                <Text style={styles.inputValue}>{pickupDate || 'Choisir une date'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
            </Pressable>

            <Pressable style={styles.inputContainer} onPress={() => setShowReturnPicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#C77DFF" />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>DATE DE RETOUR</Text>
                <Text style={styles.inputValue}>{returnDate || 'Choisir une date'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
            </Pressable>

            <Pressable style={styles.searchButton} onPress={searchCars}>
              <LinearGradient colors={['#7B2CBF', '#C77DFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.searchButtonGradient}>
                <Ionicons name="search" size={20} color="#FFF" />
                <Text style={styles.searchButtonText}>Rechercher</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#9D4EDD" />
          <Text style={styles.infoText}>Vous serez redirigé vers notre partenaire pour finaliser la réservation</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Annulation gratuite</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Pas de frais cachés</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Assistance 24/7</Text>
          </View>
        </View>
      </SafeAreaView>

      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lieu de prise en charge</Text>
              <Pressable onPress={() => setShowCityModal(false)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9D4EDD" />
              <TextInput style={styles.modalSearchInput} placeholder="Rechercher une ville..." placeholderTextColor="#9D4EDD" value={citySearch} onChangeText={setCitySearch} autoFocus />
            </View>
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.name + item.country}
              renderItem={({ item }) => (
                <Pressable style={({ pressed }) => [styles.cityItem, pressed && styles.itemPressed]} onPress={() => { setCity(item.name); setShowCityModal(false); setCitySearch(''); }}>
                  <View style={styles.cityIcon}><Ionicons name="location" size={20} color="#C77DFF" /></View>
                  <View style={styles.cityDetails}>
                    <Text style={styles.cityName}>{item.name}</Text>
                    <Text style={styles.cityCountry}>{item.country}</Text>
                  </View>
                  {city === item.name && <Ionicons name="checkmark-circle" size={24} color="#C77DFF" />}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {showPickupPicker && (
        <DateTimePicker value={pickupDate ? new Date(pickupDate) : new Date()} mode="date" display="default" minimumDate={new Date()} onChange={(event, selectedDate) => { setShowPickupPicker(false); if (selectedDate) setPickupDate(selectedDate.toISOString().split('T')[0]); }} />
      )}
      {showReturnPicker && (
        <DateTimePicker value={returnDate ? new Date(returnDate) : new Date()} mode="date" display="default" minimumDate={pickupDate ? new Date(pickupDate) : new Date()} onChange={(event, selectedDate) => { setShowReturnPicker(false); if (selectedDate) setReturnDate(selectedDate.toISOString().split('T')[0]); }} />
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
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#7B2CBF' },
  inputContent: { flex: 1, marginLeft: 12 },
  inputLabel: { fontSize: 10, color: '#9D4EDD', marginBottom: 2 },
  inputValue: { fontSize: 15, color: '#FFD700', fontWeight: '600' },
  searchButton: { marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  searchButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  searchButtonText: { color: '#FFD700', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  infoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(157,78,221,0.1)', padding: 12, borderRadius: 12, marginBottom: 20 },
  infoText: { flex: 1, marginLeft: 10, color: '#9D4EDD', fontSize: 12 },
  featuresContainer: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureText: { color: '#FFD700', fontSize: 14, marginLeft: 10 },
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

