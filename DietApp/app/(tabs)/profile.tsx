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
import { db, auth } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ScrollView } from 'react-native';
const profileImages = ['🐵', '🐱', '🐶', '🐼', '🦊'];

export default function ProfileScreen() {
  const [selectedImage, setSelectedImage] = useState('🐶');
  const [name, setName] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setEmail(user.email || '');

      try {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSelectedImage(data.image || '🐵');
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

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("E-posta gönderildi", "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi 💌");
    } catch (error) {
      console.error("Şifre sıfırlama hatası:", error);
      Alert.alert("Hata", "Geçerli bir e-posta adresiniz olmayabilir.");
    }
  };

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

      Alert.alert('🎉 Başarılı', 'Profil kaydedildi!');
      router.back();
    } catch (error) {
      console.error('Profil kaydetme hatası:', error);
      Alert.alert('Hata', 'Profil kaydedilirken bir sorun oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: '#7A5184' }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#5B4B8A" />
        </TouchableOpacity>

        <Text style={styles.title} allowFontScaling={false}>Profil Ayarları</Text>

        <Text style={styles.label} allowFontScaling={false}>Profil Emoji</Text>
        <FlatList
          data={profileImages}
          horizontal={false}
          numColumns={5}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.emojiBox,
                item === selectedImage && styles.selectedEmoji,
              ]}
              onPress={() => setSelectedImage(item)}
            >
              <Text style={styles.emoji} allowFontScaling={false}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.emojiList}
          scrollEnabled={false}
        />

        <Text style={styles.label} allowFontScaling={false}>Ad</Text>
        <TextInput
          style={styles.input}
          placeholder="Adınızı girin"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label} allowFontScaling={false}>Günlük Kalori Hedefi</Text>
        <TextInput
          style={styles.input}
          placeholder="örnek: 1800"
          value={calorieGoal}
          onChangeText={setCalorieGoal}
          keyboardType="numeric"
        />

        <Text style={styles.label} allowFontScaling={false}>Hedef Kilo (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="örnek: 58"
          value={targetWeight}
          onChangeText={setTargetWeight}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
          <Text style={styles.resetText} allowFontScaling={false}>🔒 Şifremi Unuttum?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText} allowFontScaling={false}>Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFF1F7',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5B4B8A',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7A5184',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderColor: '#E2C1E5',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  emojiList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  emojiBox: {
    width: 60,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#FADAE0',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  selectedEmoji: {
    borderColor: '#B570C1',
    borderWidth: 2,
    backgroundColor: '#f8bbd0',
  },
  emoji: {
    fontSize: 32,
  },
  resetButton: {
    alignSelf: 'center',
    marginVertical: 12,
  },
  resetText: {
    color: '#A67DB8',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#A0D8EF',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
