import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export const options = {
  headerShown: false,
};

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState<any>({});

  const handleDayPress = (day: { dateString: string }) => {
    const selected = day.dateString;
    setSelectedDate(selected);
    router.push(`./day-detail?date=${selected}` as const);
  };

  useEffect(() => {
    const fetchMarkedDates = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const entriesRef = doc(db, 'entries', user.uid);
        const profileRef = doc(db, 'profiles', user.uid);

        const [entriesSnap, profileSnap] = await Promise.all([
          getDoc(entriesRef),
          getDoc(profileRef), 
        ]);
        const entriesData = entriesSnap.exists() ? entriesSnap.data() : {};
        const calorieGoal = profileSnap.exists()
          ? Number(profileSnap.data().calorieGoal)
          : 2000;

        const newMarked: any = {};

        for (const date in entriesData) {
          const dailyEntries = entriesData[date];
          const total = dailyEntries.reduce(
            (sum: number, entry: any) => sum + (entry.calories || 0),
            0
          );

          newMarked[date] = {
            selected: true,
            selectedColor: total > calorieGoal ? '#FF6B6B' : '#8ad1a3',
          };
        }

        setMarkedDates(newMarked);
      } catch (error) {
        console.error('Takvim verileri alınamadı:', error);
      }
    };

    fetchMarkedDates();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#444" />
      </TouchableOpacity>

      <Text style={styles.title}>📆 Kalori Takvimi</Text>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor:
              markedDates[selectedDate]?.selectedColor || '#379683',
          },
        }}
        theme={{
          selectedDayBackgroundColor: '#379683',
          todayTextColor: '#E4572E',
          arrowColor: '#379683',
          backgroundColor: '#E3FDFD',
          calendarBackground: '#E3FDFD',
          textDayFontWeight: '600',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: 'bold',
          monthTextColor: '#379683',
        }}
        style={styles.calendar}
      />

      {selectedDate !== '' && (
        <Text style={styles.selectedText}>📍 Seçilen Gün: {selectedDate}</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#E3FDFD',
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#379683',
  },
  selectedText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 16,
    color: '#444',
  },
  calendar: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
