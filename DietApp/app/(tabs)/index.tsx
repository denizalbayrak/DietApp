import { View, Text, StyleSheet } from 'react-native';

export default function CustomHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş geldin Deniz! 🧁</Text>
      <Text style={styles.text}>Artık kendi ekranın burada 🎉</Text>
    </View>
  );
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
