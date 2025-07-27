import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const profileImages = ['🐶', '🐱', '🦊', '🐼', '🐵']; 

export default function ProfileScreen() {
  const [selectedImage, setSelectedImage] = useState('🐶');
  const [name, setName] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSelectedImage(data.image || '🐶');
          setName(data.name || '');
          setCalorieGoal(data.calorieGoal || '');
          setTargetWeight(data.targetWeight || '');
        }
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı.');
      return;
    }

    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        image: selectedImage,
        name,
        calorieGoal,
        targetWeight,
      });

      Alert.alert('Başarılı', 'Profil kaydedildi 🎉');
      router.back();
    } catch (error) {
      console.error('Profil kaydetme hatası:', error);
      Alert.alert('Hata', 'Profil kaydedilirken bir sorun oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#444" />
      </TouchableOpacity>
      <Text style={styles.title}>Profil Ayarları</Text>

      <Text style={styles.label}>Profil Resmi Seç</Text>
      <FlatList
        data={profileImages}
        horizontal
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.emojiBox,
              item === selectedImage && styles.selectedEmoji,
            ]}
            onPress={() => setSelectedImage(item)}
          >
            <Text style={styles.emoji}>{item}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.emojiList}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.label}>Ad</Text>
      <TextInput
        style={styles.input}
        placeholder="Adınızı girin"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Günlük Kalori Hedefi</Text>
      <TextInput
        style={styles.input}
        placeholder="örnek: 1800"
        value={calorieGoal}
        onChangeText={setCalorieGoal}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Hedef Kilo (kg)</Text>
      <TextInput
        style={styles.input}
        placeholder="örnek: 58"
        value={targetWeight}
        onChangeText={setTargetWeight}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  emojiList: {
    marginVertical: 12,
    justifyContent: 'center',
  },
  emojiBox: {
    padding: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
  },
  selectedEmoji: {
    borderColor: '#5EBEC4',
    backgroundColor: '#e0f7fa',
  },
  emoji: {
    fontSize: 32,
  },
  button: {
    backgroundColor: '#5EBEC4',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
