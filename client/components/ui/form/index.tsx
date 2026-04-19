import React from "react";
import { Controller } from "react-hook-form";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { TextInput } from "react-native-paper";

type Props = {
  control?: any;
  name?: string;
  label: string;
  errors?: string;
  secureTextEntry?: boolean;
  inputMode?: any;
  right?: React.ReactNode;
  left?: React.ReactNode;
  value?: string | number;
  editable?: boolean;
  onPress?: () => void;
  multiline?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function FormError({ messages }: { messages?: string }) {
  if (!messages) return null;
  return <Text style={styles.error}>{messages}</Text>;
}

function InputField({
  label,
  errors,
  secureTextEntry,
  inputMode,
  right,
  left,
  value,
  editable = true,
  onPress,
  multiline,
  containerStyle,
  onChangeText,
  onBlur,
}: Props & { onChangeText?: (value: string) => void; onBlur?: () => void }) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        label={label}
        value={value == null ? "" : String(value)}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={inputMode}
        right={right as any}
        left={left as any}
        editable={editable}
        onPressIn={onPress}
        multiline={multiline}
        mode="outlined"
      />
      <FormError messages={errors} />
    </View>
  );
}

export function FormInput({ control, name, ...rest }: Props) {
  if (!control || !name) {
    return <InputField {...rest} />;
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <InputField {...rest} value={value} onChangeText={onChange} onBlur={onBlur} />
      )}
    />
  );
}

export default FormInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  error: {
    color: "red",
    marginTop: 4,
    fontSize: 12,
  },
});
