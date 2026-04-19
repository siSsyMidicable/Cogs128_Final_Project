import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

type Btn = {
  label: string;
  mode?: 'text' | 'outlined' | 'contained';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function Buttons({ vertical, buttons, style }: { vertical?: boolean; buttons: Btn[]; style?: any }) {
  return (
    <View style={[vertical ? styles.vertical : styles.row, style]}>
      {buttons.map((b, i) => (
        <PaperButton
          key={i}
          mode={b.mode || 'text'}
          onPress={b.onPress}
          disabled={b.disabled}
          loading={b.loading}
          style={styles.button}
        >
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
