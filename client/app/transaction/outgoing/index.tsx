/**
 * /transaction/outgoing  ("Completed Swaps" / history)
 * Shows Maria and Daniel's completed swaps with ratings and notes.
 * Uses HistoryRecord from matching.ts (not SwapRecord — that type doesn't exist).
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { MOCK_USERS } from '@/lib/matching/data';
import { getMatchingState, type HistoryRecord } from '@/lib/matching/matching';

const C = {
  bg: '#7DE5E5', bgDeep: '#8FEBE5',
  glass: 'rgba(255,255,255,0.55)', glassBorder: 'rgba(255,255,255,0.45)',
  glowOne: 'rgba(255,255,255,0.22)', glowTwo: 'rgba(255,255,255,0.15)',
  black: '#000', blackMid: 'rgba(0,0,0,0.78)', blackSoft: 'rgba(0,0,0,0.55)',
  teal: '#61d8cc', tealDark: '#2a8780',
  gold: '#FFD166', red: '#EF767A', shadow: '#000',
};

function Island({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <View style={isl.outer}>
      <View style={isl.glowOne} />
      <View style={isl.glowTwo} />
      <View style={[isl.inner, accent ? { borderColor: accent, borderWidth: 1.5 } : null]}>{children}</View>
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

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize: 14, color: i <= rating ? C.gold : 'rgba(0,0,0,0.18)' }}>★</Text>
      ))}
    </View>
  );
}

export default function OutgoingScreen() {
  const { completed, history } = getMatchingState();
  const completedUsers = MOCK_USERS.filter(u => completed.has(u.id));

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.bgLayer} />

      <View style={s.nav}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [s.backPill, pressed && { opacity: 0.75 }]} accessibilityLabel="Go back" accessibilityRole="button">
          <BackIcon />
          <Text style={s.backText}>Back</Text>
        </Pressable>
        <Text style={s.navTitle}>Completed</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {completedUsers.length === 0 ? (
          <Island>
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>✅</Text>
              <Text style={s.emptyTitle}>No completed swaps yet</Text>
              <Text style={s.emptySub}>Finish an ongoing swap to see it here.</Text>
            </View>
          </Island>
        ) : completedUsers.map(user => {
          const userHistory = history.filter(r => r.partnerId === user.id);
          const last: HistoryRecord | undefined = userHistory[0]; // history is newest-first
          const proof = last?.proof;
          const fairness =
            (proof?.deliveredOnTime       ? 1 : 0) +
            (proof?.scopeMatchedAgreement ? 1 : 0) +
            (proof?.wouldSwapAgain        ? 1 : 0);
          const fairLabel = fairness >= 3 ? '🔥 Great swap' : fairness >= 2 ? '✅ Decent swap' : '⚠️ Had issues';
          const fairColor = fairness >= 3 ? C.teal : fairness >= 2 ? C.tealDark : C.red;

          return (
            <Island key={user.id} accent={fairColor}>
              <View style={s.cardHeader}>
                <View style={s.avatar}>
                  <Text style={s.avatarEmoji}>{user.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.userName}>{user.name}</Text>
                  {last?.completedAt && (
                    <Text style={s.dateText}>
                      {new Date(last.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  )}
                </View>
                <View style={[s.fairBadge, { backgroundColor: fairColor + '22', borderColor: fairColor }]}>
                  <Text style={[s.fairText, { color: fairColor }]}>{fairLabel}</Text>
                </View>
              </View>

              {last && (
                <View style={s.skillRow}>
                  <Text style={s.skillChip}>🤝 {last.skillGiven} ↔ {last.skillReceived}</Text>
                </View>
              )}

              <View style={s.ratingRow}>
                <Text style={s.ratingLabel}>Your rating</Text>
                <StarRating rating={last?.starRating ?? 0} />
              </View>

              {last?.proof?.notes && (
                <View style={s.notesBox}>
                  <Text style={s.notesLabel}>NOTES</Text>
                  <Text style={s.notesText}>"{last.proof.notes}"</Text>
                </View>
              )}

              <Pressable
                onPress={() => router.push(`/transaction/score-breakdown?userId=${user.id}` as any)}
                style={({ pressed }) => [s.detailsBtn, pressed && { opacity: 0.8 }]}
                accessibilityRole="button"
              >
                <Text style={s.detailsBtnText}>View match score breakdown ›</Text>
              </Pressable>
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
  emptySub:       { fontSize: 13, color: C.blackSoft, textAlign: 'center' },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar:         { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1.5, borderColor: C.glassBorder, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji:    { fontSize: 24 },
  userName:       { fontSize: 17, fontWeight: '800', color: C.black },
  dateText:       { fontSize: 12, color: C.blackSoft, marginTop: 2 },
  fairBadge:      { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1 },
  fairText:       { fontSize: 11, fontWeight: '800' },
  skillRow:       { marginBottom: 10 },
  skillChip:      { fontSize: 13, color: C.blackMid, fontWeight: '600' },
  ratingRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  ratingLabel:    { fontSize: 12, color: C.blackSoft, fontWeight: '700' },
  notesBox:       { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 10, marginBottom: 12 },
  notesLabel:     { fontSize: 9, fontWeight: '800', color: C.blackSoft, letterSpacing: 1.2, marginBottom: 4 },
  notesText:      { fontSize: 13, color: C.blackMid, fontStyle: 'italic', lineHeight: 19 },
  detailsBtn:     { alignSelf: 'flex-start', borderRadius: 6, paddingVertical: 5, paddingHorizontal: 10, backgroundColor: 'rgba(97,216,204,0.2)', borderWidth: 1, borderColor: C.teal },
  detailsBtnText: { fontSize: 12, fontWeight: '700', color: C.tealDark },
});
