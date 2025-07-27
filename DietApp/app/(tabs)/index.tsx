import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Slot } from 'expo-router';
export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (!user) {
        router.replace('/login');
      } else {
        router.replace('/home'); // veya hangi sayfaya gitmesini istiyorsan
      }
    });

    return unsubscribe;
  }, []);

  if (loading) return null;

  return <Slot />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    marginTop: 10,
  },
});
