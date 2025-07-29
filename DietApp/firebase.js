import { getFirestore } from 'firebase/firestore'; // Firestore kullanımı için (veri saklama)
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyB6i9fYoRwR4f9dPI86MJWgrRnQQ4FeT_I",
  authDomain: "dietapp-4fee6.firebaseapp.com",
  projectId: "dietapp-4fee6",
  storageBucket: "dietapp-4fee6.firebasestorage.app",
  messagingSenderId: "1050734437589",
  appId: "1:1050734437589:web:2cffe8019768292e572e5c",
  measurementId: "G-PGFPJGKXSY"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerine erişim
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app); // Firestore servisi

export { auth, db };
