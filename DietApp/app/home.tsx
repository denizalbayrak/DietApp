import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

export const options = {
  headerShown: false,
};

const weekDays = [
  { emoji: '🍓', label: 'Pzt' },
  { emoji: '🍊', label: 'Sal' },
  { emoji: '🥦', label: 'Çar' },
  { emoji: '🥕', label: 'Per' },
  { emoji: '🌊', label: 'Cum' },
  { emoji: '🍑', label: 'Cmt' },
  { emoji: '🍠', label: 'Paz' },
];

export default function HomeScreen() {
  const [profileImage, setProfileImage] = useState('👩');
  const [userName, setUserName] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [dayStatus, setDayStatus] = useState<{ [date: string]: 'green' | 'red' | 'gray' }>({});
  const [todayTotal, setTodayTotal] = useState(0);
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);

  const getWeekDates = () => {
    const dates: string[] = [];
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (currentDay - 1));
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const entriesRef = doc(db, 'entries', user.uid);
      const [profileSnap, entriesSnap] = await Promise.all([
        getDoc(profileRef),
        getDoc(entriesRef),
      ]);

      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setUserName(data.name || '');
        setProfileImage(data.image || '👩');
        setCalorieGoal(Number(data.calorieGoal) || 2000);
      }

      const entries = entriesSnap.exists() ? entriesSnap.data() : {};
      const newStatus: { [key: string]: 'green' | 'red' | 'gray' } = {};

      const now = new Date();
      const currentDay = now.getDay() === 0 ? 7 : now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (currentDay - 1));

      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const daily = entries[dateStr] || [];
        const total = daily.reduce((sum: number, e: any) => sum + e.calories, 0);
        if (daily.length > 0) {
          const goal = profileSnap.data()?.calorieGoal ?? 2000;
          newStatus[dateStr] = total > Number(goal) ? 'red' : 'green';
        } else {
          newStatus[dateStr] = 'gray';
        }

        if (dateStr === today) setTodayTotal(total);
      }

      setDayStatus(newStatus);
    } catch (error) {
      console.error('Veri çekilemedi:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [today])
  );

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hoş geldin</Text>
          <Text style={styles.name}>{userName} 💛</Text>
          <Text style={styles.subtitle}>Bugün de güzel seçimler yapmaya hazırsın ✨</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileEmoji}>{profileImage}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Week Calendar */}
      <View style={styles.weekRow}>
        {getWeekDates().map((dateStr, index) => {
          const dateObj = new Date(dateStr);
          const dayNumber = dateObj.getDate();
          const status = dayStatus[dateStr];
          const day = weekDays[index];

          const backgroundColorStyle =
            status === 'green' ? styles.greenBackground :
            status === 'red' ? styles.redBackground :
            styles.grayBackground;

          return (
            <View key={dateStr} style={styles.weekDayBox}>
              <View style={[styles.dayNumberWrapper, backgroundColorStyle]}>
                <Text style={styles.dayNumber}>{dayNumber}</Text>
              </View>
              <Text style={styles.emoji}>{day.emoji}</Text>
              <Text style={styles.dayLabel}>{day.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>{todayTotal} / {calorieGoal} kcal 🍓</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${(todayTotal / calorieGoal) * 100}%` }]} />
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#F49FB6' }]}
        onPress={() => router.push('/daily-entry')}>
        <Text style={styles.buttonText}>Günlük Veri Gir</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.buttonSmall, { backgroundColor: '#A0D8EF' }]}
          onPress={() => router.push('/calendar')}>
          <Text style={styles.buttonText}>Takvim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonSmall, { backgroundColor: '#FDD984' }]}
          onPress={() => router.push('./stats')}>
          <Text style={styles.buttonText}>İstatistik</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Motivation Message */}
      <Text style={styles.footer}>🍓 Küçük adımlar büyük değişimlere yol açar!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFF1F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8, // ← Yeni
    paddingLeft: 8,  // ← Yeni
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5B4B8A',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5B4B8A',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#A67DB8',
  },
  profileCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    marginLeft: 12, // ← Yeni
  },
  profileEmoji: {
    fontSize: 30,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  weekDayBox: {
    alignItems: 'center',
    width: 48,
  },
  dayNumberWrapper: {
    borderRadius: 10,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  emoji: {
    fontSize: 22,
    marginVertical: 2,
  },
  dayLabel: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  greenBackground: {
    backgroundColor: '#A0D995',
  },
  redBackground: {
    backgroundColor: '#F25C66',
  },
  grayBackground: {
    backgroundColor: '#D8D8D8',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressLabel: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7A5184',
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 16,
    backgroundColor: '#F2D5F7',
    borderRadius: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#B570C1',
    borderRadius: 8,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonSmall: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#E4572E',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  logoutText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 18,
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    color: '#A05A7C',
    fontSize: 16,
  },
  
});
