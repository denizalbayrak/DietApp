import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { auth } from '../../firebase';

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (!user) {
        router.replace('/login');
      } else {
        router.replace('/(tabs)/home'); // Ana sekmeye yönlendirme
      }
    });

    return unsubscribe;
  }, []);

  return null; // loading göstermek istersen buraya koyabilirsin
}
