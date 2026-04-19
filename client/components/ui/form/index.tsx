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
          <TextInput
            label={label}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={secureTextEntry}
            keyboardType={inputMode}
            right={right}
            mode="outlined"
          />
          {errors ? <Text style={styles.error}>{errors}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  error: { color: 'red', marginTop: 4 },
});
