import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = 'userStats';

interface Stats {
  searchCount: number;
  favoritesCount: number;
}

export const statsService = {
  async getStats(): Promise<Stats> {
    try {
      const saved = await AsyncStorage.getItem(STATS_KEY);
      if (saved) return JSON.parse(saved);
      return { searchCount: 0, favoritesCount: 0 };
    } catch (e) {
      return { searchCount: 0, favoritesCount: 0 };
    }
  },

  async incrementSearch(): Promise<void> {
    try {
      const stats = await this.getStats();
      stats.searchCount += 1;
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.log('Error incrementing search');
    }
  },

  async getAlertsCount(): Promise<number> {
    try {
      const saved = await AsyncStorage.getItem('priceAlerts');
      if (saved) {
        const alerts = JSON.parse(saved);
        return alerts.length;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  },

  async incrementFavorites(): Promise<void> {
    try {
      const stats = await this.getStats();
      stats.favoritesCount += 1;
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.log('Error incrementing favorites');
    }
  },

  async decrementFavorites(): Promise<void> {
    try {
      const stats = await this.getStats();
      stats.favoritesCount = Math.max(0, stats.favoritesCount - 1);
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.log('Error decrementing favorites');
    }
  }
};
