import { View, Text, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { useUser } from '@/lib/auth/auth';

export default function Home() {
  const { user } = useUser();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkillSwap</Text>
      <Text>Welcome{user?.name || ' Guest'}!</Text>
      {!user ? (
        <Link href="/auth/login" style={styles.button}>Login</Link>
      ) : (
        <>
          <Link href="/profile" style={styles.button}>Profile</Link>
          <Link href="/transaction" style={styles.button}>Transactions</Link>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#6200ee', color: 'white', padding: 12, margin: 8, borderRadius: 8 }
});
