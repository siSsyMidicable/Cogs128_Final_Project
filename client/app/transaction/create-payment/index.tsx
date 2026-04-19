import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Divider } from 'react-native-paper';

// Stripe import DISABLED - Expo Go shim
const useStripe = () => ({
  initPaymentSheet: async () => ({ error: null }),
  presentPaymentSheet: async () => ({ error: null }),
  confirmPayment: async () => ({ error: null }),
});

import { Buttons } from '@/components/ui/button';
import { useConfirmationDialog } from '@/components/ui/dialog';
import { FormInput } from '@/components/ui/form';
import { useUser } from '@/lib/auth/auth';

export default function CreatePayment() {
  const { user } = useUser();
  return (
    <ScrollView style={styles.container}>
      <Text>Payment Screen (Stripe shimmed for Expo Go)</Text>
      <Buttons buttons={[{ label: 'Fake Pay', onPress: () => alert('Payment stub') }]} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
