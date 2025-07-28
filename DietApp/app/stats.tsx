import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

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

  useEffect(() => {
    fetchStats();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#444" />
      </TouchableOpacity>

      <Text style={styles.title}>📊 Haftalık İstatistikler</Text>

      <ScrollView style={{ flex: 1 }}>
        {weeklyData.map((day, index) => (
          <View key={index} style={styles.dayRow}>
            <Text style={styles.dayLabel}>{day.label}</Text>
            <Text style={styles.dayValue}>{day.calories} kcal</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Haftalık Ortalama: <Text style={styles.bold}>{average} kcal</Text></Text>
        <Text style={styles.summaryText}>Hedef Aşılan Gün: <Text style={styles.bold}>{overGoalDays} / 7</Text></Text>
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
  dayRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  dayValue: {
    fontSize: 16,
    color: '#333',
  },
  summaryBox: {
    marginTop: 24,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#444',
  },
  bold: {
    fontWeight: 'bold',
    color: '#379683',
  },
  emoji: {
    fontSize: 30,
    marginTop: 8,
  },
});
