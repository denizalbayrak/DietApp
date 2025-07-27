import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


  export default function RootLayout() {
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setLoading(false);
        if (!user) {
          router.replace('/login');
        } else {
          router.replace('/home');
        }
      });
    return unsubscribe;
  }, []);

  if (loading) return null;
  return <Stack />;
}
