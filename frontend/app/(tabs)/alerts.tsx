import { View, Text, StyleSheet, Pressable, SafeAreaView, FlatList, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import notificationService from '../src/services/notifications';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [origin, setOrigin] = useState('Paris');
  const [destination, setDestination] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  const testNotification = async () => {
    await notificationService.sendLocalNotification('Test', 'Notifications fonctionnent !');
  };

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Ionicons name="notifications" size={28} color="#C77DFF" />
          <Text style={styles.headerTitle}>Mes Alertes</Text>
        </View>
        <Text style={styles.subtitle}>Soyez notifie quand les prix baissent</Text>

        <Pressable style={styles.testButton} onPress={testNotification}>
          <Ionicons name="paper-plane" size={18} color="#FFD700" />
          <Text style={styles.testButtonText}>Tester les notifications</Text>
        </Pressable>

        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={60} color="#5A189A" />
          <Text style={styles.emptyText}>Aucune alerte de prix</Text>
          <Text style={styles.emptySubtext}>Fonctionnalite bientot disponible</Text>
        </View>

        <Pressable style={styles.addButton} onPress={() => Alert.alert('Bientot', 'Cette fonctionnalite arrive bientot !')}>
          <LinearGradient colors={['#7B2CBF', '#C77DFF']} style={styles.addButtonGradient}>
            <Ionicons name="add" size={28} color="#FFF" />
          </LinearGradient>
        </Pressable>
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
  testButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(123,44,191,0.3)', padding: 12, borderRadius: 10 },
  testButtonText: { color: '#FFD700', marginLeft: 8, fontSize: 14 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#FFD700', fontSize: 18, marginTop: 16 },
  emptySubtext: { color: '#9D4EDD', fontSize: 14, marginTop: 8 },
  addButton: { position: 'absolute', bottom: 30, right: 20 },
  addButtonGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
});