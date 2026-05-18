/**
 * /transaction/score-breakdown?userId=<id>
 * Full match score breakdown — SkillFit, TrustCompat, Fairness, Trust components.
 * Reached from incoming, ongoing, outgoing, and matching screens.
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { MOCK_USERS, YOU } from '@/lib/matching/data';
import {
  matchScore,
  trustScore,
  trustComponents,
  skillFit,
  whyThisMatch,
  getMatchingState,
} from '@/lib/matching/matching';

const C = {
  bg: '#7DE5E5', bgDeep: '#8FEBE5',
  glass: 'rgba(255,255,255,0.55)', glassBorder: 'rgba(255,255,255,0.45)',
  glowOne: 'rgba(255,255,255,0.22)', glowTwo: 'rgba(255,255,255,0.15)',
  black: '#000', blackMid: 'rgba(0,0,0,0.78)', blackSoft: 'rgba(0,0,0,0.55)',
  teal: '#61d8cc', tealDark: '#2a8780',
  gold: '#FFD166', red: '#EF767A', shadow: '#000',
};

function Island({ children }: { children: React.ReactNode }) {
  return (
    <View style={isl.outer}>
      <View style={isl.glow1} />
      <View style={isl.glow2} />
      <View style={isl.inner}>{children}</View>
    </View>
  );
}
const isl = StyleSheet.create({
  outer:  { paddingVertical: 14, overflow: 'visible' },
  glow1:  { position: 'absolute', left: 0, right: 0, top: 14, bottom: 14, borderRadius: 14, backgroundColor: C.glowOne, transform: [{ scale: 1.07 }] },
  glow2:  { position: 'absolute', left: 0, right: 0, top: 14, bottom: 14, borderRadius: 14, backgroundColor: C.glowTwo, transform: [{ scale: 1.12 }] },
  inner:  { borderRadius: 12, padding: 16, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder, shadowColor: C.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 14, elevation: 8 },
});

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={C.black} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Bar({ value, color, label }: { value: number; color: string; label: string }) {
  const pct = Math.round(value * 100);
  return (
    <View style={bar.row}>
      <Text style={bar.label}>{label}</Text>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[bar.val, { color }]}>{pct}%</Text>
    </View>
  );
}
const bar = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '700', color: C.blackSoft, width: 72 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 4 },
  val:   { fontSize: 12, fontWeight: '900', width: 38, textAlign: 'right' },
});

export default function ScoreBreakdownScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const user = MOCK_USERS.find(u => u.id === userId);

  if (!user) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.bgLayer} />
        <View style={s.nav}>
          <Pressable onPress={() => router.back()} style={s.backPill}>
            <BackIcon />
            <Text style={s.backText}>Back</Text>
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, color: C.blackSoft }}>User not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { history } = getMatchingState();
  const lastRecord  = history.find(r => r.partnerId === user.id);
  const fairOverride = lastRecord?.fairness;
  const scores      = matchScore(YOU, user, fairOverride);
  const youComponents   = trustComponents(YOU);
  const themComponents  = trustComponents(user);
  const theyOffer   = user.offers.filter(o => YOU.requests.includes(o));
  const youOffer    = YOU.offers.filter(o => user.requests.includes(o));
  const sf          = skillFit(YOU, user);
  const why         = whyThisMatch(YOU, user, scores);

  const totalColor = scores.total >= 0.70 ? C.tealDark : scores.total >= 0.45 ? C.gold : C.red;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.bgLayer} />

      <View style={s.nav}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [s.backPill, pressed && { opacity: 0.75 }]} accessibilityLabel="Go back">
          <BackIcon />
          <Text style={s.backText}>Back</Text>
        </Pressable>
        <Text style={s.navTitle}>Score Breakdown</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero score */}
        <Island>
          <View style={s.heroRow}>
            <View style={s.avatar}>
              <Text style={s.avatarEmoji}>{user.avatar}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.userName}>{user.name}</Text>
              <Text style={s.tagline}>{user.tagline}</Text>
            </View>
            <View style={[s.scoreBubble, { borderColor: totalColor }]}>
              <Text style={[s.scoreNum, { color: totalColor }]}>{Math.round(scores.total * 100)}</Text>
              <Text style={s.scorePct}>%</Text>
            </View>
          </View>
          <Text style={s.formula}>M = 0.34·SF + 0.33·TC + 0.33·F</Text>
          <Text style={s.whyText}>{why}</Text>
        </Island>

        {/* Main score bars */}
        <Island>
          <Text style={s.sectionLabel}>MATCH COMPONENTS</Text>
          <Bar value={scores.sf}   color={C.tealDark} label="Skill Fit" />
          <Bar value={scores.tc}   color={C.gold}     label="Trust Compat" />
          <Bar value={scores.fair} color={C.teal}     label="Fairness" />
        </Island>

        {/* Skill overlap */}
        <Island>
          <Text style={s.sectionLabel}>SKILL OVERLAP</Text>
          <View style={s.swapRow}>
            <View style={s.swapCol}>
              <Text style={s.swapColLabel}>They offer you</Text>
              {theyOffer.length > 0
                ? theyOffer.map(sk => <Text key={sk} style={s.skillYes}>✓ {sk}</Text>)
                : <Text style={s.skillNo}>No direct match</Text>}
            </View>
            <Text style={s.swapArrow}>⇄</Text>
            <View style={s.swapCol}>
              <Text style={s.swapColLabel}>You offer them</Text>
              {youOffer.length > 0
                ? youOffer.map(sk => <Text key={sk} style={s.skillYes}>✓ {sk}</Text>)
                : <Text style={s.skillNo}>No direct match</Text>}
            </View>
          </View>
        </Island>

        {/* Your trust components */}
        <Island>
          <Text style={s.sectionLabel}>YOUR TRUST  T(you) = {scores.tu.toFixed(2)}</Text>
          {Object.entries(youComponents).map(([k, { weight, value }]) => (
            <Bar key={k} value={value} color={C.tealDark}
              label={`${k} ×${weight}`} />
          ))}
        </Island>

        {/* Their trust components */}
        <Island>
          <Text style={s.sectionLabel}>THEIR TRUST  T({user.name.split(' ')[0]}) = {scores.tv.toFixed(2)}</Text>
          {Object.entries(themComponents).map(([k, { weight, value }]) => (
            <Bar key={k} value={value} color={C.gold}
              label={`${k} ×${weight}`} />
          ))}
        </Island>

        {lastRecord && (
          <Island>
            <Text style={s.sectionLabel}>FAIRNESS FROM LAST SWAP</Text>
            <Bar value={lastRecord.fairness} color={C.teal} label="F score" />
            {lastRecord.proof.notes ? (
              <View style={s.notesBox}>
                <Text style={s.notesText}>"{lastRecord.proof.notes}"</Text>
              </View>
            ) : null}
          </Island>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bgDeep },
  bgLayer:      { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg },
  nav:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, zIndex: 2 },
  backPill:     { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder },
  backText:     { fontSize: 13, fontWeight: '700', color: C.black },
  navTitle:     { fontSize: 18, fontWeight: '800', color: C.black },
  scroll:       { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },
  heroRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar:       { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.65)', borderWidth: 1.5, borderColor: C.glassBorder, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji:  { fontSize: 26 },
  userName:     { fontSize: 18, fontWeight: '800', color: C.black },
  tagline:      { fontSize: 12, color: C.blackSoft, marginTop: 2 },
  scoreBubble:  { width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  scoreNum:     { fontSize: 20, fontWeight: '900', lineHeight: 22 },
  scorePct:     { fontSize: 9, color: C.blackSoft, fontWeight: '700' },
  formula:      { fontSize: 11, color: C.blackSoft, fontFamily: 'monospace', marginBottom: 8, letterSpacing: 0.4 },
  whyText:      { fontSize: 13, color: C.blackMid, lineHeight: 20 },
  sectionLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.4, color: C.blackSoft, marginBottom: 10 },
  swapRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  swapCol:      { flex: 1, gap: 4 },
  swapColLabel: { fontSize: 11, fontWeight: '800', color: C.blackSoft, letterSpacing: 0.4, marginBottom: 4 },
  skillYes:     { fontSize: 13, fontWeight: '600', color: C.tealDark },
  skillNo:      { fontSize: 12, color: C.blackSoft, fontStyle: 'italic' },
  swapArrow:    { fontSize: 20, color: C.blackSoft, marginTop: 18 },
  notesBox:     { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 10, marginTop: 8 },
  notesText:    { fontSize: 13, color: C.blackMid, fontStyle: 'italic', lineHeight: 19 },
});
