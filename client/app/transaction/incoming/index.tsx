/**
 * /transaction/incoming
 * Pending swap requests waiting for YOU to accept or decline.
 * Seeded: Lina sent a request.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { MOCK_USERS, YOU } from '@/lib/matching/data';
import {
  getMatchingState,
  confirmConnect,
  declineRequest,
  matchScore,
} from '@/lib/matching/matching';

const C = {
  bg: '#7DE5E5', bgDeep: '#8FEBE5',
  glass: 'rgba(255,255,255,0.55)', glassBorder: 'rgba(255,255,255,0.45)',
  glowOne: 'rgba(255,255,255,0.22)', glowTwo: 'rgba(255,255,255,0.15)',
  black: '#000', blackMid: 'rgba(0,0,0,0.78)', blackSoft: 'rgba(0,0,0,0.55)',
  teal: '#61d8cc', tealDark: '#2a8780',
  red: '#EF767A', gold: '#FFD166', shadow: '#000',
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

export default function IncomingScreen() {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { requests } = getMatchingState();
  const pending = MOCK_USERS.filter(
    u => requests.has(u.id) && !dismissed.includes(u.id)
  );

  function handleAccept(userId: string) {
    confirmConnect(userId);
    setDismissed(d => [...d, userId]);
  }
  function handleDecline(userId: string) {
    declineRequest(userId);
    setDismissed(d => [...d, userId]);
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.bgLayer} />

      <View style={s.nav}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [s.backPill, pressed && { opacity: 0.75 }]} accessibilityLabel="Go back" accessibilityRole="button">
          <BackIcon />
          <Text style={s.backText}>Back</Text>
        </Pressable>
        <Text style={s.navTitle}>Incoming</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {pending.length === 0 ? (
          <Island>
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>📥</Text>
              <Text style={s.emptyTitle}>No pending requests</Text>
              <Text style={s.emptySub}>When someone wants to swap with you, they'll appear here.</Text>
            </View>
          </Island>
        ) : pending.map(user => {
          const score      = matchScore(YOU, user);
          const theyOffer  = user.offers.filter(o => YOU.requests.includes(o));
          const youOffer   = YOU.offers.filter(o => user.requests.includes(o));
          return (
            <Island key={user.id}>
              <View style={s.cardHeader}>
                <View style={s.avatar}>
                  <Text style={s.avatarEmoji}>{user.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.userName}>{user.name}</Text>
                  <Text style={s.scoreText}>
                    Match score:{' '}
                    <Text style={{ color: C.teal, fontWeight: '900' }}>
                      {Math.round(score.total * 100)}%
                    </Text>
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push(`/transaction/score-breakdown?userId=${user.id}` as any)}
                  style={s.scoreBtn}
                >
                  <Text style={s.scoreBtnText}>Details</Text>
                </Pressable>
              </View>

              <View style={s.swapRow}>
                <View style={s.swapCol}>
                  <Text style={s.swapLabel}>They offer you</Text>
                  {theyOffer.length > 0
                    ? theyOffer.map(sk => <Text key={sk} style={s.skill}>✓ {sk}</Text>)
                    : <Text style={s.skillMuted}>No direct match</Text>}
                </View>
                <Text style={s.swapArrow}>⇄</Text>
                <View style={s.swapCol}>
                  <Text style={s.swapLabel}>You offer them</Text>
                  {youOffer.length > 0
                    ? youOffer.map(sk => <Text key={sk} style={s.skill}>✓ {sk}</Text>)
                    : <Text style={s.skillMuted}>No direct match</Text>}
                </View>
              </View>

              <View style={s.actionRow}>
                <Pressable
                  onPress={() => handleDecline(user.id)}
                  style={({ pressed }) => [s.declineBtn, pressed && { opacity: 0.8 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Decline ${user.name}`}
                >
                  <Text style={s.declineBtnText}>Decline</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleAccept(user.id)}
                  style={({ pressed }) => [s.acceptBtn, pressed && { opacity: 0.8 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Accept ${user.name}`}
                >
                  <Text style={s.acceptBtnText}>Accept ›</Text>
                </Pressable>
              </View>
            </Island>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.bgDeep },
  bgLayer:        { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg },
  nav:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, zIndex: 2 },
  backPill:       { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder, shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 4 },
  backText:       { fontSize: 13, fontWeight: '700', color: C.black },
  navTitle:       { fontSize: 18, fontWeight: '800', color: C.black },
  scroll:         { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },
  emptyState:     { alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyEmoji:     { fontSize: 40 },
  emptyTitle:     { fontSize: 17, fontWeight: '800', color: C.black },
  emptySub:       { fontSize: 13, color: C.blackSoft, textAlign: 'center', maxWidth: 260 },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar:         { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1.5, borderColor: C.glassBorder, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji:    { fontSize: 24 },
  userName:       { fontSize: 18, fontWeight: '800', color: C.black },
  scoreText:      { fontSize: 13, color: C.blackSoft, marginTop: 2 },
  scoreBtn:       { borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(97,216,204,0.25)', borderWidth: 1, borderColor: C.teal },
  scoreBtnText:   { fontSize: 12, fontWeight: '700', color: C.tealDark },
  swapRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16 },
  swapCol:        { flex: 1, gap: 4 },
  swapLabel:      { fontSize: 11, fontWeight: '800', color: C.blackSoft, letterSpacing: 0.6, marginBottom: 4 },
  skill:          { fontSize: 13, fontWeight: '600', color: C.tealDark },
  skillMuted:     { fontSize: 12, color: C.blackSoft, fontStyle: 'italic' },
  swapArrow:      { fontSize: 22, color: C.blackSoft, marginTop: 20 },
  actionRow:      { flexDirection: 'row', gap: 10 },
  declineBtn:     { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: 'rgba(239,118,122,0.18)', borderWidth: 1, borderColor: 'rgba(239,118,122,0.5)' },
  declineBtnText: { fontSize: 14, fontWeight: '700', color: C.red },
  acceptBtn:      { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: C.tealDark, shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 4 },
  acceptBtnText:  { fontSize: 14, fontWeight: '800', color: '#fff' },
});
