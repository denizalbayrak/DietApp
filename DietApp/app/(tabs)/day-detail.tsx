import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export const options = {
  headerShown: false,
};

type Entry = {
  food: string;
  calories: number;
};

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchEntries = async () => {
      const user = auth.currentUser;
      if (!user || !date) return;

      try {
        const docRef = doc(db, 'entries', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const dayEntries: Entry[] = data[date] || [];

          setEntries(dayEntries);
          const totalCalories = dayEntries.reduce((sum, e) => sum + e.calories, 0);
          setTotal(totalCalories);
        }
      } catch (error) {
        console.error('Veri çekilemedi:', error);
      }
    };

    fetchEntries();
  }, [date]);

  return (
    <SafeAreaView style={styles.container}>
       <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#444" />
      </TouchableOpacity>
      <Text style={styles.title}>{date} Günü Girdileri</Text>
      <Text style={styles.total}>Toplam Kalori: {total} kcal</Text>

      {entries.length === 0 ? (
        <Text style={styles.noData}>Bu güne ait giriş yok.</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.food}>{item.food}</Text>
              <Text style={styles.cal}>{item.calories} kcal</Text>
            </View>
          )}
        />
      )}

      <Text style={styles.back} onPress={() => router.back()}>◀ Geri Dön</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  total: {
    fontSize: 18,
    color: '#5EBEC4',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  food: {
    fontSize: 16,
  },
  cal: {
    fontWeight: 'bold',
  },
  back: {
    marginTop: 24,
    color: '#5EBEC4',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
