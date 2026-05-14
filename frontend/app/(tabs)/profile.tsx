import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../contexts/LanguageContext';

const LANGUAGES = [
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
];

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const selectedLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem('profileImage');
        if (savedImage) setProfileImage(savedImage);
      } catch (e) {
        console.log('Error loading image');
      }
    };
    loadProfileImage();
  }, []);

  useEffect(() => {
    const saveProfileImage = async () => {
      try {
        if (profileImage) {
          await AsyncStorage.setItem('profileImage', profileImage);
        }
      } catch (e) {
        console.log('Error saving image');
      }
    };
    if (profileImage) saveProfileImage();
  }, [profileImage]);

  if (!isAuthenticated) {
    return (
      <LinearGradient colors={['#0A0118', '#1E0B3C']} style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Ionicons name="person-circle" size={100} color="#FFD700" />
        <Text style={{color:'#FFD700',fontSize:24,marginTop:20,fontWeight:'bold'}}>{t('login')}</Text>
        <TouchableOpacity onPress={() => router.push('/auth')} style={{marginTop:30,backgroundColor:'#FFD700',paddingHorizontal:40,paddingVertical:15,borderRadius:12}}>
          <Text style={{color:'#0A0118',fontSize:18,fontWeight:'bold'}}>{t('login')}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('error'), 'Permission required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const selectLanguage = (lang: typeof LANGUAGES[0]) => {
    setLanguage(lang.code);
    setShowLanguageModal(false);
  };

  return (
    <LinearGradient colors={['#0A0118', '#1E0B3C']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
              <LinearGradient colors={['#7B2CBF', '#C77DFF']} style={styles.profileImageGradient}>
                {profileImage || user?.picture ? (
                  <Image source={{ uri: profileImage || user?.picture }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person" size={60} color="#FFF" />
                )}
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>

          <View style={styles.statsCard}>
            <LinearGradient colors={['#5A189A', '#3C096C']} style={styles.statsGradient}>
              <View style={styles.statItem}>
                <Ionicons name="search" size={32} color="#C77DFF" />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>{t('search')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="heart" size={32} color="#C77DFF" />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>{t('favorites')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="notifications" size={32} color="#C77DFF" />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>{t('alerts')}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{t('settings')}</Text>

            <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert(t('profile'), t('comingSoon'))}>
              <LinearGradient colors={['#240046', '#3C096C']} style={styles.menuItemGradient}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="person-circle" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>{t('editProfile')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert(t('history'), t('comingSoon'))}>
              <LinearGradient colors={['#240046', '#3C096C']} style={styles.menuItemGradient}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="time" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>{t('history')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => setShowLanguageModal(true)}>
              <LinearGradient colors={['#240046', '#3C096C']} style={styles.menuItemGradient}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="globe" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>{t('language')}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <Text style={styles.menuItemValue}>{selectedLanguage.flag} {selectedLanguage.name}</Text>
                  <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{t('support')}</Text>

            <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL("mailto:music.music60music@gmail.com?subject=Support Cheap Flight")}>
              <LinearGradient colors={['#240046', '#3C096C']} style={styles.menuItemGradient}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="help-circle" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>{t('helpCenter')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL("https://www.aviasales.com/terms_of_use")}>
              <LinearGradient colors={['#240046', '#3C096C']} style={styles.menuItemGradient}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="document-text" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>{t('termsConditions')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL("https://www.aviasales.com/privacy")}>
              <LinearGradient colors={['#240046', '#3C096C']} style={styles.menuItemGradient}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="shield-checkmark" size={24} color="#C77DFF" />
                  <Text style={styles.menuItemText}>{t('privacyPolicy')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9D4EDD" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient colors={['#7B2CBF', '#5A189A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.logoutGradient}>
              <Ionicons name="log-out" size={24} color="#FFF" />
              <Text style={styles.logoutText}>{t('logout')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.version}>CHEAP FLIGHT v2.3.0</Text>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={showLanguageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('language')}</Text>
              <Pressable onPress={() => setShowLanguageModal(false)} hitSlop={20}>
                <Ionicons name="close" size={28} color="#FFF" />
              </Pressable>
            </View>
            <ScrollView>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  style={({ pressed }) => [styles.langItem, pressed && styles.langItemPressed]}
                  onPress={() => selectLanguage(lang)}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text style={styles.langName}>{lang.name}</Text>
                  {language === lang.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#C77DFF" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  header: { alignItems: 'center', padding: 32 },
  profileImageContainer: { marginBottom: 16 },
  profileImageGradient: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', shadowColor: '#C77DFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#7B2CBF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1E0B3C' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#9D4EDD' },
  statsCard: { marginHorizontal: 16, marginBottom: 24, borderRadius: 16, overflow: 'hidden' },
  statsGradient: { flexDirection: 'row', padding: 20, justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#FFD700', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#5A189A' },
  menuSection: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#C77DFF', marginBottom: 12, marginLeft: 4 },
  menuItem: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  menuItemGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: 16, color: '#FFD700', marginLeft: 12 },
  menuItemRight: { flexDirection: 'row', alignItems: 'center' },
  menuItemValue: { fontSize: 14, color: '#9D4EDD', marginRight: 8 },
  logoutButton: { marginHorizontal: 16, marginVertical: 24, borderRadius: 12, overflow: 'hidden' },
  logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#FFD700', marginLeft: 8 },
  version: { textAlign: 'center', fontSize: 12, color: '#5A189A', marginBottom: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E0B3C', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#5A189A' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFD700' },
  langItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#3C096C' },
  langItemPressed: { backgroundColor: 'rgba(199,125,255,0.1)' },
  langFlag: { fontSize: 28, marginRight: 16 },
  langName: { flex: 1, fontSize: 16, color: '#FFD700' },
});
