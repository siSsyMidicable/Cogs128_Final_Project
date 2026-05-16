/**
 * /transaction  — SkillSwap hub screen
 * Full register-screen glass-teal aesthetic:
 *   • Logo pinned at top (not inside ScrollView)
 *   • Grid overlay + glow orbs
 *   • Glass-island tiles
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUser } from '@/lib/auth/auth';
import { MOCK_USERS } from '@/lib/matching/data';
import { getMatchingState } from '@/lib/matching/matching';

const C = {
  bg:          '#7DE5E5',
  bgDeep:      '#8FEBE5',
  glass:       'rgba(255,255,255,0.55)',
  glassBorder: 'rgba(255,255,255,0.45)',
  glowOne:     'rgba(255,255,255,0.22)',
  glowTwo:     'rgba(255,255,255,0.15)',
  black:       '#000000',
  blackMid:    'rgba(0,0,0,0.78)',
  blackSoft:   'rgba(0,0,0,0.55)',
  teal:        '#61d8cc',
  tealDark:    '#2a8780',
  orange:      '#FF8C42',
  shadow:      '#000',
};

function Island({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <View style={isl.outer}>
      <View style={isl.glow1} />
      <View style={isl.glow2} />
      <View style={[isl.inner, accent ? { borderColor: accent, borderWidth: 1.5 } : null]}>
        {children}
      </View>
    </View>
  );
}
const isl = StyleSheet.create({
  outer: { paddingVertical: 14, overflow: 'visible' },
  glow1: { position: 'absolute', left: 0, right: 0, top: 14, bottom: 14, borderRadius: 14, backgroundColor: C.glowOne, transform: [{ scale: 1.07 }] },
  glow2: { position: 'absolute', left: 0, right: 0, top: 14, bottom: 14, borderRadius: 14, backgroundColor: C.glowTwo, transform: [{ scale: 1.12 }] },
  inner: { borderRadius: 12, padding: 16, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder, shadowColor: C.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 14, elevation: 8 },
});

function TabTile({ emoji, label, sub, badge, accent, route }: {
  emoji: string; label: string; sub: string;
  badge?: number; accent: string; route: string;
}) {
  return (
    <Island accent={accent}>
      <Pressable
        onPress={() => router.push(route as any)}
        style={({ pressed }) => [{ opacity: pressed ? 0.82 : 1 }]}
        accessibilityRole="button" accessibilityLabel={label}
      >
        <View style={s.tileRow}>
          <Text style={s.tileEmoji}>{emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.tileLabel}>{label}</Text>
            <Text style={s.tileSub}>{sub}</Text>
          </View>
          {badge !== undefined && badge > 0 && (
            <View style={[s.badge, { backgroundColor: accent }]}>
              <Text style={s.badgeTxt}>{badge}</Text>
            </View>
          )}
          <Text style={[s.arrow, { color: accent }]}>›</Text>
        </View>
      </Pressable>
    </Island>
  );
}

export default function TransactionHub() {
  const { user } = useUser();
  const { requests, connections, completed } = getMatchingState();

  // incoming = people whose id is in requests (they asked YOU, so from MOCK_USERS perspective
  // requests holds the IDs you've interacted with — badge reflects pending outgoing requests
  // as a proxy for demo; connections = ongoing, completed = done)
  const incomingCount = MOCK_USERS.filter(u => requests.has(u.id)).length;
  const ongoingCount  = MOCK_USERS.filter(u => connections.has(u.id)).length;
  const outgoingCount = MOCK_USERS.filter(u => completed.has(u.id)).length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Full-bleed background layers */}
      <View style={s.bgLayer} />
      <View style={s.grid} />

      {/* Glow orbs — same as register/login/intro */}
      <View style={[s.glow, s.glowOut]} />
      <View style={[s.glow, s.glowIn]} />

      {/* Pinned logo — stays locked while tiles scroll */}
      <View style={s.heroLocked}>
        <Text style={s.title}>Skill Swap</Text>
        <Text style={s.subtitle}>
          {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Your swaps'}
        </Text>
      </View>

      {/* Scrollable tile list */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TabTile
          emoji="📥" label="Incoming Requests"
          sub="People who want to swap with you"
          badge={incomingCount} accent={C.teal}
          route="/transaction/incoming"
        />
        <TabTile
          emoji="🔄" label="Ongoing Swaps"
          sub="Active exchanges in progress"
          badge={ongoingCount} accent={C.orange}
          route="/transaction/ongoing"
        />
        <TabTile
          emoji="✅" label="Completed Swaps"
          sub="Finished exchanges & history"
          badge={outgoingCount} accent={C.tealDark}
          route="/transaction/outgoing"
        />

        <Island>
          <Pressable
            onPress={() => router.push('/matching')}
            style={({ pressed }) => [s.findBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button" accessibilityLabel="Find skills to trade"
          >
            <Text style={s.findBtnTxt}>🔍  Find Skills to Trade</Text>
          </Pressable>
        </Island>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bgDeep },
  bgLayer:    { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg },
  grid:       { ...StyleSheet.absoluteFillObject, opacity: 0.10, borderColor: 'rgba(0,0,0,0.2)', borderWidth: 0.5 },
  glow:       { position: 'absolute', borderRadius: 100, top: 52, alignSelf: 'center' },
  glowOut:    { width: 280, height: 100, backgroundColor: 'rgba(0,0,0,0.06)', transform: [{ scale: 1.4 }] },
  glowIn:     { width: 240, height: 80,  backgroundColor: 'rgba(0,0,0,0.04)', transform: [{ scale: 1.2 }] },
  heroLocked: { width: '100%', alignItems: 'center', paddingTop: 14, paddingBottom: 4, zIndex: 1 },
  title:      { fontSize: 40, fontWeight: '800', color: C.black, marginBottom: 6 },
  subtitle:   { fontSize: 17, color: 'rgba(0,0,0,0.78)', textAlign: 'center' },
  scroll:     { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  tileRow:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tileEmoji:  { fontSize: 28 },
  tileLabel:  { fontSize: 17, fontWeight: '800', color: C.black, marginBottom: 2 },
  tileSub:    { fontSize: 13, color: C.blackSoft },
  badge:      { minWidth: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeTxt:   { fontSize: 12, fontWeight: '900', color: C.black },
  arrow:      { fontSize: 28, fontWeight: '900', lineHeight: 32 },
  findBtn:    { borderRadius: 8, paddingVertical: 14, backgroundColor: C.tealDark, alignItems: 'center' },
  findBtnTxt: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
