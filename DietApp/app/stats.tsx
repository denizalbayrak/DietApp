import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const options = {
  headerShown: false,
};

const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

type WeeklyEntry = {
  label: string;
  date: string;
  calories: number;
};

export default function StatsScreen() {
  const [weeklyData, setWeeklyData] = useState<WeeklyEntry[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [overGoalDays, setOverGoalDays] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const profileRef = doc(db, 'profiles', user.uid);
        const entriesRef = doc(db, 'entries', user.uid);
        const [profileSnap, entriesSnap] = await Promise.all([
          getDoc(profileRef),
          getDoc(entriesRef),
        ]);

        const calorieGoal = profileSnap.exists()
          ? Number(profileSnap.data().calorieGoal) || 2000
          : 2000;

        const entries = entriesSnap.exists() ? entriesSnap.data() : {};
        const today = new Date();
        const data: WeeklyEntry[] = [];
        let total = 0;
        let exceed = 0;

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const label = weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1];
          const dayEntries = entries[dateStr] || [];
          const dayTotal = dayEntries.reduce((sum: number, e: any) => sum + e.calories, 0);

          if (dayTotal > calorieGoal) exceed++;
          total += dayTotal;

          data.push({ label, date: dateStr, calories: dayTotal });
        }

        setWeeklyData(data);
        setAverage(Math.round(total / 7));
        setOverGoalDays(exceed);
      } catch (error) {
        console.error('İstatistik verisi alınamadı:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Haftalık İstatistikler</Text>

      <ScrollView style={{ flex: 1 }}>
        {weeklyData.map((day, index) => (
          <View key={index} style={styles.dayRow}>
            <Text style={styles.dayLabel}>{day.label}</Text>
            <Text style={styles.dayValue}>{day.calories} kcal</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Haftalık Ortalama: {average} kcal</Text>
        <Text style={styles.summaryText}>Hedef Aşılan Gün: {overGoalDays} / 7</Text>
        <Text style={styles.emoji}>
          {overGoalDays === 0 ? '🌟' : overGoalDays <= 3 ? '😊' : '🥲'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  dayValue: {
    fontSize: 16,
    color: '#555',
  },
  summaryBox: {
    marginTop: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 4,
  },
  emoji: {
    fontSize: 24,
    marginTop: 8,
  },
});
