
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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Linking from 'expo-linking';
import i18n from '../../src/i18n';

const t = (key: string) => i18n.t(key);

// Partenaires de location
const PARTNERS = [
  { id: 'rentalcars', name: 'Rentalcars', icon: 'car', color: '#FF8C00' },
  { id: 'kayak', name: 'Kayak', icon: 'search', color: '#FF5A00' },
  { id: 'discovercars', name: 'Discover Cars', icon: 'car-sport', color: '#00A651' },
];

// Destinations populaires
const POPULAR_DESTINATIONS = [
  { name: "Paris", country: "France", emoji: "🇫🇷", price: 25 },
  { name: "Barcelona", country: "Espagne", emoji: "🇪🇸", price: 18 },
  { name: "Rome", country: "Italie", emoji: "🇮🇹", price: 22 },
  { name: "Lisbon", country: "Portugal", emoji: "🇵🇹", price: 15 },
  { name: "Miami", country: "USA", emoji: "🇺🇸", price: 35 },
  { name: "Dubai", country: "Émirats", emoji: "🇦🇪", price: 40 },
];

const CITIES = [
  { name: "Paris", country: "France", code: "PAR" },
  { name: "Lyon", country: "France", code: "LYS" },
  { name: "Nice", country: "France", code: "NCE" },
  { name: "Marseille", country: "France", code: "MRS" },
  { name: "Bordeaux", country: "France", code: "BOD" },
  { name: "Londres", country: "Royaume-Uni", code: "LON" },
  { name: "Amsterdam", country: "Pays-Bas", code: "AMS" },
  { name: "Barcelone", country: "Espagne", code: "BCN" },
  { name: "Madrid", country: "Espagne", code: "MAD" },
  { name: "Rome", country: "Italie", code: "ROM" },
  { name: "Milan", country: "Italie", code: "MIL" },
  { name: "Lisbonne", country: "Portugal", code: "LIS" },
  { name: "Berlin", country: "Allemagne", code: "BER" },
  { name: "Munich", country: "Allemagne", code: "MUC" },
  { name: "Athènes", country: "Grèce", code: "ATH" },
  { name: "Prague", country: "Tchéquie", code: "PRG" },
  { name: "Budapest", country: "Hongrie", code: "BUD" },
  { name: "Dubrovnik", country: "Croatie", code: "DBV" },
  { name: "Istanbul", country: "Turquie", code: "IST" },
  { name: "Marrakech", country: "Maroc", code: "RAK" },
  { name: "Dubaï", country: "Émirats", code: "DXB" },
  { name: "Bangkok", country: "Thaïlande", code: "BKK" },
  { name: "Bali", country: "Indonésie", code: "DPS" },
  { name: "Tokyo", country: "Japon", code: "TYO" },
  { name: "New York", country: "États-Unis", code: "NYC" },
  { name: "Los Angeles", country: "États-Unis", code: "LAX" },
  { name: "Miami", country: "États-Unis", code: "MIA" },
  { name: "Cancún", country: "Mexique", code: "CUN" },
  { name: "Sydney", country: "Australie", code: "SYD" },
  { name: "Le Cap", country: "Afrique du Sud", code: "CPT" },
];

export default function CarsScreen() {
  const [city, setCity] = useState('Paris');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(PARTNERS[0]);

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const getPartnerUrl = (cityName: string) => {
    switch (selectedPartner.id) {
      case 'rentalcars':
        return 'https://www.rentalcars.com/fr/';
      
      case 'kayak':
        return 'https://www.kayak.fr/cars';
      
      case 'discovercars':
        return 'https://www.discovercars.com/fr';
      
      default:
        return 'https://www.rentalcars.com/fr/';
    }
  };

  const searchCars = async () => {
    if (!pickupDate || !returnDate) {
      Alert.alert(t('errorTitle') || 'Erreur', t('selectDates') || 'Veuillez sélectionner les dates');
      return;
    }
    
    const url = getPartnerUrl(city);
    
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(t('errorTitle') || 'Erreur', t('linkError') || 'Impossible d\'ouvrir le lien');
    }
  };

  const selectPopularDestination = (dest: typeof POPULAR_DESTINATIONS[0]) => {
    setCity(dest.name);
    if (!pickupDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPickupDate(tomorrow.toISOString().split('T')[0]);
    }
    if (!returnDate) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 4);
      setReturnDate(nextWeek.toISOString().split('T')[0]);
    }
  };

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Ionicons name="car-sport" size={28} color="#C77DFF" />
            <Text style={styles.headerTitle}>{t('carRental') || 'Location Voiture'}</Text>
          </View>
          <Text style={styles.subtitle}>{t('rentBestPrice') || 'Louez au meilleur prix'}</Text>

          {/* Popular Destinations */}
          <View style={styles.popularSection}>
            <Text style={styles.sectionTitle}>{t('popularDestinations') || 'Destinations populaires'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {POPULAR_DESTINATIONS.map((dest, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [styles.popularCard, pressed && styles.cardPressed]}
                  onPress={() => selectPopularDestination(dest)}
                >
                  <LinearGradient colors={['#240046', '#3C096C']} style={styles.popularGradient}>
                    <Text style={styles.popularEmoji}>{dest.emoji}</Text>
                    <Text style={styles.popularCity}>{dest.name}</Text>
                    <Text style={styles.popularCountry}>{dest.country}</Text>
                    <Text style={styles.popularPrice}>{t('from') || 'dès'} {dest.price}€/j</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.searchCard}>
            <LinearGradient colors={['#5A189A', '#3C096C']} style={styles.cardGradient}>
              
              {/* City Selection */}
              <Pressable style={styles.inputContainer} onPress={() => setShowCityModal(true)}>
                <Ionicons name="location-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>{t('pickupLocation') || 'LIEU DE PRISE EN CHARGE'}</Text>
                  <Text style={styles.inputValue}>{city}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
              </Pressable>

              {/* Partner Selection */}
              <Pressable style={styles.inputContainer} onPress={() => setShowPartnerModal(true)}>
                <Ionicons name={selectedPartner.icon as any} size={20} color={selectedPartner.color} />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>{t('bookWith') || 'RÉSERVER VIA'}</Text>
                  <Text style={styles.inputValue}>{selectedPartner.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
              </Pressable>

              {/* Pickup Date */}
              <Pressable style={styles.inputContainer} onPress={() => setShowPickupPicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>{t('pickupDate') || 'DATE DE PRISE EN CHARGE'}</Text>
                  <Text style={styles.inputValue}>{pickupDate || t('chooseDate') || 'Choisir une date'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
              </Pressable>

              {/* Return Date */}
              <Pressable style={styles.inputContainer} onPress={() => setShowReturnPicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>{t('returnDate') || 'DATE DE RETOUR'}</Text>
                  <Text style={styles.inputValue}>{returnDate || t('chooseDate') || 'Choisir une date'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
              </Pressable>

              {/* Search Button */}
              <Pressable style={styles.searchButton} onPress={searchCars}>
                <LinearGradient colors={['#7B2CBF', '#C77DFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.searchButtonGradient}>
                  <Ionicons name="search" size={20} color="#FFF" />
                  <Text style={styles.searchButtonText}>{t('search') || 'Rechercher'}</Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </View>

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#9D4EDD" />
            <Text style={styles.infoText}>{t('redirectPartner') || 'Vous serez redirigé vers notre partenaire'}</Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{t('freeCancellation') || 'Annulation gratuite'}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{t('noHiddenFees') || 'Pas de frais cachés'}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{t('support247') || 'Assistance 24/7'}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* City Selection Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('pickupLocation') || 'Lieu de prise en charge'}</Text>
              <Pressable onPress={() => setShowCityModal(false)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9D4EDD" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder={t('searchCity') || 'Rechercher une ville...'}
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
                  onPress={() => { setCity(item.name); setShowCityModal(false); setCitySearch(''); }}
                >
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

      {/* Partner Selection Modal */}
      <Modal visible={showPartnerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { minHeight: '25%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('choosePartner') || 'Choisir un partenaire'}</Text>
              <Pressable onPress={() => setShowPartnerModal(false)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>
            {PARTNERS.map((partner) => (
              <Pressable
                key={partner.id}
                style={({ pressed }) => [styles.partnerItem, pressed && styles.itemPressed]}
                onPress={() => { setSelectedPartner(partner); setShowPartnerModal(false); }}
              >
                <View style={[styles.partnerIcon, { backgroundColor: partner.color + '30' }]}>
                  <Ionicons name={partner.icon as any} size={24} color={partner.color} />
                </View>
                <Text style={styles.partnerName}>{partner.name}</Text>
                {selectedPartner.id === partner.id && <Ionicons name="checkmark-circle" size={24} color="#C77DFF" />}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showPickupPicker && (
        <DateTimePicker
          value={pickupDate ? new Date(pickupDate) : new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => { setShowPickupPicker(false); if (selectedDate) setPickupDate(selectedDate.toISOString().split('T')[0]); }}
        />
      )}
      {showReturnPicker && (
        <DateTimePicker
          value={returnDate ? new Date(returnDate) : new Date()}
          mode="date"
          display="default"
          minimumDate={pickupDate ? new Date(pickupDate) : new Date()}
          onChange={(event, selectedDate) => { setShowReturnPicker(false); if (selectedDate) setReturnDate(selectedDate.toISOString().split('T')[0]); }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginLeft: 10 },
  subtitle: { fontSize: 14, color: '#9D4EDD', marginBottom: 16, marginLeft: 54, paddingHorizontal: 16 },

  popularSection: { marginBottom: 20, paddingLeft: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFD700', marginBottom: 12 },
  popularCard: { marginRight: 12, borderRadius: 12, overflow: 'hidden', width: 130 },
  popularGradient: { padding: 12, height: 120, justifyContent: 'space-between' },
  popularEmoji: { fontSize: 24 },
  popularCity: { fontSize: 14, fontWeight: 'bold', color: '#FFD700' },
  popularCountry: { fontSize: 11, color: '#9D4EDD' },
  popularPrice: { fontSize: 13, fontWeight: '700', color: '#C77DFF' },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },

  searchCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 16, marginHorizontal: 16 },
  cardGradient: { padding: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#7B2CBF' },
  inputContent: { flex: 1, marginLeft: 12 },
  inputLabel: { fontSize: 10, color: '#9D4EDD', marginBottom: 2 },
  inputValue: { fontSize: 15, color: '#FFD700', fontWeight: '600' },
  searchButton: { marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  searchButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  searchButtonText: { color: '#FFD700', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  infoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(157,78,221,0.1)', padding: 12, borderRadius: 12, marginHorizontal: 16, marginBottom: 16 },
  infoText: { flex: 1, marginLeft: 10, color: '#9D4EDD', fontSize: 12 },
  featuresContainer: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 20 },
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

  partnerItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#3C096C' },
  partnerIcon: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  partnerName: { flex: 1, fontSize: 18, fontWeight: '600', color: '#FFD700', marginLeft: 16 },
});

