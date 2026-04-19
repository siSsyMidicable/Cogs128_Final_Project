import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Invoice = ({ invoice = {} }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoice</Text>
      <Text>Id: {invoice.id ?? '—'}</Text>
      <Text>Amount: {invoice.amount ?? '—'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: '#fff' },
  title: { fontWeight: '700', marginBottom: 8 },
});

export default Invoice;
