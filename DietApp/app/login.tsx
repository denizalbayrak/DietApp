import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      router.replace('/home');
    }
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/home');
    } catch (error: any) {
      Alert.alert('Giriş Hatası', error.message || 'Bir şeyler yanlış gitti.');
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Uyarı', 'Lütfen e-posta adresinizi girin.');
      return;
    }

    try {
      setResetLoading(true);
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Başarılı', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Spam klasörünü de kontrol etmeyi unutmayın 💌');
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen geçerli bir e-posta adresi girin.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Giriş Yap</Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Text>{passwordVisible ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResetPassword}>
          <Text style={styles.forgotPassword}>Şifremi Unuttum?</Text>
        </TouchableOpacity>

        {resetLoading && (
          <Text style={styles.loadingText}>Gönderiliyor...</Text>
        )}

        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.linkText}>Hesabın yok mu? Kayıt ol</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#FFF1F7', 
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5B4B8A',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    height: 56,
    backgroundColor: '#fff',
    borderColor: '#E5C5E1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#E5C5E1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  passwordInput: {
    flex: 1,
    height: 56,
    fontSize: 16,
  },
  eyeIcon: {
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#F49FB6', 
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  forgotPassword: {
    color: '#7A5184',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
  },
  loadingText: {
    textAlign: 'center',
    color: '#A05A7C',
    marginBottom: 8,
    fontSize: 14,
  },
  linkText: {
    color: '#FDD984',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});