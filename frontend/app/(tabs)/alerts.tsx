import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface PriceAlert {
  alert_id: string;
  user_id: string;
  origin: string;
  destination: string;
  origin_city: string;
  destination_city: string;
  target_price: number;
  is_active: boolean;
  created_at: string;
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newAlert, setNewAlert] = useState({
    origin: '',
    destination: '',
    target_price: '',
  });
  const router = useRouter();

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
    return token;
  };

  const loadAlerts = async () => {
    try {
      const token = await checkAuth();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Load alerts error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAlerts();
  }, []);

  const createAlert = async () => {
    if (!newAlert.origin || !newAlert.destination || !newAlert.target_price) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const price = parseFloat(newAlert.target_price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/alerts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: newAlert.origin.toUpperCase(),
          destination: newAlert.destination.toUpperCase(),
          origin_city: newAlert.origin.toUpperCase(),
          destination_city: newAlert.destination.toUpperCase(),
          target_price: price,
        }),
      });

      if (response.ok) {
        setModalVisible(false);
        setNewAlert({ origin: '', destination: '', target_price: '' });
        loadAlerts();
        Alert.alert('Succès', 'Alerte créée avec succès !');
      } else {
        Alert.alert('Erreur', 'Impossible de créer l\'alerte');
      }
    } catch (error) {
      console.error('Create alert error:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'alerte');
    }
  };

  const deleteAlert = async (alertId: string) => {
    Alert.alert(
      'Supprimer l\'alerte',
      'Voulez-vous vraiment supprimer cette alerte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${BACKEND_URL}/api/alerts/${alertId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                setAlerts(alerts.filter((a) => a.alert_id !== alertId));
              }
            } catch (error) {
              console.error('Delete alert error:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'alerte');
            }
          },
        },
      ]
    );
  };

  const toggleAlert = async (alertId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/alerts/${alertId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(alerts.map((a) =>
          a.alert_id === alertId ? { ...a, is_active: data.is_active } : a
        ));
      }
    } catch (error) {
      console.error('Toggle alert error:', error);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C77DFF" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!isLoggedIn) {
    return (
      <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Ionicons name="notifications" size={28} color="#C77DFF" />
            <Text style={styles.headerTitle}>Alertes Prix</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="lock-closed-outline" size={64} color="#5A189A" />
            <Text style={styles.emptyText}>Connexion requise</Text>
            <Text style={styles.emptySubtext}>
              Connectez-vous pour créer des alertes de prix
            </Text>
            <Pressable
              style={styles.loginButton}
              onPress={() => router.push('/auth')}
            >
              <LinearGradient
                colors={['#7B2CBF', '#C77DFF']}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="notifications" size={28} color="#C77DFF" />
            <Text style={styles.headerTitle}>Alertes Prix</Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle" size={32} color="#C77DFF" />
          </Pressable>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#5A189A" />
            <Text style={styles.emptyText}>Aucune alerte</Text>
            <Text style={styles.emptySubtext}>
              Créez des alertes pour être notifié quand les prix baissent
            </Text>
            <Pressable
              style={styles.createButton}
              onPress={() => setModalVisible(true)}
            >
              <LinearGradient
                colors={['#7B2CBF', '#C77DFF']}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add" size={22} color="#FFF" />
                <Text style={styles.createButtonText}>Créer une alerte</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#C77DFF"
              />
            }
          >
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
                      <Pressable
                        style={[
                          styles.statusBadge,
                          alert.is_active ? styles.statusActive : styles.statusInactive,
                        ]}
                        onPress={() => toggleAlert(alert.alert_id)}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            alert.is_active && styles.statusDotActive,
                          ]}
                        />
                        <Text style={styles.statusText}>
                          {alert.is_active ? 'Active' : 'Inactive'}
                        </Text>
                      </Pressable>
                    </View>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => deleteAlert(alert.alert_id)}
                    >
                      <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
                    </Pressable>
                  </View>

                  <View style={styles.alertBody}>
                    <View style={styles.priceInfo}>
                      <Ionicons name="pricetag" size={18} color="#C77DFF" />
                      <Text style={styles.priceLabel}>Prix cible :</Text>
                      <Text style={styles.priceValue}>{alert.target_price}€</Text>
                    </View>
                    <Text style={styles.dateText}>
                      Créée le {new Date(alert.created_at).toLocaleDateString('fr-FR')}
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
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setModalVisible(false)}
            />
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#1E0B3C', '#3C096C']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Nouvelle Alerte</Text>
                  <Pressable onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={28} color="#FFF" />
                  </Pressable>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="airplane-outline" size={20} color="#C77DFF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Départ (ex: CDG)"
                    placeholderTextColor="#9D4EDD"
                    value={newAlert.origin}
                    onChangeText={(text) =>
                      setNewAlert({ ...newAlert, origin: text.toUpperCase() })
                    }
                    autoCapitalize="characters"
                    maxLength={3}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#C77DFF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Destination (ex: JFK)"
                    placeholderTextColor="#9D4EDD"
                    value={newAlert.destination}
                    onChangeText={(text) =>
                      setNewAlert({ ...newAlert, destination: text.toUpperCase() })
                    }
                    autoCapitalize="characters"
                    maxLength={3}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="pricetag-outline" size={20} color="#C77DFF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Prix max en € (ex: 300)"
                    placeholderTextColor="#9D4EDD"
                    value={newAlert.target_price}
                    onChangeText={(text) =>
                      setNewAlert({ ...newAlert, target_price: text.replace(/[^0-9]/g, '') })
                    }
                    keyboardType="numeric"
                  />
                  <Text style={styles.currencyLabel}>€</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={createAlert}
                >
                  <LinearGradient
                    colors={['#7B2CBF', '#C77DFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    <Ionicons name="notifications" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>Créer l'alerte</Text>
                  </LinearGradient>
                </Pressable>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
  },
  addButton: {
    padding: 4,
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
    lineHeight: 20,
  },

  loginButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  createButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },

  alertCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  alertGradient: { padding: 16 },

  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeInfo: { flex: 1 },
  routeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: 'rgba(76,175,80,0.2)',
  },
  statusInactive: {
    backgroundColor: 'rgba(157,78,221,0.2)',
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
    fontWeight: '600',
  },

  deleteButton: {
    padding: 8,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginLeft: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#9D4EDD',
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
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
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 14,
    marginLeft: 12,
  },
  currencyLabel: {
    color: '#C77DFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  submitButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonPressed: { opacity: 0.9 },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
