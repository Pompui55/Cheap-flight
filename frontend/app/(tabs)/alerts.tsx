import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface PriceAlert {
  alert_id: string;
  origin: string;
  destination: string;
  max_price: number;
  active: boolean;
  created_at: string;
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAlert, setNewAlert] = useState({
    origin: '',
    destination: '',
    max_price: '',
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/alerts`, {
        withCredentials: true,
      });
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Load alerts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    if (!newAlert.origin || !newAlert.destination || !newAlert.max_price) {
      alert('Please fill all fields');
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/alerts`,
        {
          origin: newAlert.origin,
          destination: newAlert.destination,
          max_price: parseFloat(newAlert.max_price),
        },
        { withCredentials: true }
      );
      setModalVisible(false);
      setNewAlert({ origin: '', destination: '', max_price: '' });
      loadAlerts();
    } catch (error) {
      console.error('Create alert error:', error);
      alert('Failed to create alert');
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/alerts/${alertId}`, {
        withCredentials: true,
      });
      setAlerts(alerts.filter((a) => a.alert_id !== alertId));
    } catch (error) {
      console.error('Delete alert error:', error);
      alert('Failed to delete alert');
    }
  };

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="notifications" size={32} color="#E0AAFF" />
            <Text style={styles.headerTitle}>Price Alerts</Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={32} color="#C77DFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C77DFF" />
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#5A189A" />
            <Text style={styles.emptyText}>No alerts set</Text>
            <Text style={styles.emptySubtext}>
              Create alerts to get notified when prices drop
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setModalVisible(true)}
            >
              <LinearGradient
                colors={['#7B2CBF', '#5A189A']}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add" size={24} color="#FFF" />
                <Text style={styles.createButtonText}>Create Alert</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {alerts.map((alert) => (
              <View key={alert.alert_id} style={styles.alertCard}>
                <LinearGradient
                  colors={['#240046', '#3C096C']}
                  style={styles.alertGradient}
                >
                  <View style={styles.alertHeader}>
                    <View style={styles.routeInfo}>
                      <Text style={styles.routeText}>
                        {alert.origin} → {alert.destination}
                      </Text>
                      <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, alert.active && styles.statusDotActive]} />
                        <Text style={styles.statusText}>
                          {alert.active ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => deleteAlert(alert.alert_id)}>
                      <Ionicons name="trash" size={24} color="#E0AAFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.alertBody}>
                    <View style={styles.priceInfo}>
                      <Ionicons name="pricetag" size={20} color="#C77DFF" />
                      <Text style={styles.priceLabel}>Max Price:</Text>
                      <Text style={styles.priceValue}>${alert.max_price.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.dateText}>
                      Created {new Date(alert.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Create Alert Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#3C096C', '#5A189A']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Create Price Alert</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={28} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="location" size={20} color="#C77DFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="From (e.g., PAR)"
                    placeholderTextColor="#9D4EDD"
                    value={newAlert.origin}
                    onChangeText={(text) => setNewAlert({ ...newAlert, origin: text })}
                    autoCapitalize="characters"
                    maxLength={3}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#C77DFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="To (e.g., NYC)"
                    placeholderTextColor="#9D4EDD"
                    value={newAlert.destination}
                    onChangeText={(text) => setNewAlert({ ...newAlert, destination: text })}
                    autoCapitalize="characters"
                    maxLength={3}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="pricetag" size={20} color="#C77DFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Max Price (e.g., 500)"
                    placeholderTextColor="#9D4EDD"
                    value={newAlert.max_price}
                    onChangeText={(text) => setNewAlert({ ...newAlert, max_price: text })}
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={createAlert}>
                  <LinearGradient
                    colors={['#7B2CBF', '#C77DFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>Create Alert</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9D4EDD',
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  alertCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  alertGradient: {
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9D4EDD',
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    color: '#E0AAFF',
  },
  alertBody: {
    borderTopWidth: 1,
    borderTopColor: '#5A189A',
    paddingTop: 12,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#E0AAFF',
    marginLeft: 8,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginLeft: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#9D4EDD',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
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
  submitButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
