import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useState, useEffect } from 'react';

export default function AuthScreen() {
  const router = useRouter();
  const { user, login, register, isLoading } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/search');
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      router.replace('/(tabs)/search');
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    }
  };

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C', '#5A189A']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <LinearGradient colors={['#7B2CBF', '#C77DFF']} style={styles.logoGradient}>
            <Ionicons name="airplane" size={60} color="#FFF" />
          </LinearGradient>
        </View>
        <Text style={styles.title}>CHEAP FLIGHT</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Connexion' : 'Inscription'}</Text>
        {!isLogin && (
          <TextInput style={styles.input} placeholder="Nom" placeholderTextColor="#9D4EDD" value={name} onChangeText={setName} />
        )}
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9D4EDD" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Mot de passe" placeholderTextColor="#9D4EDD" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity onPress={handleSubmit} style={styles.button} disabled={isLoading}>
          <LinearGradient colors={['#7B2CBF', '#5A189A']} style={styles.buttonGradient}>
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{isLogin ? 'Se connecter' : 'S'\'inscrire'}</Text>}
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>{isLogin ? 'Pas de compte ? S'\'inscrire' : 'Deja un compte ? Se connecter'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logoContainer: { marginBottom: 24 },
  logoGradient: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#E0AAFF', marginBottom: 32 },
  input: { width: '100%', backgroundColor: 'rgba(157,78,221,0.2)', borderRadius: 12, padding: 16, marginBottom: 16, color: '#FFF', fontSize: 16 },
  button: { width: '100%', marginTop: 8 },
  buttonGradient: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  switchText: { color: '#C77DFF', marginTop: 24, fontSize: 16 },
});
