
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
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Linking from 'expo-linking';
import i18n from '../../src/i18n';

const t = (key: string) => i18n.t(key);

// Partenaires de réservation
const PARTNERS = [
  { id: 'hotellook', name: 'Hotellook', icon: 'bed', color: '#FF6B35' },
  { id: 'booking', name: 'Booking', icon: 'business', color: '#003580' },
  { id: 'hotels', name: 'Hotels.com', icon: 'home', color: '#D32F2F' },
  { id: 'expedia', name: 'Expedia', icon: 'globe', color: '#FFCC00' },
];

// Destinations populaires
const POPULAR_DESTINATIONS = [
  { name: "Paris", country: "France", emoji: "🇫🇷", price: 89 },
  { name: "Barcelone", country: "Espagne", emoji: "🇪🇸", price: 75 },
  { name: "Rome", country: "Italie", emoji: "🇮🇹", price: 85 },
  { name: "Londres", country: "UK", emoji: "🇬🇧", price: 120 },
  { name: "Amsterdam", country: "Pays-Bas", emoji: "🇳🇱", price: 95 },
  { name: "Marrakech", country: "Maroc", emoji: "🇲🇦", price: 55 },
];

// Liste des villes mondiales
const CITIES = [
  { name: "Paris", country: "France" },
  { name: "Lyon", country: "France" },
  { name: "Nice", country: "France" },
  { name: "Marseille", country: "France" },
  { name: "Bordeaux", country: "France" },
  { name: "Toulouse", country: "France" },
  { name: "Londres", country: "Royaume-Uni" },
  { name: "Manchester", country: "Royaume-Uni" },
  { name: "Amsterdam", country: "Pays-Bas" },
  { name: "Bruxelles", country: "Belgique" },
  { name: "Berlin", country: "Allemagne" },
  { name: "Munich", country: "Allemagne" },
  { name: "Barcelone", country: "Espagne" },
  { name: "Madrid", country: "Espagne" },
  { name: "Rome", country: "Italie" },
  { name: "Milan", country: "Italie" },
  { name: "Venise", country: "Italie" },
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
  { name: "Tokyo", country: "Japon" },
  { name: "New York", country: "États-Unis" },
  { name: "Miami", country: "États-Unis" },
  { name: "Los Angeles", country: "États-Unis" },
  { name: "Cancún", country: "Mexique" },
  { name: "Rio de Janeiro", country: "Brésil" },
  { name: "Sydney", country: "Australie" },
  { name: "Maldives", country: "Maldives" },
  { name: "Maurice", country: "Île Maurice" },
  { name: "Phuket", country: "Thaïlande" },
  { name: "Singapour", country: "Singapour" },
  { name: "Hong Kong", country: "Hong Kong" },
  { name: "Séoul", country: "Corée du Sud" },
];

export default function HotelsScreen() {
  const [city, setCity] = useState('Paris');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(PARTNERS[0]);
  const [flexibleDates, setFlexibleDates] = useState(false);

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const getPartnerUrl = (cityName: string) => {
    const checkInDate = checkIn.replace(/-/g, '-');
    const checkOutDate = checkOut.replace(/-/g, '-');
    
    switch (selectedPartner.id) {
      case 'hotellook':
        return `https://search.hotellook.com/?destination=${encodeURIComponent(cityName)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${guests}&marker=515b05`;
      case 'booking':
        return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cityName)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${guests}&no_rooms=1`;
      case 'hotels':
        return `https://www.hotels.com/search.do?destination=${encodeURIComponent(cityName)}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=1&adults=${guests}`;
      case 'expedia':
        return `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(cityName)}&startDate=${checkIn}&endDate=${checkOut}&rooms=1&adults=${guests}`;
      default:
        return `https://search.hotellook.com/?destination=${encodeURIComponent(cityName)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${guests}&marker=515b05`;
    }
  };

  const searchHotels = () => {
    if (!checkIn || !checkOut) {
      Alert.alert(t('errorTitle') || 'Erreur', t('selectDates') || 'Veuillez sélectionner les dates');
      return;
    }
    const url = getPartnerUrl(city);
    Linking.openURL(url);
  };

  const selectPopularDestination = (dest: typeof POPULAR_DESTINATIONS[0]) => {
    setCity(dest.name);
    // Set default dates if not selected
    if (!checkIn) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCheckIn(tomorrow.toISOString().split('T')[0]);
    }
    if (!checkOut) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 3);
      setCheckOut(nextWeek.toISOString().split('T')[0]);
    }
  };

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Ionicons name="bed" size={28} color="#C77DFF" />
            <Text style={styles.headerTitle}>{t('hotels') || 'Hôtels'}</Text>
          </View>
          <Text style={styles.subtitle}>{t('findBestHotels') || 'Trouvez les meilleurs hôtels'}</Text>

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
                    <Text style={styles.popularPrice}>{t('from') || 'dès'} {dest.price}€</Text>
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
                  <Text style={styles.inputLabel}>{t('city') || 'VILLE'}</Text>
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

              {/* Check-in Date */}
              <Pressable style={styles.inputContainer} onPress={() => setShowCheckInPicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>{t('checkIn') || 'ARRIVÉE'}</Text>
                  <Text style={styles.inputValue}>{checkIn || t('chooseDate') || 'Choisir une date'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
              </Pressable>

              {/* Check-out Date */}
              <Pressable style={styles.inputContainer} onPress={() => setShowCheckOutPicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>{t('checkOut') || 'DÉPART'}</Text>
                  <Text style={styles.inputValue}>{checkOut || t('chooseDate') || 'Choisir une date'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C77DFF" />
              </Pressable>

              {/* Guests */}
              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color="#C77DFF" />
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>{t('travelers') || 'VOYAGEURS'}</Text>
                  <Text style={styles.inputValue}>{guests} {guests > 1 ? t('persons') || 'personnes' : t('person') || 'personne'}</Text>
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
                  <Text style={styles.searchButtonText}>{t('search') || 'Rechercher'}</Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </View>

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#9D4EDD" />
            <Text style={styles.infoText}>
              {t('redirectPartner') || 'Vous serez redirigé vers notre partenaire pour finaliser la réservation'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* City Selection Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('chooseCity') || 'Choisir une ville'}</Text>
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

      {/* Partner Selection Modal */}
      <Modal visible={showPartnerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { minHeight: '30%' }]}>
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
                onPress={() => {
                  setSelectedPartner(partner);
                  setShowPartnerModal(false);
                }}
              >
                <View style={[styles.partnerIcon, { backgroundColor: partner.color + '30' }]}>
                  <Ionicons name={partner.icon as any} size={24} color={partner.color} />
                </View>
                <Text style={styles.partnerName}>{partner.name}</Text>
                {selectedPartner.id === partner.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#C77DFF" />
                )}
              </Pressable>
            ))}
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
    marginHorizontal: 16,
    marginBottom: 20,
  },
  infoText: { flex: 1, marginLeft: 10, color: '#9D4EDD', fontSize: 12 },

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

