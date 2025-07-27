import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export const options = {
  headerShown: false,
};

const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function HomeScreen() {
  const [profileImage, setProfileImage] = useState('🐶');
  const [userName, setUserName] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [dayStatus, setDayStatus] = useState<{ [date: string]: 'green' | 'red' }>({});
  const [todayTotal, setTodayTotal] = useState(0);

  const today = new Date().toISOString().split('T')[0];

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
        setProfileImage(data.image || '🐶');
        setCalorieGoal(Number(data.calorieGoal) || 2000);
      }

      const entries = entriesSnap.exists() ? entriesSnap.data() : {};
      const newStatus: { [key: string]: 'green' | 'red' } = {};

      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const daily = entries[dateStr] || [];
        const total = daily.reduce((sum: number, e: any) => sum + e.calories, 0);
        if (total > 0) {
          newStatus[dateStr] = total > calorieGoal ? 'red' : 'green';
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
    }, [])
  );

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/login');
  };

  const getWeekDates = () => {
    const dates: string[] = [];
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.homeTitle}>Home</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileEmoji}>{profileImage}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Hoş geldin {userName} 👋</Text>
      <Text style={styles.subtitle}>{todayTotal} / {calorieGoal} kalori</Text>

      <View style={styles.weekRow}>
        {getWeekDates().map((date, index) => (
          <View
            key={date}
            style={[
              styles.dayCircle,
              dayStatus[date] === 'green' && styles.green,
              dayStatus[date] === 'red' && styles.red,
              date === today && styles.todayHighlight,
            ]}
          >
            <Text style={styles.dayText}>{weekDays[index]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#5EBEC4' }]}
          onPress={() => router.push('/daily-entry')}
        >
          <Text style={styles.buttonText}>Günlük Veri Gir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#5EBE91' }]}
          onPress={() => router.push('/calendar')}
        >
          <Text style={styles.buttonText}>Takvim</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.smallButton}
        onPress={() => router.push('./stats')}
      >
        <Text style={styles.buttonText}>İstatistik</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  homeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f3f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    color: '#555',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: 4,
  },
  dayCircle: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  dayText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  green: {
    backgroundColor: '#5EBE91',
  },
  red: {
    backgroundColor: '#E4572E',
  },
  todayHighlight: {
    borderWidth: 2,
    borderColor: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  smallButton: {
    alignSelf: 'center',
    marginTop: 8,
    backgroundColor: '#E4B363',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 32,
    paddingVertical: 14,
    backgroundColor: '#E4572E',
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
