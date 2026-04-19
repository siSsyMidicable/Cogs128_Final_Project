import React from "react";
import { useForm } from "react-hook-form";
import { Platform, StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";

import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";

import KeyboardWrapper from "@/components/screens/keyboard-wrapper";
import Button from "@/components/ui/button";
import { useDisclosure } from "@/hooks/use-disclosure";
import { loginInputSchema, useLogin } from "@/lib/auth/auth";
import FormInput from "@/components/ui/form";
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

  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <>
      <KeyboardWrapper contentContainerStyle={styles.form}>
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
      </KeyboardWrapper>

      <View style={styles.buttons}>
        <Button
          label="Login"
          mode="contained"
          onPress={onSubmit}
          disabled={login.isPending}
          loading={login.isPending}
        />

        <Button
          label="Don't have an account? Register"
          mode="text"
          onPress={() => router.replace("/auth/register")}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 16,
    padding: 16,
  },
  buttons: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});

export default function LoginScreen() {
  return <LoginForm />;
}
