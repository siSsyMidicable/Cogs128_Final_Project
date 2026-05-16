import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { loginInputSchema, useLogin } from "@/lib/auth/auth";
import { useDisclosure } from "@/hooks/use-disclosure";

const defaultValues =
  Platform.OS === "ios"
    ? { email: "user1@demo.com", password: "password" }
    : { email: "user2@demo.com", password: "password" };

export const LoginForm = () => {
  const { isOpen: passwordVisible, onToggle: togglePasswordVisibility } =
    useDisclosure(false);

  const login = useLogin();

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
    router.replace("/transaction");
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.screen}>
        <View style={styles.gradientBackground} />
        <View style={styles.gridOverlay} />

        {/* Matching hero glow blobs from intro */}
        <View style={[styles.heroGlow, styles.heroGlowOuter]} />
        <View style={[styles.heroGlow, styles.heroGlowInner]} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title — identical font/size to intro */}
          <View style={styles.hero}>
            <Text style={styles.title}>Skill Swap</Text>
            <Text style={styles.subtitle}>Welcome back</Text>
          </View>

          {/* Glass card — mirrors carousel card exactly */}
          <View style={styles.glassCard}>
            <View style={[styles.cardGlow, styles.cardGlowOne]} />
            <View style={[styles.cardGlow, styles.cardGlowTwo]} />

            <View style={styles.cardInner}>
              <Text style={styles.cardTitle}>Sign In</Text>
              <Text style={styles.cardSubtitle}>
                Enter your email and password to continue.
              </Text>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={[
                        styles.inputWrapper,
                        errors.email ? styles.inputWrapperError : null,
                      ]}
                    >
                      <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="you@example.com"
                        placeholderTextColor="rgba(0,0,0,0.35)"
                        inputMode="email"
                        autoCapitalize="none"
                        autoCorrect={false}
                        accessibilityLabel="Email address"
                      />
                    </View>
                  )}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Password</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={[
                        styles.inputWrapper,
                        errors.password ? styles.inputWrapperError : null,
                      ]}
                    >
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="••••••••"
                        placeholderTextColor="rgba(0,0,0,0.35)"
                        secureTextEntry={!passwordVisible}
                        autoCapitalize="none"
                        autoCorrect={false}
                        accessibilityLabel="Password"
                      />
                      <Pressable
                        onPress={togglePasswordVisibility}
                        style={styles.eyeBtn}
                        accessibilityLabel={
                          passwordVisible ? "Hide password" : "Show password"
                        }
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={styles.eyeText}>
                          {passwordVisible ? "🙈" : "👁"}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                />
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Login button — same shape/glow as Get Started, keeps teal color */}
              <View style={styles.btnContainer}>
                <View style={[styles.btnGlow, styles.btnGlowA]} />
                <View style={[styles.btnGlow, styles.btnGlowB]} />
                <View style={[styles.btnGlow, styles.btnGlowC]} />
                <Pressable
                  onPress={onSubmit}
                  disabled={login.isPending}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && styles.primaryBtnPressed,
                    login.isPending && styles.primaryBtnDisabled,
                  ]}
                  accessibilityLabel="Log in to SkillSwap"
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryBtnLabel}>
                    {login.isPending ? "Signing in…" : "Login"}
                  </Text>
                  {!login.isPending && (
                    <Text style={styles.primaryBtnArrow}>›</Text>
                  )}
                </Pressable>
              </View>

              {/* Register link */}
              <Pressable
                onPress={() => router.replace("/auth/register")}
                style={({ pressed }) => [
                  styles.linkBtn,
                  pressed && styles.linkBtnPressed,
                ]}
                accessibilityLabel="Go to register screen"
                accessibilityRole="link"
              >
                <Text style={styles.linkText}>
                  Don't have an account?{" "}
                  <Text style={styles.linkTextBold}>Register</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#8FEBE5",
  },
  screen: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  // Exact same background as intro
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#7DE5E5",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
    backgroundColor: "transparent",
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 0.5,
  },
  heroGlow: {
    position: "absolute",
    borderRadius: 100,
    top: 40,
    alignSelf: "center",
  },
  heroGlowOuter: {
    width: 240,
    height: 90,
    backgroundColor: "rgba(0,0,0,0.07)",
    transform: [{ scale: 1.4 }],
  },
  heroGlowInner: {
    width: 220,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.05)",
    transform: [{ scale: 1.2 }],
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
    gap: 28,
  },
  // Identical to intro hero block
  hero: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(0,0,0,0.8)",
    textAlign: "center",
  },
  // Glass card — mirrors carousel card exactly
  glassCard: {
    width: "100%",
    position: "relative",
  },
  cardGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 2,
    bottom: -2,
    borderRadius: 16,
  },
  cardGlowOne: {
    backgroundColor: "rgba(255,255,255,0.22)",
    transform: [{ scale: 1.07 }],
  },
  cardGlowTwo: {
    backgroundColor: "rgba(255,255,255,0.15)",
    transform: [{ scale: 1.12 }],
  },
  cardInner: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "rgba(0,0,0,0.78)",
    lineHeight: 20,
    marginBottom: 4,
  },
  // Inputs — glass style matching card
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(0,0,0,0.8)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 4,
  },
  inputWrapperError: {
    borderColor: "rgba(200,50,50,0.5)",
    backgroundColor: "rgba(255,240,240,0.6)",
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  eyeBtn: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  eyeText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: "rgba(180,30,30,0.9)",
    fontWeight: "600",
    paddingLeft: 2,
  },
  // Login button — same shape/glow as Get Started, keeps teal color
  btnContainer: {
    width: "100%",
    position: "relative",
    marginTop: 4,
  },
  btnGlow: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 4,
    bottom: -2,
    borderRadius: 10,
  },
  btnGlowA: { backgroundColor: "rgba(1,105,111,0.45)" },
  btnGlowB: {
    backgroundColor: "rgba(1,130,138,0.40)",
    transform: [{ scale: 1.03 }],
  },
  btnGlowC: {
    backgroundColor: "rgba(1,160,170,0.30)",
    transform: [{ scale: 1.06 }],
  },
  primaryBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: "#2a8780",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnPressed: { opacity: 0.88 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnLabel: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "800",
  },
  primaryBtnArrow: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "900",
    color: "#fff",
  },
  // Register link
  linkBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  linkBtnPressed: { opacity: 0.7 },
  linkText: {
    fontSize: 14,
    color: "rgba(0,0,0,0.65)",
    fontWeight: "500",
  },
  linkTextBold: {
    fontWeight: "800",
    color: "#1d4b47",
  },
});

export default function LoginScreen() {
  return <LoginForm />;
}
