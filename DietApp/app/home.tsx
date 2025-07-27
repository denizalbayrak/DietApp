import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export const options = {
  headerShown: false,
};

const weekDays = ['🌞 Pzt', '☕ Sal', '🧘 Çar', '📚 Per', '🎉 Cum', '🎮 Cmt', '🌈 Paz'];

export default function HomeScreen() {
  const [profileImage, setProfileImage] = useState('🐶');
  const [userName, setUserName] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [dayStatus, setDayStatus] = useState<{ [date: string]: 'green' | 'red'| 'gray' }>({});
  const [todayTotal, setTodayTotal] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const getWeekDates = () => {
    const dates: string[] = [];
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Pazar'ı 7 yap
    const monday = new Date(now);
    monday.setDate(now.getDate() - (currentDay - 1));
  
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };
  useEffect(() => {
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
        const newStatus: { [key: string]: 'green' | 'red' | 'gray'} = {};

        const now = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - (6 - i));
          const dateStr = date.toISOString().split('T')[0];
          const daily = entries[dateStr] || [];
          const total = daily.reduce((sum: number, e: any) => sum + e.calories, 0);
          if (daily.length > 0) {
            newStatus[dateStr] = total > calorieGoal ? 'red' : 'green';
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

    fetchData();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/login');
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
  {
  getWeekDates().map((dateStr, index) => {
    const dateObj = new Date(dateStr);
    const dayNumber = dateObj.getDate();
    const isToday = dateStr === today;
    const status = dayStatus[dateStr];

    return (
      <View key={dateStr} style={styles.weekDayBox}>
        <View
          style={[
            styles.dayNumberWrapper,
            status === 'green' && styles.greenBackground,
            status === 'red' && styles.redBackground,
            status === 'gray' && styles.grayBackground,
          ]}
        >
          {isToday && <View style={styles.purpleDot} />}
          <Text style={styles.dayNumber}>{dayNumber}</Text>
        </View>
        <Text style={styles.dayLabel}>{weekDays[index].split(' ')[1]}</Text>
      </View>
    );
  })}
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
        style={styles.statsButton}
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
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  weekDayBox: {
    alignItems: 'center',
    width: 40,
  },
  dayNumberWrapper: {
    width: 36,
    height: 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  purpleDot: {
    position: 'absolute',
    top: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'purple',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
  },
  greenBackground: {
    backgroundColor: '#5EBE91',
  },
  redBackground: {
    backgroundColor: '#E4572E',
  },
  grayBackground: {
    backgroundColor: '#ccc',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  statsButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: 'center',
    backgroundColor: '#E4B363',
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
