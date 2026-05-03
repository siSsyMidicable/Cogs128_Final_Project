import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
      <Stack.Screen name="auth/register" options={{ title: 'Register' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="profile/update" options={{ title: 'Update Profile' }} />
      <Stack.Screen name="transaction/create-payment" options={{ title: 'Create Payment' }} />
      <Stack.Screen name="transaction/create" options={{ title: 'Create Transaction' }} />
      <Stack.Screen name="transaction/incoming" options={{ title: 'Incoming Transactions' }} />
      <Stack.Screen name="transaction/ongoing" options={{ title: 'Ongoing Transactions' }} />
      <Stack.Screen name="transaction/outgoing" options={{ title: 'Outgoing Transactions' }} />
      <Stack.Screen name="transaction/history" options={{ title: 'Transaction History' }} />
    </Stack>
  );
}
