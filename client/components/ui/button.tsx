import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Button as PaperButton } from "react-native-paper";

type ButtonMode = "text" | "outlined" | "contained" | "contained-tonal";

type ButtonConfig = {
  label: string;
  mode?: ButtonMode;
  icon?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

type ButtonProps = ButtonConfig;

type ButtonsProps = {
  buttons: ButtonConfig[];
  vertical?: boolean;
  variant?: "default" | "bottom";
  style?: ViewStyle | ViewStyle[];
};

export default function Button({
  label,
  mode = "text",
  onPress,
  disabled,
  loading,
  icon,
}: ButtonProps) {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon={icon}
    >
      {label}
    </PaperButton>
  );
}

export function Buttons({ buttons, vertical = false, variant = "default", style }: ButtonsProps) {
  return (
    <View style={[styles.group, vertical ? styles.vertical : styles.horizontal, variant === "bottom" ? styles.bottom : null, style]}>
      {buttons.map((button, index) => (
        <View key={`${button.label}-${index}`} style={vertical ? undefined : styles.item}>
          <Button {...button} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  vertical: {
    flexDirection: "column",
  },
  item: {
    flex: 1,
  },
  bottom: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
});
