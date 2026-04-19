import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

type Props = {
  children: React.ReactNode;
  contentContainerStyle?: any;
};

export default function KeyboardWrapper({
  children,
  contentContainerStyle,
}: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={contentContainerStyle}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}