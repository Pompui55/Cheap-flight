import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export interface PriceAlert {
  id?: string;
  origin: string;
  destination: string;
  targetPrice: number;
  departureDate: string;
  isActive: boolean;
}

class NotificationService {
  private pushToken: string | null = null;

  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Notifications need physical device');
      return null;
    }
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return null;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      this.pushToken = tokenData.data;
      await AsyncStorage.setItem('pushToken', this.pushToken);
      await this.registerTokenWithBackend(this.pushToken);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('price-alerts', {
          name: 'Alertes de Prix',
          importance: Notifications.AndroidImportance.HIGH,
        });
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Rappels de Voyage',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      return this.pushToken;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      await fetch(API_URL + '/api/notifications/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: Platform.OS, userId: userId || 'anonymous' }),
      });
    } catch (error) {
      console.error('Error registering token:', error);
    }
  }

  async createPriceAlert(alert: PriceAlert): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('pushToken');
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(API_URL + '/api/alerts/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...alert, pushToken: token, userId: userId || 'anonymous' }),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getPriceAlerts(): Promise<PriceAlert[]> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(API_URL + '/api/alerts/price?userId=' + (userId || 'anonymous'));
      if (response.ok) return await response.json();
      return [];
    } catch (error) {
      return [];
    }
  }

  async deletePriceAlert(alertId: string): Promise<boolean> {
    try {
      const response = await fetch(API_URL + '/api/alerts/price/' + alertId, { method: 'DELETE' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async scheduleReminder(title: string, body: string, triggerDate: Date): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { date: triggerDate, channelId: 'reminders' },
    });
  }

  async sendLocalNotification(title: string, body: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  }

  async getPushToken(): Promise<string | null> {
    if (this.pushToken) return this.pushToken;
    return await AsyncStorage.getItem('pushToken');
  }
}

export const notificationService = new NotificationService();
export default notificationService;
