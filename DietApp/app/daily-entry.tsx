import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export const options = {
  headerShown: false,
};

export default function DailyEntryScreen() {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [currentCalories, setCurrentCalories] = useState(0);
  const [entries, setEntries] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const profileRef = doc(db, 'profiles', user!.uid);
      const entryRef = doc(db, 'entries', user!.uid);
      const [profileSnap, entrySnap] = await Promise.all([
        getDoc(profileRef),
        getDoc(entryRef),
      ]);

      if (profileSnap.exists()) {
        const profile = profileSnap.data();
        setCalorieGoal(Number(profile.calorieGoal || 2000));
      }

      const entryData = entrySnap.exists() ? entrySnap.data() : {};
      const todayEntries = entryData[today] || [];
      setEntries(todayEntries);

      const total = todayEntries.reduce((sum: number, e: any) => sum + e.calories, 0);
      setCurrentCalories(total);
    } catch (error) {
      console.error('Veri alınamadı:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!foodName || !calories) return;
    const newEntry = {
      food: foodName,
      calories: parseInt(calories),
    };

    try {
      const ref = doc(db, 'entries', user!.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const todayEntries = data[today] || [];

      let updatedEntries;
      if (editingIndex !== null) {
        todayEntries[editingIndex] = newEntry;
        updatedEntries = [...todayEntries];
      } else {
        updatedEntries = [...todayEntries, newEntry];
      }

      await setDoc(ref, {
        ...data,
        [today]: updatedEntries,
      });

      setFoodName('');
      setCalories('');
      setEditingIndex(null);
      fetchData();
    } catch (error) {
      console.error('Veri güncellenemedi:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#444" />
      </TouchableOpacity>

      <Text style={styles.title}>🗿 Günlük Kalori Takibi</Text>

      <View style={styles.gaugeContainer}>
        <AnimatedCircularProgress
          size={200}
          width={20}
          fill={(currentCalories / calorieGoal) * 100}
          tintColor={currentCalories > calorieGoal ? '#E4572E' : '#5EBE91'}
          backgroundColor="#eee"
        >
          {() => (
            <Text style={styles.gaugeText}>
              {currentCalories} / {calorieGoal}
            </Text>
          )}
        </AnimatedCircularProgress>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Yiyecek adı (Ör: Tavuk)"
        value={foodName}
        onChangeText={setFoodName}
      />

      <TextInput
        style={styles.input}
        placeholder="Kalori"
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddEntry}>
        <Text style={styles.buttonText}>{editingIndex !== null ? 'Güncelle' : 'Ekle'}</Text>
      </TouchableOpacity>

      <FlatList
        data={entries}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.entryItem}>
            <Text style={styles.entryText}>{item.food} - {item.calories} kcal</Text>
            <TouchableOpacity
              onPress={() => {
                setFoodName(item.food);
                setCalories(item.calories.toString());
                setEditingIndex(index);
              }}
            >
              <Text style={styles.editBtn}>🖊️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={<Text style={styles.listTitle}>Bugünkü Girdiler</Text>}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFF2F7',
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  gaugeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
  },
  input: {
    height: 56,
    borderColor: '#FFC9E0',
    backgroundColor: '#FFF6FA',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF90B3',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
    textAlign: 'center',
  },
  entryItem: {
    padding: 16,
    borderBottomColor: '#FF90B3',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF90B3',
    borderColor:  '#FF90B3',
    borderRadius: 10,
    marginBottom: 8,
  },
  entryText: {
    fontSize: 16,
    color: '#444',
  },
  editBtn: {
    fontSize: 20,
    color: '#FF90B3',
  },
});
