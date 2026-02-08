import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.profileImageContainer}>
              <LinearGradient
                colors={['#7B2CBF', '#C77DFF']}
                style={styles.profileImageGradient}
              >
                {user?.picture ? (
                  <Image source={{ uri: user.picture }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person" size={60} color="#FFF" />
                )}
              </LinearGradient>
            </View>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <LinearGradient
              colors={['#5A189A', '#3C096C']}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Ionicons name="search" size={32} color="#C77DFF" />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Searches</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="heart" size={32} color="#C77DFF" />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="notifications" size={32} color="#C77DFF" />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Alerts</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity style={styles.menuItem}>
              <LinearGradient
                colors={['#240046', '#3C096C']}
                style={styles.menuItemGradient}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="person-circle" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>Edit Profile</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <LinearGradient
                colors={['#240046', '#3C096C']}
                style={styles.menuItemGradient}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="notifications-circle" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <LinearGradient
                colors={['#240046', '#3C096C']}
                style={styles.menuItemGradient}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="card" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>Payment Methods</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <LinearGradient
                colors={['#240046', '#3C096C']}
                style={styles.menuItemGradient}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="globe" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>Language</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <Text style={styles.menuItemValue}>English</Text>
                  <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Support</Text>

            <TouchableOpacity style={styles.menuItem}>
              <LinearGradient
                colors={['#240046', '#3C096C']}
                style={styles.menuItemGradient}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="help-circle" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>Help Center</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <LinearGradient
                colors={['#240046', '#3C096C']}
                style={styles.menuItemGradient}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="document-text" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>Terms & Conditions</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <LinearGradient
                colors={['#240046', '#3C096C']}
                style={styles.menuItemGradient}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="shield-checkmark" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>Privacy Policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient
              colors={['#7B2CBF', '#5A189A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out" size={24} color="#FFF" />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.version}>CHEAP FLIGHT v1.0.0</Text>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImageGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C77DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9D4EDD',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#E0AAFF',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#5A189A',
  },
  menuSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C77DFF',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 14,
    color: '#9D4EDD',
    marginRight: 8,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#5A189A',
    marginBottom: 32,
  },
});
