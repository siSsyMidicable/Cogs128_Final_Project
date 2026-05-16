/**
 * /auth/register — New account screen
 * Same glass-teal aesthetic as the login screen.
 */
import React, { useState } from 'react';
import {
  Platform, Pressable, SafeAreaView, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [done,     setDone]     = useState(false);

  function submit() {
    setError(null);
    if (!name.trim())              return setError('Please enter your name.');
    if (!email.includes('@'))      return setError('Please enter a valid email.');
    if (password.length < 6)       return setError('Password must be at least 6 characters.');
    if (password !== confirm)      return setError('Passwords do not match.');
    // Mock success — no real backend call needed for demo
    setDone(true);
    setTimeout(() => router.replace('/auth/login'), 1800);
  }

  return (
    <SafeAreaView style={st.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={st.screen}>
        <View style={st.bg} />
        <View style={st.grid} />
        <View style={[st.glow, st.glowOut]} />
        <View style={[st.glow, st.glowIn]} />

        <ScrollView
          contentContainerStyle={st.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back link */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [st.backLink, pressed && { opacity: 0.65 }]}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
          >
            <Text style={st.backLinkText}>‹ Back to Sign In</Text>
          </Pressable>

          <View style={st.hero}>
            <Text style={st.title}>Skill Swap</Text>
            <Text style={st.subtitle}>Create an account</Text>
          </View>

          <View style={st.glassCard}>
            <View style={[st.cardGlow, st.cardGlowOne]} />
            <View style={[st.cardGlow, st.cardGlowTwo]} />

            <View style={st.cardInner}>
              <Text style={st.cardTitle}>Register</Text>
              <Text style={st.cardSub}>Join the community. Trade your skills.</Text>

              {error && (
                <View style={st.errBanner}>
                  <Text style={st.errText}>{error}</Text>
                </View>
              )}

              {done && (
                <View style={st.successBanner}>
                  <Text style={st.successText}>✓ Account created! Redirecting…</Text>
                </View>
              )}

              {/* Name */}
              <Field label="Full Name">
                <TextInput
                  style={st.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  autoCapitalize="words"
                  autoCorrect={false}
                  accessibilityLabel="Full name"
                />
              </Field>

              {/* Email */}
              <Field label="Email">
                <TextInput
                  style={st.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Email address"
                />
              </Field>

              {/* Password */}
              <Field label="Password">
                <View style={st.pwRow}>
                  <TextInput
                    style={[st.input, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min. 6 characters"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry={!showPw}
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="Password"
                  />
                  <Pressable
                    onPress={() => setShowPw(v => !v)}
                    style={st.eyeBtn}
                    accessibilityLabel={showPw ? 'Hide password' : 'Show password'}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={st.eyeText}>{showPw ? '🙈' : '👁'}</Text>
                  </Pressable>
                </View>
              </Field>

              {/* Confirm password */}
              <Field label="Confirm Password">
                <TextInput
                  style={st.input}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Re-enter password"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Confirm password"
                />
              </Field>

              {/* Submit */}
              <View style={st.btnWrap}>
                <View style={[st.btnGlow, st.btnGlowA]} />
                <View style={[st.btnGlow, st.btnGlowB]} />
                <View style={[st.btnGlow, st.btnGlowC]} />
                <Pressable
                  onPress={submit}
                  disabled={done}
                  style={({ pressed }) => [
                    st.primaryBtn,
                    pressed && st.primaryBtnPressed,
                    done  && st.primaryBtnDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Create account"
                >
                  <Text style={st.primaryBtnLabel}>Create Account</Text>
                  <Text style={st.primaryBtnArrow}>›</Text>
                </Pressable>
              </View>

              {/* Back to login */}
              <Pressable
                onPress={() => router.replace('/auth/login')}
                style={({ pressed }) => [{ opacity: pressed ? 0.65 : 1 }]}
                accessibilityRole="link"
                accessibilityLabel="Already have an account? Sign in"
              >
                <Text style={st.signinLink}>
                  Already have an account?{' '}
                  <Text style={st.signinLinkBold}>Sign In</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={st.fieldGroup}>
      <Text style={st.fieldLabel}>{label}</Text>
      <View style={st.inputWrapper}>{children}</View>
    </View>
  );
}

const st = StyleSheet.create({
  safeArea:         { flex: 1, backgroundColor: '#8FEBE5' },
  screen:           { flex: 1, position: 'relative', overflow: 'hidden' },
  bg:               { ...StyleSheet.absoluteFillObject, backgroundColor: '#7DE5E5' },
  grid:             { ...StyleSheet.absoluteFillObject, opacity: 0.12, backgroundColor: 'transparent', borderColor: 'rgba(0,0,0,0.2)', borderWidth: 0.5 },
  glow:             { position: 'absolute', borderRadius: 100, top: 40, alignSelf: 'center' },
  glowOut:          { width: 240, height: 90, backgroundColor: 'rgba(0,0,0,0.07)', transform: [{ scale: 1.4 }] },
  glowIn:           { width: 220, height: 80, backgroundColor: 'rgba(0,0,0,0.05)', transform: [{ scale: 1.2 }] },
  scroll:           { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, gap: 20 },
  backLink:         { alignSelf: 'flex-start' },
  backLinkText:     { fontSize: 14, fontWeight: '700', color: '#01696f' },
  hero:             { width: '100%', alignItems: 'center' },
  title:            { fontSize: 40, fontWeight: '800', color: '#000', marginBottom: 6 },
  subtitle:         { fontSize: 18, color: 'rgba(0,0,0,0.8)', textAlign: 'center' },
  glassCard:        { width: '100%', position: 'relative' },
  cardGlow:         { position: 'absolute', left: 0, right: 0, top: 2, bottom: -2, borderRadius: 16 },
  cardGlowOne:      { backgroundColor: 'rgba(255,255,255,0.22)', transform: [{ scale: 1.07 }] },
  cardGlowTwo:      { backgroundColor: 'rgba(255,255,255,0.15)', transform: [{ scale: 1.12 }] },
  cardInner:        { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 24, backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6, gap: 14 },
  cardTitle:        { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 2 },
  cardSub:          { fontSize: 14, color: 'rgba(0,0,0,0.78)', lineHeight: 20, marginBottom: 4 },
  errBanner:        { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(200,50,50,0.12)', borderWidth: 1, borderColor: 'rgba(200,50,50,0.3)' },
  errText:          { fontSize: 13, color: 'rgba(160,20,20,0.95)', fontWeight: '600', textAlign: 'center' },
  successBanner:    { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(67,122,34,0.15)', borderWidth: 1, borderColor: 'rgba(67,122,34,0.4)' },
  successText:      { fontSize: 13, color: '#437a22', fontWeight: '700', textAlign: 'center' },
  fieldGroup:       { gap: 5 },
  fieldLabel:       { fontSize: 13, fontWeight: '700', color: 'rgba(0,0,0,0.8)' },
  inputWrapper:     { borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 4 },
  pwRow:            { flexDirection: 'row', alignItems: 'center' },
  input:            { flex: 1, fontSize: 15, fontWeight: '500', color: '#000' },
  eyeBtn:           { paddingLeft: 8, paddingVertical: 4 },
  eyeText:          { fontSize: 16 },
  btnWrap:          { width: '100%', position: 'relative', marginTop: 4 },
  btnGlow:          { position: 'absolute', left: 8, right: 8, top: 4, bottom: -2, borderRadius: 10 },
  btnGlowA:         { backgroundColor: 'rgba(1,105,111,0.45)' },
  btnGlowB:         { backgroundColor: 'rgba(1,130,138,0.40)', transform: [{ scale: 1.03 }] },
  btnGlowC:         { backgroundColor: 'rgba(1,160,170,0.30)', transform: [{ scale: 1.06 }] },
  primaryBtn:       { borderRadius: 8, paddingVertical: 14, paddingHorizontal: 22, backgroundColor: '#2a8780', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  primaryBtnPressed:{ opacity: 0.88 },
  primaryBtnDisabled:{ opacity: 0.6 },
  primaryBtnLabel:  { fontSize: 18, color: '#fff', fontWeight: '800' },
  primaryBtnArrow:  { fontSize: 24, lineHeight: 24, fontWeight: '900', color: '#fff' },
  signinLink:       { fontSize: 14, color: 'rgba(0,0,0,0.65)', textAlign: 'center', marginTop: 4 },
  signinLinkBold:   { fontWeight: '800', color: '#01696f' },
});
