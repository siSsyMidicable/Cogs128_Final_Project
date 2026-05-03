import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Atelier } from '@/lib/atelier/theme';

/**
 * Atelier home — makes the conceptual model explicit before any controls
 * (Norman: system image / user model alignment).
 */
export default function AtelierHomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Design preview · branch only</Text>
        <Text style={styles.h1}>Atelier</Text>
        <Text style={styles.lead}>
          A quieter workshop for skill trades: you offer something, find someone who fits, then agree
          in plain language.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How it works</Text>
          <View style={styles.step}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
            <View style={styles.stepBody}>
              <Text style={styles.stepHead}>Say what you teach</Text>
              <Text style={styles.stepDesc}>Your offers are signifiers — others know what to ask for.</Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
            <View style={styles.stepBody}>
              <Text style={styles.stepHead}>Browse people, not noise</Text>
              <Text style={styles.stepDesc}>One list, clear match signal, details on demand (progressive disclosure).</Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
            <View style={styles.stepBody}>
              <Text style={styles.stepHead}>Request, accept, record</Text>
              <Text style={styles.stepDesc}>Feedback after each step — you always know what happened (Norman).</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardMuted}>
          <Text style={styles.cardTitle}>Principles baked in</Text>
          <Text style={styles.bullet}>• Discoverability: tabs map to Home → People → Inbox.</Text>
          <Text style={styles.bullet}>• Constraints: you can’t double-send; states are labeled.</Text>
          <Text style={styles.bullet}>• Evaluation-ready: flows mirror Sharp et al. task structure.</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
          onPress={() => router.push('/atelier/people')}
          accessibilityLabel="Open people directory"
        >
          <Text style={styles.primaryLabel}>See who’s here</Text>
        </Pressable>

        <Pressable
          style={styles.ghost}
          onPress={() => router.replace('/auth/login')}
          accessibilityLabel="Open original sign-in flow"
        >
          <Text style={styles.ghostLabel}>Use original app sign-in</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Atelier.canvas },
  scroll: { padding: Atelier.space.lg, paddingBottom: Atelier.space.xl * 2 },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Atelier.sage,
    textTransform: 'uppercase',
    marginBottom: Atelier.space.sm,
  },
  h1: {
    fontSize: 40,
    fontWeight: '700',
    color: Atelier.ink,
    letterSpacing: -1,
    marginBottom: Atelier.space.sm,
  },
  lead: {
    fontSize: 17,
    lineHeight: 26,
    color: Atelier.inkSecondary,
    marginBottom: Atelier.space.lg,
  },
  card: {
    backgroundColor: Atelier.paper,
    borderRadius: Atelier.radiusLg,
    padding: Atelier.space.lg,
    marginBottom: Atelier.space.md,
    borderWidth: 1,
    borderColor: Atelier.rule,
    ...Atelier.shadow.card,
  },
  cardMuted: {
    backgroundColor: Atelier.paperMuted,
    borderRadius: Atelier.radiusLg,
    padding: Atelier.space.lg,
    marginBottom: Atelier.space.lg,
    borderWidth: 1,
    borderColor: Atelier.rule,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Atelier.ink,
    marginBottom: Atelier.space.md,
    letterSpacing: 0.3,
  },
  step: { flexDirection: 'row', gap: 14, marginBottom: Atelier.space.md },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Atelier.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontWeight: '800', color: Atelier.accent, fontSize: 14 },
  stepBody: { flex: 1 },
  stepHead: { fontSize: 16, fontWeight: '700', color: Atelier.ink, marginBottom: 4 },
  stepDesc: { fontSize: 14, color: Atelier.inkSecondary, lineHeight: 20 },
  bullet: { fontSize: 14, color: Atelier.inkSecondary, lineHeight: 22, marginBottom: 6 },
  primary: {
    backgroundColor: Atelier.accent,
    paddingVertical: 16,
    borderRadius: Atelier.radiusMd,
    alignItems: 'center',
    marginBottom: Atelier.space.md,
  },
  primaryPressed: { opacity: 0.9 },
  primaryLabel: { color: Atelier.paper, fontSize: 16, fontWeight: '700' },
  ghost: { paddingVertical: 12, alignItems: 'center' },
  ghostLabel: { fontSize: 15, fontWeight: '600', color: Atelier.sage },
});
