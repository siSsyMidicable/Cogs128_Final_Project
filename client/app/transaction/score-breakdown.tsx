/**
 * /transaction/score-breakdown?userId=X
 *
 * Dedicated screen for the full score explanation.
 * Reached only when the user taps "ℹ How was X% calculated?" on a card.
 * Nobody lands here by accident — it's intentional navigation.
 *
 * Information architecture (Norman: knowledge in the world):
 *   1. Verdict banner          — one-glance answer
 *   2. Plain-English ingredients  — what each number means in human terms
 *   3. "See the Math" toggle   — full annotated formula for those who want it
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, SafeAreaView, StatusBar, Platform,
  LayoutAnimation, UIManager,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import {
  matchScore, trustComponents,
  type MatchUser, type MatchScoreBreakdown,
} from '@/lib/matching/matching';
import { YOU, MOCK_USERS } from '@/lib/matching/data';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental)
  UIManager.setLayoutAnimationEnabledExperimental(true);

const MONO: any = Platform.OS === 'ios' ? 'Courier' : 'monospace';

// ─── helpers ──────────────────────────────────────────────────────────────────

function pct(v: number) { return `${Math.round(v * 100)}%`; }

function verdict(v: number) {
  if (v >= 0.80) return { emoji: '🔥', label: 'Excellent match',   color: '#61d8cc' };
  if (v >= 0.65) return { emoji: '✅', label: 'Good match',        color: '#6daa45' };
  if (v >= 0.45) return { emoji: '🤝', label: 'Decent match',      color: '#FFD166' };
  return           { emoji: '⚠️', label: 'Weak match',        color: '#EF767A' };
}

function sfBlurb(sf: number, you: MatchUser, other: MatchUser): string {
  const theyGive = other.offers.filter(s => you.requests.includes(s));
  const youGive  = you.offers.filter(s => other.requests.includes(s));
  if (sf >= 0.75) return `Great overlap — you each cover most of what the other needs.`;
  if (sf >= 0.4)  return `Partial overlap — ${theyGive.length > 0 ? `they offer ${theyGive[0]}` : `you cover some of their needs`}.`;
  return `Low overlap — skills don't line up well right now.`;
}

function tcBlurb(tc: number, tv: number): string {
  if (tc >= 0.80) return `Both of you have strong track records. High confidence.`;
  if (tc >= 0.55) return `Reasonable trust on both sides. Worth a first swap.`;
  if (tv < 0.40)  return `Their trust score is low — review their portfolio before committing.`;
  return `Limited history on one or both sides. Start small.`;
}

// ─── Back icon ────────────────────────────────────────────────────────────────

function BackIcon({ size = 20, color = '#101414' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── IngredientRow ────────────────────────────────────────────────────────────
// Each score ingredient: emoji + title + blurb + big bar + percentage.

function IngredientRow({
  emoji, title, blurb, value, color, weight,
}: {
  emoji: string; title: string; blurb: string;
  value: number; color: string; weight: string;
}) {
  return (
    <View style={ing.card}>
      <View style={ing.top}>
        <Text style={ing.emoji}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <View style={ing.titleRow}>
            <Text style={ing.title}>{title}</Text>
            <Text style={[ing.pct, { color }]}>{pct(value)}</Text>
          </View>
          <Text style={ing.blurb}>{blurb}</Text>
        </View>
      </View>
      {/* Bar */}
      <View style={ing.track}>
        <View style={[ing.fill, { width: pct(value) as any, backgroundColor: color }]} />
      </View>
      <Text style={ing.weight}>Weight in final score: {weight}</Text>
    </View>
  );
}

const ing = StyleSheet.create({
  card:     { backgroundColor: '#1c2424', borderWidth: 1, borderColor: '#2f4a47', padding: 14, marginBottom: 10 },
  top:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  emoji:    { fontSize: 26 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title:    { fontSize: 15, fontWeight: '800', color: '#e8ebe5' },
  pct:      { fontSize: 18, fontWeight: '900' },
  blurb:    { fontSize: 13, color: '#9ab5b2', lineHeight: 18 },
  track:    { height: 10, backgroundColor: '#2f4a47', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  fill:     { height: '100%', borderRadius: 3 },
  weight:   { fontSize: 11, color: '#607876', fontStyle: 'italic' },
});

// ─── TrustDetails ─────────────────────────────────────────────────────────────
// Plain-English breakdown of what goes into Trust for this specific user.

function TrustDetails({ user }: { user: MatchUser }) {
  const comp = trustComponents(user);
  const rows = [
    { label: 'Portfolio quality',          value: comp.P.value,    weight: '20%', sym: 'P' },
    { label: 'Average rating (1–5 scale)', value: comp.Rhat.value, weight: '30%', sym: 'Rating' },
    { label: 'Verification level',         value: comp.Vhat.value, weight: '20%', sym: 'Verified' },
    { label: 'Consistency of past swaps',  value: comp.C.value,    weight: '20%', sym: 'Consistency' },
    { label: 'Communication speed',        value: comp.Q.value,    weight: '10%', sym: 'Response' },
  ];
  return (
    <View style={td.container}>
      <Text style={td.heading}>What makes up {user.name}'s Trust score?</Text>
      {rows.map(r => (
        <View key={r.sym} style={td.row}>
          <View style={td.labelCol}>
            <Text style={td.label}>{r.label}</Text>
            <Text style={td.weightLabel}>{r.weight} of trust score</Text>
          </View>
          <View style={td.barCol}>
            <View style={td.track}>
              <View style={[td.fill, { width: pct(r.value) as any }]} />
            </View>
            <Text style={td.val}>{pct(r.value)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const td = StyleSheet.create({
  container: { backgroundColor: '#1c2424', borderWidth: 1, borderColor: '#2f4a47', padding: 14, marginBottom: 10 },
  heading:   { fontSize: 13, fontWeight: '800', color: '#a8c5c2', marginBottom: 12 },
  row:       { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  labelCol:  { width: 160 },
  label:     { fontSize: 12, color: '#cde0de', fontWeight: '600', marginBottom: 2 },
  weightLabel: { fontSize: 10, color: '#607876' },
  barCol:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  track:     { flex: 1, height: 7, backgroundColor: '#2f4a47', borderRadius: 2, overflow: 'hidden' },
  fill:      { height: '100%', backgroundColor: '#4f98a3', borderRadius: 2 },
  val:       { fontSize: 12, fontWeight: '700', color: '#61d8cc', width: 32, textAlign: 'right' },
});

// ─── FormulaPanel ─────────────────────────────────────────────────────────────
// Full annotated notation — opt-in only.

function FormulaPanel({ scores, user }: { scores: MatchScoreBreakdown; user: MatchUser }) {
  const comp = trustComponents(user);
  return (
    <View style={fp.container}>

      <Text style={fp.section}>OVERALL SCORE</Text>
      <Text style={fp.formula}>M(you, {user.name}) = 0.34·SF + 0.33·TC + 0.33·F</Text>
      <Text style={fp.note}>Each piece weighted ~equally. SF gets a tiny edge (skill fit matters most).</Text>

      <View style={fp.divider} />

      <Text style={fp.section}>SKILL FIT — SF = {scores.sf.toFixed(3)}</Text>
      <Text style={fp.formula}>SF = ( |O(you)∩R({user.name})| / |R({user.name})|</Text>
      <Text style={fp.formula}>       + |O({user.name})∩R(you)| / |R(you)| ) / 2</Text>
      <Text style={fp.note}>O(u) = skills u offers  ·  R(u) = skills u needs</Text>
      <Text style={fp.note}>∩ = items in both lists  ·  |·| = count of items</Text>

      <View style={fp.divider} />

      <Text style={fp.section}>TRUST COMPATIBILITY — TC = {scores.tc.toFixed(3)}</Text>
      <Text style={fp.formula}>TC = √( T(you) × T({user.name}) )</Text>
      <Text style={fp.formula}>   = √( {scores.tu.toFixed(3)} × {scores.tv.toFixed(3)} )</Text>
      <Text style={fp.note}>√ = square root (geometric mean).</Text>
      <Text style={fp.note}>If one trust score = 0 → TC = 0. One bad actor tanks the whole swap.</Text>

      <View style={fp.divider} />

      <Text style={fp.section}>TRUST SCORE — T({user.name}) = {scores.tv.toFixed(3)}</Text>
      <Text style={fp.formula}>T(u) = 0.2P + 0.3R̂ + 0.2V̂ + 0.2C + 0.1Q</Text>
      {[
        { sym: 'P',       desc: 'Portfolio quality',         v: comp.P.value,    w: '×0.2' },
        { sym: 'R̂',       desc: 'Avg rating → 0–1 scale',   v: comp.Rhat.value, w: '×0.3' },
        { sym: 'V̂',       desc: 'Verification level',        v: comp.Vhat.value, w: '×0.2' },
        { sym: 'C',       desc: 'Consistency',               v: comp.C.value,   w: '×0.2' },
        { sym: 'Q',       desc: 'Communication speed',       v: comp.Q.value,   w: '×0.1' },
      ].map(r => (
        <Text key={r.sym} style={fp.note}>
          {r.sym.padEnd(4)} {r.desc.padEnd(26)} = {r.v.toFixed(2)}  {r.w}
        </Text>
      ))}

      <View style={fp.divider} />

      <Text style={fp.section}>FAIRNESS — F = {scores.fair.toFixed(3)}</Text>
      <Text style={fp.formula}>F = 0.35·onTime + 0.35·scopeMatch + 0.15·evidence + 0.15·wouldSwapAgain</Text>
      <Text style={fp.note}>Set by 4 checkboxes when a swap completes. Defaults to 1.0 until then.</Text>

      <View style={fp.divider} />

      <Text style={fp.section}>FINAL CALCULATION</Text>
      <Text style={fp.formula}>
        M = {(0.34 * scores.sf).toFixed(3)} + {(0.33 * scores.tc).toFixed(3)} + {(0.33 * scores.fair).toFixed(3)}
      </Text>
      <Text style={[fp.formula, { color: '#61d8cc', fontWeight: '900' }]}>
        = {scores.total.toFixed(3)}  ({pct(scores.total)})
      </Text>
    </View>
  );
}

const fp = StyleSheet.create({
  container: { marginTop: 4 },
  section:   { fontSize: 9, fontWeight: '800', color: '#607876', letterSpacing: 1.4, marginTop: 10, marginBottom: 4 },
  formula:   { fontFamily: MONO, fontSize: 12, color: '#cde0de', lineHeight: 20 },
  note:      { fontFamily: MONO, fontSize: 11, color: '#607876', lineHeight: 17, marginLeft: 4 },
  divider:   { height: 1, backgroundColor: '#2f4a47', marginVertical: 6 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ScoreBreakdown() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [showFormula, setShowFormula] = useState(false);

  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user) {
    return (
      <SafeAreaView style={sc.safe}>
        <View style={sc.errorState}>
          <Text style={sc.errorText}>User not found.</Text>
          <Pressable onPress={() => router.back()} style={sc.backBtn}>
            <Text style={sc.backBtnText}>← Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const scores = matchScore(YOU, user);
  const v      = verdict(scores.total);

  function toggleFormula() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFormula(f => !f);
  }

  return (
    <SafeAreaView style={sc.safe}>
      <StatusBar barStyle="dark-content" />

      {/* ── Nav bar ── */}
      <View style={sc.nav}>
        <Pressable onPress={() => router.back()} style={sc.navBack}
          accessibilityLabel="Go back">
          <BackIcon size={20} color="#101414" />
        </Pressable>
        <Text style={sc.navTitle}>Score Breakdown</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={sc.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Section 1: Who ── */}
        <View style={sc.whoRow}>
          <View style={sc.avatar}><Text style={sc.avatarEmoji}>{user.avatar}</Text></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={sc.userName}>{user.name}</Text>
            <Text style={sc.userOffers} numberOfLines={1}>Offers: {user.offers.join(', ')}</Text>
          </View>
        </View>

        {/* ── Section 2: Verdict banner ── */}
        <View style={[sc.verdict, { borderColor: v.color }]}>
          <Text style={sc.verdictEmoji}>{v.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[sc.verdictLabel, { color: v.color }]}>{v.label}</Text>
            <Text style={sc.verdictSub}>
              Overall score: <Text style={{ color: v.color, fontWeight: '900' }}>{pct(scores.total)}</Text>
            </Text>
          </View>
        </View>

        {/* ── Section 3: Plain-English ingredients ── */}
        <Text style={sc.sectionHeader}>HOW THIS SCORE IS BUILT</Text>

        <IngredientRow
          emoji="🧩"
          title="Skill Fit"
          blurb={sfBlurb(scores.sf, YOU, user)}
          value={scores.sf}
          color="#61d8cc"
          weight="34%"
        />
        <IngredientRow
          emoji="🛡️"
          title="Trust"
          blurb={tcBlurb(scores.tc, scores.tv)}
          value={scores.tc}
          color="#4f98a3"
          weight="33%"
        />
        <IngredientRow
          emoji="⚖️"
          title="Past Fairness"
          blurb={
            scores.fair >= 1.0
              ? `No completed swaps yet — defaults to full score.`
              : scores.fair >= 0.7
              ? `Past swaps were mostly fair.`
              : `Past swaps had issues. Check their history before committing.`
          }
          value={scores.fair}
          color="#FFD166"
          weight="33%"
        />

        {/* ── Section 4: Trust sub-breakdown ── */}
        <Text style={sc.sectionHeader}>TRUST DETAIL</Text>
        <TrustDetails user={user} />

        {/* ── Section 5: Formula toggle ── */}
        <Text style={sc.sectionHeader}>FOR THE CURIOUS</Text>
        <Pressable onPress={toggleFormula} style={sc.formulaToggle}>
          <Text style={sc.formulaToggleText}>
            {showFormula ? '▲ Hide the math formula' : '▼ Show the math formula (discrete notation)'}
          </Text>
        </Pressable>
        {showFormula && (
          <View style={sc.formulaPanel}>
            <FormulaPanel scores={scores} user={user} />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sc = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#d6d8d3' },
  nav:          {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ececea', borderBottomWidth: 2, borderBottomColor: '#2f3333',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  navBack:      { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  navTitle:     { fontSize: 17, fontWeight: '800', color: '#101414' },
  scroll:       { padding: 16, paddingBottom: 32 },
  whoRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar:       {
    width: 52, height: 52, backgroundColor: '#61d8cc',
    borderWidth: 2, borderColor: '#1f4642', alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji:  { fontSize: 26 },
  userName:     { fontSize: 20, fontWeight: '800', color: '#101414' },
  userOffers:   { fontSize: 12, color: '#394140', marginTop: 2 },
  verdict:      {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 2, padding: 14, marginBottom: 20,
    backgroundColor: '#1c2424',
  },
  verdictEmoji: { fontSize: 32 },
  verdictLabel: { fontSize: 18, fontWeight: '900', marginBottom: 3 },
  verdictSub:   { fontSize: 13, color: '#9ab5b2' },
  sectionHeader: {
    fontSize: 9, fontWeight: '800', color: '#607876',
    letterSpacing: 1.4, marginBottom: 10, marginTop: 4,
  },
  formulaToggle: {
    borderWidth: 1, borderColor: '#2f4a47',
    paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: '#1c2424', marginBottom: 2,
  },
  formulaToggleText: { fontSize: 13, fontWeight: '700', color: '#4f98a3' },
  formulaPanel:  {
    backgroundColor: '#131b1b', borderWidth: 1, borderColor: '#2f4a47',
    padding: 14, marginBottom: 10,
  },
  errorState:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText:    { fontSize: 16, color: '#607876' },
  backBtn:      { padding: 12, backgroundColor: '#1c2424', borderWidth: 1, borderColor: '#2f4a47' },
  backBtnText:  { fontSize: 14, fontWeight: '700', color: '#61d8cc' },
});
