import React from "react";
import { Button as PaperButton } from "react-native-paper";

type Props = {
  label: string;
  mode?: "text" | "outlined" | "contained";
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function Button({
  label,
  mode = "text",
  onPress,
  disabled,
  loading,
}: Props) {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
    >
      {label}
    </PaperButton>
  );
}