
import { View, Text, StyleSheet, Pressable, SafeAreaView, FlatList, Alert, TextInput, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PriceAlert {
  id: string;
  origin: string;
  destination: string;
  targetPrice: number;
  createdAt: string;
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const saved = await AsyncStorage.getItem('priceAlerts');
      if (saved) setAlerts(JSON.parse(saved));
    } catch (e) {
      console.log('Error loading alerts');
    }
  };

  const saveAlerts = async (newAlerts: PriceAlert[]) => {
    try {
      await AsyncStorage.setItem('priceAlerts', JSON.stringify(newAlerts));
      setAlerts(newAlerts);
    } catch (e) {
      console.log('Error saving alerts');
    }
  };

  const addAlert = () => {
    if (!origin || !destination || !targetPrice) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      targetPrice: parseInt(targetPrice),
      createdAt: new Date().toLocaleDateString('fr-FR'),
    };
    saveAlerts([...alerts, newAlert]);
    setShowModal(false);
    setOrigin('');
    setDestination('');
    setTargetPrice('');
    Alert.alert('Succes', 'Alerte creee !');
  };

  const deleteAlert = (id: string) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette alerte ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => {
        const newAlerts = alerts.filter(a => a.id !== id);
        saveAlerts(newAlerts);
      }},
    ]);
  };

  const renderAlert = ({ item }: { item: PriceAlert }) => (
    <Pressable style={styles.alertCard} onLongPress={() => deleteAlert(item.id)}>
      <LinearGradient colors={['#240046', '#3C096C']} style={styles.alertGradient}>
        <View style={styles.alertHeader}>
          <View style={styles.routeContainer}>
            <Text style={styles.airportCode}>{item.origin}</Text>
            <Ionicons name="airplane" size={16} color="#C77DFF" style={styles.planeIcon} />
            <Text style={styles.airportCode}>{item.destination}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteAlert(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#9D4EDD" />
          </TouchableOpacity>
        </View>
        <View style={styles.alertBody}>
          <View>
            <Text style={styles.priceLabel}>Prix cible</Text>
            <Text style={styles.targetPrice}>{item.targetPrice} EUR</Text>
          </View>
          <View>
            <Text style={styles.dateLabel}>Creee le</Text>
            <Text style={styles.dateValue}>{item.createdAt}</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Ionicons name="notifications" size={28} color="#C77DFF" />
          <Text style={styles.headerTitle}>Mes Alertes</Text>
        </View>
        <Text style={styles.subtitle}>Soyez notifie quand les prix baissent</Text>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={60} color="#5A189A" />
            <Text style={styles.emptyText}>Aucune alerte de prix</Text>
            <Text style={styles.emptySubtext}>Appuyez sur + pour creer une alerte</Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            renderItem={renderAlert}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Pressable style={styles.addButton} onPress={() => setShowModal(true)}>
          <LinearGradient colors={['#7B2CBF', '#C77DFF']} style={styles.addButtonGradient}>
            <Ionicons name="add" size={28} color="#FFF" />
          </LinearGradient>
        </Pressable>

        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nouvelle Alerte</Text>
                <Pressable onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={28} color="#FFF" />
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Depart (code IATA)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: CDG, ORY, LYS"
                  placeholderTextColor="#9D4EDD"
                  value={origin}
                  onChangeText={setOrigin}
                  autoCapitalize="characters"
                  maxLength={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Destination (code IATA)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: BKK, JFK, BCN"
                  placeholderTextColor="#9D4EDD"
                  value={destination}
                  onChangeText={setDestination}
                  autoCapitalize="characters"
                  maxLength={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prix cible (EUR)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 350"
                  placeholderTextColor="#9D4EDD"
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  keyboardType="numeric"
                />
              </View>

              <Pressable style={styles.createButton} onPress={addAlert}>
                <LinearGradient colors={['#7B2CBF', '#C77DFF']} style={styles.createButtonGradient}>
                  <Ionicons name="notifications" size={20} color="#FFF" />
                  <Text style={styles.createButtonText}>Creer l'alerte</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginLeft: 10 },
  subtitle: { fontSize: 14, color: '#9D4EDD', marginBottom: 20, marginLeft: 38 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#FFD700', fontSize: 18, marginTop: 16 },
  emptySubtext: { color: '#9D4EDD', fontSize: 14, marginTop: 8 },
  listContainer: { paddingBottom: 100 },
  alertCard: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  alertGradient: { padding: 16 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  routeContainer: { flexDirection: 'row', alignItems: 'center' },
  airportCode: { fontSize: 18, fontWeight: 'bold', color: '#FFD700' },
  planeIcon: { marginHorizontal: 10, transform: [{ rotate: '90deg' }] },
  alertBody: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: 12, color: '#9D4EDD' },
  targetPrice: { fontSize: 20, fontWeight: 'bold', color: '#C77DFF' },
  dateLabel: { fontSize: 12, color: '#9D4EDD', textAlign: 'right' },
  dateValue: { fontSize: 14, color: '#FFD700', textAlign: 'right' },
  addButton: { position: 'absolute', bottom: 30, right: 20 },
  addButtonGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#C77DFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E0B3C', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFD700' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, color: '#C77DFF', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: '#FFD700', fontSize: 16, borderWidth: 1, borderColor: '#7B2CBF' },
  createButton: { marginTop: 8, borderRadius: 12, overflow: 'hidden' },
  createButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  createButtonText: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});

