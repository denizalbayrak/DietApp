import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

export const options = {
  title: 'Home',
  headerShown: false,
};
export default function HomeScreen() {
  const [profileImage, setProfileImage] = useState('🐶');
  const [userName, setUserName] = useState('');

  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileImage(data.image || '🐶');
        setUserName(data.name || '');
      }
    } catch (error) {
      console.error('Profil verisi alınamadı:', error);
    }
  };

  // Sayfa odaklandığında yeniden profili çek
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Home</Text>
        <TouchableOpacity style={styles.profileCircle} onPress={() => router.push('/profile')}>
          <Text style={styles.profileEmoji}>{profileImage}</Text>
        </TouchableOpacity>
      </View>
 <SafeAreaView style={styles.container}>
    {/* diğer her şey */}
  </SafeAreaView>
      <Text style={styles.greeting}>
        Hoş geldin {userName ? `${userName} 👋` : ''}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  topHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Android'de gölge için
    shadowColor: '#000', // iOS gölge için
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  profileEmoji: {
    fontSize: 28,
    textAlign: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#E4572E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
