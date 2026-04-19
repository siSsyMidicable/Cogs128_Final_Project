import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function TransactionHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <Link href="/transaction/incoming" asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Incoming</Text></Pressable>
      </Link>
      <Link href="/transaction/ongoing" asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Ongoing</Text></Pressable>
      </Link>
      <Link href="/transaction/outgoing" asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Outgoing</Text></Pressable>
      </Link>
      <Link href="/transaction/history" asChild>
        <Pressable style={styles.button}><Text style={styles.buttonText}>History</Text></Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 16 },
  button: { backgroundColor: '#6d28d9', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16 },
});
