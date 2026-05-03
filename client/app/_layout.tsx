import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { ToastProvider } from '@/components/ui/toast';

export default function Layout() {
  return (
    <PaperProvider>
      <View style={s.root}>
        <Stack screenOptions={{ headerShown: false }} />
        {/* Global toast overlay — sits above all screens */}
        <ToastProvider />
      </View>
    </PaperProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
});