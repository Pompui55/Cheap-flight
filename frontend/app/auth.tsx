import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const router = useRouter();
  const { user, login } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/search');
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await login();
      router.replace('/(tabs)/search');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#0A0118', '#1E0B3C', '#5A189A']}
      style={styles.container}
    >
      {/* Cosmic Background Effects */}
      <View style={styles.starsContainer}>
        {[...Array(50)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                opacity: Math.random() * 0.8 + 0.2,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#7B2CBF', '#C77DFF']}
            style={styles.logoGradient}
          >
            <Ionicons name="airplane" size={80} color="#FFF" />
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>CHEAP FLIGHT</Text>
        <Text style={styles.subtitle}>Discover the cosmos of affordable travel</Text>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="search" size={24} color="#C77DFF" />
            <Text style={styles.featureText}>Search worldwide flights</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="notifications" size={24} color="#C77DFF" />
            <Text style={styles.featureText}>Price alerts</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="star" size={24} color="#C77DFF" />
            <Text style={styles.featureText}>Save favorites</Text>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
          <LinearGradient
            colors={['#7B2CBF', '#5A189A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loginGradient}
          >
            <Ionicons name="logo-google" size={24} color="#FFF" style={styles.googleIcon} />
            <Text style={styles.loginText}>Continue with Google</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footer}>Start your journey through the stars</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C77DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0AAFF',
    marginBottom: 48,
    textAlign: 'center',
  },
  features: {
    marginBottom: 48,
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  featureText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 16,
  },
  loginButton: {
    width: '100%',
    marginBottom: 24,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#7B2CBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  googleIcon: {
    marginRight: 12,
  },
  loginText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    color: '#9D4EDD',
    fontSize: 14,
  },
});
