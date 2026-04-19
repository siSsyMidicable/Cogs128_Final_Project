import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, ViewStyle } from 'react-native';

type Props = {
  children?: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
};

export default function KeyboardWrapper({ children, contentContainerStyle, style }: Props) {
  return (
    <KeyboardAvoidingView style={{ flex: 1, ...style }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
