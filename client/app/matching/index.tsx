/**
 * /matching  — Discover & match screen
 * Full register-screen glass-teal aesthetic.
 * Tap a card → Score Breakdown sheet slides up.
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
  sendRequest,
  matchScore,
} from '@/lib/matching/matching';

const C = {
  bg: '#7DE5E5', bgDeep: '#8FEBE5',
  glass: 'rgba(255,255,255,0.55)', glassBorder: 'rgba(255,255,255,0.45)',
  glowOne: 'rgba(255,255,255,0.22)', glowTwo: 'rgba(255,255,255,0.15)',
  black: '#000', blackMid: 'rgba(0,0,0,0.78)', blackSoft: 'rgba(0,0,0,0.55)',
  teal: '#61d8cc', tealDark: '#2a8780',
  gold: '#FFD166', shadow: '#000',
};

// ─── Back arrow ───────────────────────────────────────────────────────────────
function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={C.black} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const pct  = Math.round(score * 100);
  const color = pct >= 70 ? C.tealDark : pct >= 45 ? C.gold : '#EF767A';
  return (
    <View style={ring.wrap}>
      <View style={[ring.circle, { borderColor: color }]}>
        <Text style={[ring.num, { color }]}>{pct}</Text>
        <Text style={ring.pct}>%</Text>
      </View>
    </View>
  );
}
const ring = StyleSheet.create({
  wrap:   { alignItems: 'center', justifyContent: 'center' },
  circle: { width: 54, height: 54, borderRadius: 27, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  num:    { fontSize: 17, fontWeight: '900', lineHeight: 20 },
  pct:    { fontSize: 9, color: C.blackSoft, fontWeight: '700', marginTop: -2 },
});

// ─── User card ────────────────────────────────────────────────────────────────
type CardUser = (typeof MOCK_USERS)[number];

function UserCard({ user, onView }: { user: CardUser; onView: () => void }) {
  const { requests, connections, completed } = getMatchingState();
  const alreadySent = requests.has(user.id);
  const connected   = connections.has(user.id);
  const done        = completed.has(user.id);
  const score       = matchScore(user, YOU);

  function handleRequest() {
    sendRequest(user.id);
  }

  const statusLabel = done ? '✅ Completed'
    : connected      ? '🔗 Connected'
    : alreadySent    ? '📨 Requested'
    : null;

  // tagline: "Offers: X · Y · Z"
  const tagline = `Offers: ${(user.offers ?? []).slice(0, 3).join(' · ')}`;

  return (
    <View style={uc.outer}>
      <View style={uc.glowOne} />
      <View style={uc.glowTwo} />
      <Pressable
        style={({ pressed }) => [uc.inner, pressed && { opacity: 0.9 }]}
        onPress={onView}
        accessibilityRole="button"
        accessibilityLabel={`View ${user.name}'s match score`}
      >
        {/* Top row */}
        <View style={uc.topRow}>
          <View style={uc.avatar}>
            <Text style={uc.avatarEmoji}>{user.avatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={uc.name}>{user.name}</Text>
            <Text style={uc.tagline} numberOfLines={1}>{tagline}</Text>
          </View>
          <ScoreRing score={score.total} />
        </View>

        {/* Skill chips — from user.offers */}
        <View style={uc.chipRow}>
          {(user.offers ?? []).slice(0, 3).map(sk => (
            <View key={sk} style={uc.chip}>
              <Text style={uc.chipTxt}>{sk}</Text>
            </View>
          ))}
          {(user.offers ?? []).length > 3 && (
            <View style={uc.chip}>
              <Text style={uc.chipTxt}>+{user.offers.length - 3}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={uc.actionRow}>
          <Pressable
            style={({ pressed }) => [uc.viewBtn, pressed && { opacity: 0.8 }]}
            onPress={onView}
            accessibilityRole="button"
            accessibilityLabel={`Score breakdown for ${user.name}`}
          >
            <Text style={uc.viewTxt}>Score ›</Text>
          </Pressable>

          {statusLabel ? (
            <View style={uc.statusPill}>
              <Text style={uc.statusTxt}>{statusLabel}</Text>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [uc.reqBtn, pressed && { opacity: 0.8 }]}
              onPress={handleRequest}
              accessibilityRole="button"
              accessibilityLabel={`Send swap request to ${user.name}`}
            >
              <Text style={uc.reqTxt}>Request swap</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const uc = StyleSheet.create({
  outer:       { paddingVertical: 10, overflow: 'visible' },
  glowOne:     { position: 'absolute', left: 0, right: 0, top: 10, bottom: 10, borderRadius: 14, backgroundColor: C.glowOne, transform: [{ scale: 1.07 }] },
  glowTwo:     { position: 'absolute', left: 0, right: 0, top: 10, bottom: 10, borderRadius: 14, backgroundColor: C.glowTwo, transform: [{ scale: 1.12 }] },
  inner:       { borderRadius: 12, padding: 16, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder, shadowColor: C.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 7, gap: 12 },
  topRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:      { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.65)', borderWidth: 1.5, borderColor: C.glassBorder, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 24 },
  name:        { fontSize: 16, fontWeight: '800', color: C.black },
  tagline:     { fontSize: 12, color: C.blackSoft, marginTop: 2 },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:        { borderRadius: 99, paddingVertical: 3, paddingHorizontal: 10, backgroundColor: 'rgba(97,216,204,0.2)', borderWidth: 1, borderColor: C.teal },
  chipTxt:     { fontSize: 11, fontWeight: '700', color: C.tealDark },
  actionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  viewBtn:     { borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: 'rgba(0,0,0,0.06)', borderWidth: 1, borderColor: C.glassBorder },
  viewTxt:     { fontSize: 13, fontWeight: '700', color: C.black },
  reqBtn:      { borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: C.tealDark },
  reqTxt:      { fontSize: 13, fontWeight: '700', color: '#fff' },
  statusPill:  { borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: 'rgba(0,0,0,0.06)', borderWidth: 1, borderColor: C.glassBorder },
  statusTxt:   { fontSize: 12, fontWeight: '700', color: C.blackSoft },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function MatchingScreen() {
  const others = MOCK_USERS.filter(u => u.id !== YOU.id);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.bgLayer} />
      <View style={s.grid} />
      <View style={[s.glow, s.glowOut]} />
      <View style={[s.glow, s.glowIn]} />

      {/* Nav */}
      <View style={s.nav}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.backPill, pressed && { opacity: 0.75 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <BackIcon />
          <Text style={s.backTxt}>Back</Text>
        </Pressable>
        <Text style={s.navTitle}>Find Skills to Trade</Text>
        <View style={s.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {others.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onView={() => router.push(`/transaction/score-breakdown?userId=${user.id}` as any)}
          />
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bgDeep },
  bgLayer:   { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg },
  grid:      { ...StyleSheet.absoluteFillObject, opacity: 0.10, borderColor: 'rgba(0,0,0,0.2)', borderWidth: 0.5 },
  glow:      { position: 'absolute', borderRadius: 100, top: 52, alignSelf: 'center' },
  glowOut:   { width: 280, height: 100, backgroundColor: 'rgba(0,0,0,0.06)', transform: [{ scale: 1.4 }] },
  glowIn:    { width: 240, height: 80,  backgroundColor: 'rgba(0,0,0,0.04)', transform: [{ scale: 1.2 }] },
  nav:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, zIndex: 2 },
  backPill:  { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder },
  backTxt:   { fontSize: 13, fontWeight: '700', color: C.black },
  navTitle:  { flex: 1, fontSize: 18, fontWeight: '800', color: C.black, textAlign: 'center' },
  navSpacer: { width: 72 },
  scroll:    { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
});
