#!/usr/bin/env bash
set -e

base="$(pwd)"
echo "Creating placeholder files in $base (only where missing)"

mkdir -p components/screens components/ui/avatar components/ui/list components/ui/dialog components/ui/button components/ui/form hooks lib/auth lib features placeholder utils types

# components/screens
if [ ! -f components/screens/index.tsx ]; then
cat > components/screens/index.tsx <<'TS'
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, ViewStyle } from 'react-native';

type Props = {
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export function KeyboardWrapper({ children, contentContainerStyle, style }: Props) {
  return (
    <KeyboardAvoidingView style={[{ flex: 1 }, style]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={contentContainerStyle || { flexGrow: 1 }}>{children}</ScrollView>
    </KeyboardAvoidingView>
  );
}
TS
fi

if [ ! -f components/screens/loading-state.tsx ]; then
cat > components/screens/loading-state.tsx <<'TS'
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export const LoadingStateScreen = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" />
  </View>
);

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
TS
fi

if [ ! -f components/screens/empty-state.tsx ]; then
cat > components/screens/empty-state.tsx <<'TS'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const EmptyStateScreen = ({ message = 'No data' }: any) => (
  <View style={styles.container}>
    <Text>{message}</Text>
  </View>
);

const styles = StyleSheet.create({ container: { padding: 16, alignItems: 'center' } });
TS
fi

# components/ui/button
if [ ! -f components/ui/button/index.tsx ]; then
cat > components/ui/button/index.tsx <<'TS'
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

type Btn = { label: string; mode?: 'text' | 'outlined' | 'contained'; onPress?: () => void; disabled?: boolean; loading?: boolean };

export function Buttons({ vertical, buttons, style }: { vertical?: boolean; buttons: Btn[]; style?: any }) {
  return (
    <View style={[vertical ? styles.vertical : styles.row, style]}>
      {buttons.map((b, i) => (
        <PaperButton key={i} mode={b.mode || 'text'} onPress={b.onPress} disabled={b.disabled} loading={b.loading} style={styles.button}>
          {b.label}
        </PaperButton>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  vertical: { flexDirection: 'column' },
  row: { flexDirection: 'row' },
  button: { marginVertical: 6 },
});
TS
fi

# components/ui/form
if [ ! -f components/ui/form/index.tsx ]; then
cat > components/ui/form/index.tsx <<'TS'
import React from 'react';
import { Controller } from 'react-hook-form';
import { TextInput } from 'react-native-paper';
import { View, Text, StyleSheet } from 'react-native';

export function FormInput({ control, name, label, errors, secureTextEntry, inputMode, right }: any) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.container}>
          <TextInput label={label} value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry={secureTextEntry} keyboardType={inputMode} right={right} mode="outlined" />
          {errors ? <Text style={styles.error}>{errors}</Text> : null}
        </View>
      )}
    />
  );
}

export const FormError = ({ children }: any) => <Text style={styles.error}>{children}</Text>;

const styles = StyleSheet.create({ container: { marginBottom: 8 }, error: { color: 'red', marginTop: 4 } });
TS
fi

# components/ui/list
if [ ! -f components/ui/list/index.tsx ]; then
cat > components/ui/list/index.tsx <<'TS'
import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';

export const AppList = ({ data = [], renderItem, keyExtractor }: any) => {
  if (!renderItem) {
    return (
      <View style={styles.empty}>
        <Text>No items</Text>
      </View>
    );
  }
  return <FlatList data={data} renderItem={renderItem} keyExtractor={keyExtractor || ((item: any, i: number) => String(i))} />;
};

const styles = StyleSheet.create({ empty: { padding: 16, alignItems: 'center' } });
TS
fi

# components/ui/dialog
if [ ! -f components/ui/dialog/index.tsx ]; then
cat > components/ui/dialog/index.tsx <<'TS'
import React, { useState, useCallback } from 'react';
import { Portal, Dialog, Button, Paragraph } from 'react-native-paper';

export const AppDialog = ({ visible, onDismiss, title, content, actions = [] }: any) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss}>
      {title ? <Dialog.Title>{title}</Dialog.Title> : null}
      {content ? <Dialog.Content><Paragraph>{content}</Paragraph></Dialog.Content> : null}
      <Dialog.Actions>{actions.map((a: any, i: number) => <Button key={i} onPress={a.onPress}>{a.label}</Button>)}</Dialog.Actions>
    </Dialog>
  </Portal>
);

export function useConfirmationDialog() {
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  return { visible, open, close };
}

export function useStatusDialog() {
  const [visible, setVisible] = useState(false);
  return { visible, open: () => setVisible(true), close: () => setVisible(false) };
}
TS
fi

# components/ui/avatar
if [ ! -f components/ui/avatar/index.tsx ]; then
cat > components/ui/avatar/index.tsx <<'TS'
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export const AppAvatar = ({ uri, size = 48 }: any) => <Image source={uri ? { uri } : undefined as any} style={{ width: size, height: size, borderRadius: size / 2 }} />;

export const AvatarWithName = ({ name, uri, size = 48 }: any) => (
  <View style={styles.row}>
    <AppAvatar uri={uri} size={size} />
    <Text style={styles.name}>{name}</Text>
  </View>
);

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 8 }, name: { marginLeft: 8 } });
TS
fi

# small UI helpers
if [ ! -f components/ui/spacer.tsx ]; then
cat > components/ui/spacer.tsx <<'TS'
import React from 'react';
import { View } from 'react-native';

export const Spacer = ({ size = 8 }: any) => <View style={{ height: size, width: size }} />;
TS
fi

if [ ! -f components/ui/text-with-icon.tsx ]; then
cat > components/ui/text-with-icon.tsx <<'TS'
import React from 'react';
import { View, Text } from 'react-native';

export const TextWithIcon = ({ text, icon }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    {icon}
    <Text style={{ marginLeft: 8 }}>{text}</Text>
  </View>
);
TS
fi

if [ ! -f components/ui/rating-stars.tsx ]; then
cat > components/ui/rating-stars.tsx <<'TS'
import React from 'react';
import { Text } from 'react-native';

export const RatingStars = ({ rating = 0 }: any) => <Text>{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</Text>;
TS
fi

# components/ui index (re-export)
cat > components/ui/index.ts <<'TS'
export { AppList } from './list';
export { AppDialog, useConfirmationDialog, useStatusDialog } from './dialog';
export { Buttons } from './button';
export { FormInput, FormError } from './form';
export { AppAvatar, AvatarWithName } from './avatar';
export { Spacer } from './spacer';
export { TextWithIcon } from './text-with-icon';
export { RatingStars } from './rating-stars';
TS

# hooks placeholders
if [ ! -f hooks/use-debounce.ts ]; then
cat > hooks/use-debounce.ts <<'TS'
import { useRef } from 'react';
export function useDebounce(fn: any, delay = 300) {
  const t = useRef<any>();
  return (...args: any[]) => {
    clearTimeout(t.current);
    t.current = setTimeout(() => fn(...args), delay);
  };
}
TS
fi

if [ ! -f hooks/use-refresh-by-user.ts ]; then
cat > hooks/use-refresh-by-user.ts <<'TS'
export function useRefreshByUser() {
  return { refreshing: false, refresh: () => {} };
}
TS
fi

if [ ! -f hooks/use-stream-chat.ts ]; then
cat > hooks/use-stream-chat.ts <<'TS'
export function useStreamChat() { return { client: null }; }
TS
fi

# lib/auth (basic auth hooks and schemas)
if [ ! -f lib/auth/auth.ts ]; then
cat > lib/auth/auth.ts <<'TS'
import { z } from 'zod';
import { useCallback, useState } from 'react';

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
});

export const useLogin = () => {
  const [isPending, setIsPending] = useState(false);
  const mutate = useCallback(async (values: any) => {
    setIsPending(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      return { ok: true };
    } finally {
      setIsPending(false);
    }
  }, []);
  return { mutate, isPending };
};

export const useRegister = () => {
  const [isPending, setIsPending] = useState(false);
  const mutate = useCallback(async (values: any) => {
    setIsPending(true);
    try { await new Promise((r) => setTimeout(r, 700)); return { ok: true }; } finally { setIsPending(false); }
  }, []);
  return { mutate, isPending };
};

export const useUser = () => {
  return { user: null, isLoading: false };
};

export const useLogout = () => {
  return () => {};
};
TS
fi

# lib/react-native-paper
if [ ! -f lib/react-native-paper.ts ]; then
cat > lib/react-native-paper.ts <<'TS'
export function useAppTheme() {
  return { colors: { primary: '#6200ee', background: '#fff', text: '#000' } };
}
TS
fi

# lib/image-picker
if [ ! -f lib/image-picker.ts ]; then
cat > lib/image-picker.ts <<'TS'
export async function getImagePickerPermission() { return true; }
export async function getImagePickerResult() { return null; }
export function getImagePickerFile() { return null; }
TS
fi

# types/api placeholder
if [ ! -f types/api.ts ]; then
cat > types/api.ts <<'TS'
export type Media = any;
export type Transaction = any;
export enum TransactionStatus { Pending = 'pending', Completed = 'completed' }
TS
fi

# utils helpers
if [ ! -f utils/format.ts ]; then
cat > utils/format.ts <<'TS'
export function formatDate(d: any) { return String(d); }
export function formatDateTime(d: any) { return String(d); }
export function formatInvoiceItems(items: any[]) { return items || []; }
export function formatStripSuffix(s: string) { return s; }
export function formatEllipses(s: string, n = 10) { return s?.length > n ? s.slice(0, n) + '...' : s; }
export function formatSentenceCase(s: string) { return s; }
TS
fi

if [ ! -f utils/form.ts ]; then
cat > utils/form.ts <<'TS'
export function filterEmptyValues(obj: any) {
  const out: any = {};
  for (const k in obj) { if (obj[k] !== null && obj[k] !== undefined && obj[k] !== '') out[k] = obj[k]; }
  return out;
}
TS
fi

echo "Placeholders created. Now run: npx expo start -c"
