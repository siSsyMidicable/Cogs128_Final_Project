import { Stack } from 'expo-router';

/**
 * Stack navigator for the /transaction group.
 * Required by Expo Router — without this file, router.push('/transaction/history')
 * does nothing because there is no stack to push onto.
 *
 * headerShown: false on the root so each screen can render its own custom header.
 */
export default function TransactionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#d6d8d3' },
        animation: 'slide_from_right',
      }}
    />
  );
}
