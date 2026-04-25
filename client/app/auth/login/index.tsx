import React from "react";
import { useForm } from "react-hook-form";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Button as PaperButton, TextInput } from "react-native-paper";

import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";

import KeyboardWrapper from "@/components/screens/keyboard-wrapper";
import { useDisclosure } from "@/hooks/use-disclosure";
import { loginInputSchema, useLogin } from "@/lib/auth/auth";
import FormInput from "@/components/ui/form";

const dominos = ["Web Dev", "Linux Admin", "Graphic Design"];

export const LoginForm = () => {
  const { isOpen: passwordVisible, onToggle: togglePasswordVisibility } =
    useDisclosure(false);

  const login = useLogin();

  const defaultValues =
    Platform.OS === "ios"
      ? { email: "user1@demo.com", password: "password" }
      : { email: "user2@demo.com", password: "password" };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({
    resolver: zodResolver(loginInputSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = handleSubmit(async (values) => {
    await login.mutate(values);
    router.replace("/");
  });

  return (
    <View style={styles.screen}>
      <View style={styles.backgroundGlow} />

      <KeyboardWrapper contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.headerEyebrow}>SKILLSWAP</Text>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>
            Sign in to continue your swaps.
          </Text>
        </View>

        <View style={styles.dominoStack}>
          {dominos.map((item, index) => (
            <View
              key={item}
              style={[
                styles.dominoCard,
                {
                  marginTop: index === 0 ? 0 : -10,
                  marginLeft: index * 8,
                },
              ]}
            >
              <Text style={styles.dominoText}>{item}</Text>
              <View style={styles.dominoShadowEdge} />
            </View>
          ))}
        </View>

        <View style={styles.formCard}>
          <FormInput
            control={control}
            label="Email"
            name="email"
            errors={errors.email?.message}
            inputMode="email"
          />

          <FormInput
            control={control}
            label="Password"
            name="password"
            errors={errors.password?.message}
            secureTextEntry={!passwordVisible}
            right={
              <TextInput.Icon
                icon={passwordVisible ? "eye" : "eye-off"}
                onPress={togglePasswordVisibility}
              />
            }
          />

          <View style={styles.buttons}>
            <PaperButton
              mode="contained"
              onPress={onSubmit}
              disabled={login.isPending}
              loading={login.isPending}
              contentStyle={styles.primaryButtonContent}
              style={styles.primaryButton}
              theme={{ roundness: 0 }}
            >
              Login
            </PaperButton>

            <PaperButton
              mode="text"
              onPress={() => router.replace("/auth/register")}
              contentStyle={styles.secondaryButtonContent}
              labelStyle={styles.secondaryButtonLabel}
              theme={{ roundness: 0 }}
            >
              Don't have an account? Register
            </PaperButton>
          </View>
        </View>
      </KeyboardWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#d6d8d3",
  },
  backgroundGlow: {
    position: "absolute",
    right: -120,
    top: -60,
    width: 280,
    height: 280,
    backgroundColor: "#8ce6db",
    opacity: 0.25,
    transform: [{ rotate: "18deg" }],
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    gap: 14,
  },
  headerCard: {
    backgroundColor: "#ececea",
    borderWidth: 2,
    borderColor: "#2f3333",
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  headerEyebrow: {
    fontSize: 12,
    color: "#434948",
    letterSpacing: 1.2,
    marginBottom: 4,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#101414",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#394140",
  },
  dominoStack: {
    marginTop: 2,
    marginBottom: 10,
  },
  dominoCard: {
    backgroundColor: "#61d8cc",
    borderWidth: 2,
    borderColor: "#1f4642",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dominoText: {
    color: "#102726",
    fontSize: 18,
    fontWeight: "700",
  },
  dominoShadowEdge: {
    position: "absolute",
    right: -8,
    bottom: -8,
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: "#2d7470",
    zIndex: -1,
  },
  formCard: {
    backgroundColor: "#f3f4f1",
    borderWidth: 2,
    borderColor: "#2f3333",
    padding: 14,
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttons: {
    paddingTop: 6,
    gap: 4,
  },
  primaryButton: {
    backgroundColor: "#2a8780",
    borderWidth: 2,
    borderColor: "#204f4b",
  },
  primaryButtonContent: {
    height: 48,
  },
  secondaryButtonContent: {
    height: 44,
  },
  secondaryButtonLabel: {
    color: "#1d4b47",
    fontWeight: "700",
  },
});

export default function LoginScreen() {
  return <LoginForm />;
}
