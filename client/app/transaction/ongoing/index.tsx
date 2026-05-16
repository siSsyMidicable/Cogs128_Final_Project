/**
 * /transaction/ongoing
 * Active swaps — Jasmine and Kevin are already connected.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { MOCK_USERS, ACTIVE_SWAPS } from '@/lib/matching/data';
import { getState } from '@/lib/matching/matching';

const C = {
  bg: '#7DE5E5', bgDeep: '#8FEBE5',
  glass: 'rgba(255,255,255,0.55)', glassBorder: 'rgba(255,255,255,0.45)',
  glowOne: 'rgba(255,255,255,0.22)', glowTwo: 'rgba(255,255,255,0.15)',
  black: '#000', blackMid: 'rgba(0,0,0,0.78)', blackSoft: 'rgba(0,0,0,0.55)',
  teal: '#61d8cc', tealDark: '#2a8780',
  orange: '#FF8C42', gold: '#FFD166', shadow: '#000',
  track: 'rgba(0,0,0,0.10)',
};

function Island({ children }: { children: React.ReactNode }) {
  return (
    <View style={isl.outer}>
      <View style={isl.glowOne} />
      <View style={isl.glowTwo} />
      <View style={isl.inner}>{children}</View>
    </View>
  );
}
const isl = StyleSheet.create({
  outer:   { paddingVertical: 14, overflow: 'visible' },
  glowOne: { position: 'absolute', left: 0, right: 0, top: 14, bottom: 14, borderRadius: 14, backgroundColor: C.glowOne, transform: [{ scale: 1.07 }] },
  glowTwo: { position: 'absolute', left: 0, right: 0, top: 14, bottom: 14, borderRadius: 14, backgroundColor: C.glowTwo, transform: [{ scale: 1.12 }] },
  inner:   { borderRadius: 12, padding: 16, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder, shadowColor: C.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 14, elevation: 8 },
});

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={C.black} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function daysLeft(isoDate: string) {
  const ms = new Date(isoDate).getTime() - Date.now();
  const d  = Math.ceil(ms / 86_400_000);
  if (d < 0)  return { label: `${Math.abs(d)}d overdue`, color: '#EF767A' };
  if (d === 0) return { label: 'Due today!',             color: C.orange };
  return         { label: `${d}d left`,                  color: d <= 3 ? C.orange : C.teal };
}

export default function OngoingScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const active = MOCK_USERS
    .filter(u => getState(u.id) === 'connected')
    .map(u => ({
      user: u,
      meta: ACTIVE_SWAPS.find(m => m.userId === u.id),
    }));

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.bgLayer} />

      {/* Nav */}
      <View style={s.nav}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [s.backPill, pressed && { opacity: 0.75 }]} accessibilityLabel="Go back" accessibilityRole="button">
          <BackIcon />
          <Text style={s.backText}>Back</Text>
        </Pressable>
        <Text style={s.navTitle}>Ongoing</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {active.length === 0 ? (
          <Island>
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>🔄</Text>
              <Text style={s.emptyTitle}>No active swaps</Text>
              <Text style={s.emptySub}>Accept an incoming request to start a swap.</Text>
            </View>
          </Island>
        ) : active.map(({ user, meta }) => {
          const dl = meta ? daysLeft(meta.deadlineIso) : null;
          const isOpen = expanded === user.id;
          return (
            <Island key={user.id}>
              {/* Header */}
              <View style={s.cardHeader}>
                <View style={s.avatar}>
                  <Text style={s.avatarEmoji}>{user.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.userName}>{user.name}</Text>
                  {meta && <Text style={s.swapLine}>{meta.youGive} ⇄ {meta.theyGive}</Text>}
                </View>
                {dl && (
                  <View style={[s.deadlineBadge, { backgroundColor: dl.color + '22', borderColor: dl.color }]}>
                    <Text style={[s.deadlineText, { color: dl.color }]}>{dl.label}</Text>
                  </View>
                )}
              </View>

              {/* Scope */}
              {meta && (
                <View style={s.scopeBox}>
                  <Text style={s.scopeLabel}>AGREED SCOPE</Text>
                  <Text style={s.scopeText}>{meta.agreedScope}</Text>
                </View>
              )}

              {/* Check-in toggle */}
              {meta && meta.checkIns.length > 0 && (
                <Pressable
                  onPress={() => setExpanded(isOpen ? null : user.id)}
                  style={({ pressed }) => [s.checkInToggle, pressed && { opacity: 0.8 }]}
                  accessibilityRole="button"
                >
                  <Text style={s.checkInToggleText}>
                    {isOpen ? '▲ Hide check-ins' : `▼ ${meta.checkIns.length} check-in${meta.checkIns.length > 1 ? 's' : ''}`}
                  </Text>
                </Pressable>
              )}

              {isOpen && meta && (
                <View style={s.checkInLog}>
                  {meta.checkIns.map((ci, i) => (
                    <View key={i} style={[s.checkInRow, ci.fromMe ? s.checkInMe : s.checkInThem]}>
                      <Text style={s.checkInDate}>{new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                      <Text style={s.checkInNote}>{ci.note}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Island>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.bgDeep },
  bgLayer:       { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg },
  nav:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, zIndex: 2 },
  backPill:      { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder, shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 4 },
  backText:      { fontSize: 13, fontWeight: '700', color: C.black },
  navTitle:      { fontSize: 18, fontWeight: '800', color: C.black },
  scroll:        { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },
  emptyState:    { alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyEmoji:    { fontSize: 40 },
  emptyTitle:    { fontSize: 17, fontWeight: '800', color: C.black },
  emptySub:      { fontSize: 13, color: C.blackSoft, textAlign: 'center' },
  cardHeader:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar:        { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1.5, borderColor: C.glassBorder, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji:   { fontSize: 24 },
  userName:      { fontSize: 17, fontWeight: '800', color: C.black },
  swapLine:      { fontSize: 13, color: C.blackSoft, marginTop: 2 },
  deadlineBadge: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1 },
  deadlineText:  { fontSize: 12, fontWeight: '800' },
  scopeBox:      { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 10, marginBottom: 12 },
  scopeLabel:    { fontSize: 9, fontWeight: '800', color: C.blackSoft, letterSpacing: 1.2, marginBottom: 4 },
  scopeText:     { fontSize: 13, color: C.blackMid, lineHeight: 19 },
  checkInToggle: { alignSelf: 'flex-start', borderRadius: 6, paddingVertical: 5, paddingHorizontal: 10, backgroundColor: 'rgba(97,216,204,0.2)', borderWidth: 1, borderColor: C.teal },
  checkInToggleText: { fontSize: 12, fontWeight: '700', color: C.tealDark },
  checkInLog:    { marginTop: 10, gap: 8 },
  checkInRow:    { borderRadius: 8, padding: 10 },
  checkInMe:     { backgroundColor: 'rgba(42,135,128,0.12)', alignSelf: 'flex-end', maxWidth: '88%' },
  checkInThem:   { backgroundColor: 'rgba(0,0,0,0.06)', alignSelf: 'flex-start', maxWidth: '88%' },
  checkInDate:   { fontSize: 10, color: C.blackSoft, marginBottom: 3, fontWeight: '700' },
  checkInNote:   { fontSize: 13, color: C.blackMid, lineHeight: 18 },
});
