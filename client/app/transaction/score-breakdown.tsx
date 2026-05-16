/**
 * /transaction/score-breakdown?userId=X
 *
 * Teal-glass world redesign — every card floats as an island.
 * Overflow:visible on all ancestors so halos never wall-clip.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, StatusBar, Platform,
  LayoutAnimation, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import {
  matchScore, trustComponents,
  type MatchUser, type MatchScoreBreakdown,
} from '@/lib/matching/matching';
import { YOU, MOCK_USERS } from '@/lib/matching/data';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental)
  UIManager.setLayoutAnimationEnabledExperimental(true);

const MONO: any = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

// ─── Palette ─────────────────────────────────────────────────────────────────
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
  blackFaint:  'rgba(0,0,0,0.30)',
  teal:        '#61d8cc',
  tealDark:    '#2a8780',
  gold:        '#FFD166',
  red:         '#EF767A',
  orange:      '#FF8C42',
  orangeGlowA: 'rgba(255,107,26,0.45)',
  orangeGlowB: 'rgba(255,140,66,0.45)',
  orangeGlowC: 'rgba(255,163,102,0.35)',
  track:       'rgba(0,0,0,0.10)',
  divider:     'rgba(0,0,0,0.09)',
  inputBg:     'rgba(255,255,255,0.60)',
  shadow:      '#000',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pct(v: number) { return `${Math.round(v * 100)}%`; }

function verdict(v: number) {
  if (v >= 0.80) return { emoji: '🔥', label: 'Excellent match',  color: C.teal };
  if (v >= 0.65) return { emoji: '✅', label: 'Good match',       color: '#6daa45' };
  if (v >= 0.45) return { emoji: '🤝', label: 'Decent match',     color: C.gold };
  return           { emoji: '⚠️', label: 'Weak match',       color: C.red };
}

function sfBlurb(sf: number, you: MatchUser, other: MatchUser): string {
  const theyGive = other.offers.filter(s => you.requests.includes(s));
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

// ─── Floating island wrapper ──────────────────────────────────────────────────────
function Island({ children, accentBorder }: { children: React.ReactNode; accentBorder?: string }) {
  return (
    <View style={isl.outer}>
      <View style={[isl.glowOne]} />
      <View style={[isl.glowTwo]} />
      <View style={[isl.inner, accentBorder ? { borderColor: accentBorder, borderWidth: 1.5 } : null]}>
        {children}
      </View>
    </View>
  );
}

const isl = StyleSheet.create({
  // paddingVertical:18 = the island's personal force-field.
  // Shadow + glow halo live inside this space, never touching a neighbour.
  outer: {
    paddingVertical: 14,
    overflow: 'visible',
  },
  glowOne: {
    position: 'absolute',
    left: 0, right: 0, top: 14, bottom: 14,
    borderRadius: 14,
    backgroundColor: C.glowOne,
    transform: [{ scale: 1.07 }],
  },
  glowTwo: {
    position: 'absolute',
    left: 0, right: 0, top: 14, bottom: 14,
    borderRadius: 14,
    backgroundColor: C.glowTwo,
    transform: [{ scale: 1.12 }],
  },
  inner: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 14,
    elevation: 8,
  },
});

// ─── Back icon ──────────────────────────────────────────────────────────────────
function BackIcon({ size = 20, color = C.black }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return <Text style={sc.sectionLabel}>{label}</Text>;
}

// ─── IngredientRow ───────────────────────────────────────────────────────────────
function IngredientRow({
  emoji, title, blurb, value, color, weight,
}: {
  emoji: string; title: string; blurb: string;
  value: number; color: string; weight: string;
}) {
  return (
    <Island>
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
      <View style={[ing.track]}>
        <View style={[ing.fill, { width: pct(value) as any, backgroundColor: color }]} />
      </View>
      <Text style={ing.weight}>Weight in final score: {weight}</Text>
    </Island>
  );
}

const ing = StyleSheet.create({
  top:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  emoji:    { fontSize: 26 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title:    { fontSize: 15, fontWeight: '800', color: C.black },
  pct:      { fontSize: 18, fontWeight: '900' },
  blurb:    { fontSize: 13, color: C.blackMid, lineHeight: 18 },
  track:    { height: 10, backgroundColor: C.track, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  fill:     { height: '100%', borderRadius: 5 },
  weight:   { fontSize: 11, color: C.blackSoft, fontStyle: 'italic' },
});

// ─── TrustDetails ────────────────────────────────────────────────────────────────
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
    <Island>
      <Text style={td.heading}>What makes up {user.name}'s Trust score?</Text>
      {rows.map((r, i) => (
        <View key={r.sym}>
          {i > 0 && <View style={td.rowDivider} />}
          <View style={td.row}>
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
        </View>
      ))}
    </Island>
  );
}

const td = StyleSheet.create({
  heading:     { fontSize: 13, fontWeight: '800', color: C.black, marginBottom: 14 },
  row:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  rowDivider:  { height: 1, backgroundColor: C.divider },
  labelCol:    { width: 160 },
  label:       { fontSize: 12, color: C.blackMid, fontWeight: '600', marginBottom: 2 },
  weightLabel: { fontSize: 10, color: C.blackSoft },
  barCol:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  track:       { flex: 1, height: 7, backgroundColor: C.track, borderRadius: 3, overflow: 'hidden' },
  fill:        { height: '100%', backgroundColor: C.teal, borderRadius: 3 },
  val:         { fontSize: 12, fontWeight: '700', color: C.teal, width: 32, textAlign: 'right' },
});

// ─── FormulaPanel ───────────────────────────────────────────────────────────────
function FormulaPanel({ scores, user }: { scores: MatchScoreBreakdown; user: MatchUser }) {
  const comp = trustComponents(user);
  return (
    <Island>
      <Text style={fp.section}>OVERALL SCORE</Text>
      <Text style={fp.formula}>M(you, {user.name}) = 0.34·SF + 0.33·TC + 0.33·F</Text>
      <Text style={fp.note}>Each piece weighted ~equally. SF gets a tiny edge (skill fit matters most).</Text>
      <View style={fp.divider} />

      <Text style={fp.section}>SKILL FIT — SF = {scores.sf.toFixed(3)}</Text>
      <Text style={fp.formula}>SF = ( |O(you)∩R({user.name})| / |R({user.name})|</Text>
      <Text style={fp.formula}>       + |O({user.name})∩R(you)| / |R(you)| ) / 2</Text>
      <Text style={fp.note}>O(u) = skills u offers  ·  R(u) = skills u needs</Text>
      <View style={fp.divider} />

      <Text style={fp.section}>TRUST COMPATIBILITY — TC = {scores.tc.toFixed(3)}</Text>
      <Text style={fp.formula}>TC = √( T(you) × T({user.name}) )</Text>
      <Text style={fp.formula}>   = √( {scores.tu.toFixed(3)} × {scores.tv.toFixed(3)} )</Text>
      <Text style={fp.note}>√ = geometric mean. One trust = 0 → TC = 0.</Text>
      <View style={fp.divider} />

      <Text style={fp.section}>TRUST SCORE — T({user.name}) = {scores.tv.toFixed(3)}</Text>
      <Text style={fp.formula}>T(u) = 0.2P + 0.3R̂ + 0.2V̂ + 0.2C + 0.1Q</Text>
      {[
        { sym: 'P',    desc: 'Portfolio quality',       v: comp.P.value,    w: '×0.2' },
        { sym: 'R̂',    desc: 'Avg rating → 0–1',        v: comp.Rhat.value, w: '×0.3' },
        { sym: 'V̂',    desc: 'Verification level',      v: comp.Vhat.value, w: '×0.2' },
        { sym: 'C',    desc: 'Consistency',              v: comp.C.value,   w: '×0.2' },
        { sym: 'Q',    desc: 'Communication speed',      v: comp.Q.value,   w: '×0.1' },
      ].map(r => (
        <Text key={r.sym} style={fp.note}>
          {r.sym.padEnd(4)} {r.desc.padEnd(26)} = {r.v.toFixed(2)}  {r.w}
        </Text>
      ))}
      <View style={fp.divider} />

      <Text style={fp.section}>FAIRNESS — F = {scores.fair.toFixed(3)}</Text>
      <Text style={fp.formula}>F = 0.35·onTime + 0.35·scopeMatch + 0.15·evidence + 0.15·wouldSwapAgain</Text>
      <Text style={fp.note}>Defaults to 1.0 until first swap completes.</Text>
      <View style={fp.divider} />

      <Text style={fp.section}>FINAL CALCULATION</Text>
      <Text style={fp.formula}>
        M = {(0.34 * scores.sf).toFixed(3)} + {(0.33 * scores.tc).toFixed(3)} + {(0.33 * scores.fair).toFixed(3)}
      </Text>
      <Text style={[fp.formula, { color: C.teal, fontWeight: '900' }]}>
        = {scores.total.toFixed(3)}  ({pct(scores.total)})
      </Text>
    </Island>
  );
}

const fp = StyleSheet.create({
  section: { fontSize: 9, fontWeight: '800', color: C.blackSoft, letterSpacing: 1.4, marginTop: 10, marginBottom: 4 },
  formula: { fontFamily: MONO, fontSize: 12, color: C.blackMid, lineHeight: 20 },
  note:    { fontFamily: MONO, fontSize: 11, color: C.blackSoft, lineHeight: 17, marginLeft: 4 },
  divider: { height: 1, backgroundColor: C.divider, marginVertical: 6 },
});

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ScoreBreakdown() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [showFormula, setShowFormula] = useState(false);

  const user = MOCK_USERS.find(u => u.id === userId);

  if (!user) {
    return (
      <SafeAreaView style={sc.safe}>
        <View style={sc.errorState}>
          <Text style={sc.errorText}>User not found.</Text>
          <Pressable onPress={() => router.back()} style={sc.errorBtn}>
            <Text style={sc.errorBtnText}>← Go back</Text>
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

      {/* Ambient teal background */}
      <View style={sc.bgLayer} />

      {/* ── Nav bar ── */}
      <View style={sc.nav}>
        <View style={sc.backPillWrap}>
          <View style={sc.backGlow} />
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [sc.backPill, pressed && { opacity: 0.75 }]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <BackIcon size={16} color={C.black} />
            <Text style={sc.backPillText}>Back</Text>
          </Pressable>
        </View>
        <Text style={sc.navTitle}>Score Breakdown</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView
        contentContainerStyle={sc.scroll}
        showsVerticalScrollIndicator={false}
        style={{ overflow: 'visible' }}
      >

        {/* ── Who ── */}
        <Island>
          <View style={sc.whoRow}>
            <View style={sc.avatar}>
              <Text style={sc.avatarEmoji}>{user.avatar}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={sc.userName}>{user.name}</Text>
              <Text style={sc.userOffers} numberOfLines={1}>
                Offers: {user.offers.join(', ')}
              </Text>
            </View>
          </View>
        </Island>

        {/* ── Verdict banner ── */}
        <Island accentBorder={v.color}>
          <View style={sc.verdictRow}>
            <Text style={sc.verdictEmoji}>{v.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[sc.verdictLabel, { color: v.color }]}>{v.label}</Text>
              <Text style={sc.verdictSub}>
                Overall score:{' '}
                <Text style={{ color: v.color, fontWeight: '900' }}>{pct(scores.total)}</Text>
              </Text>
            </View>
          </View>
        </Island>

        {/* ── How this score is built ── */}
        <SectionLabel label="HOW THIS SCORE IS BUILT" />
        <IngredientRow
          emoji="🧩"
          title="Skill Fit"
          blurb={sfBlurb(scores.sf, YOU, user)}
          value={scores.sf}
          color={C.teal}
          weight="34%"
        />
        <IngredientRow
          emoji="🛡️"
          title="Trust"
          blurb={tcBlurb(scores.tc, scores.tv)}
          value={scores.tc}
          color={C.tealDark}
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
          color={C.gold}
          weight="33%"
        />

        {/* ── Trust sub-breakdown ── */}
        <SectionLabel label="TRUST DETAIL" />
        <TrustDetails user={user} />

        {/* ── Formula toggle ── */}
        <SectionLabel label="FOR THE CURIOUS" />
        <View style={sc.formulaToggleWrap}>
          <View style={[sc.btnGlow, sc.btnGlowA]} />
          <View style={[sc.btnGlow, sc.btnGlowB]} />
          <View style={[sc.btnGlow, sc.btnGlowC]} />
          <Pressable
            onPress={toggleFormula}
            style={({ pressed }) => [sc.formulaToggle, pressed && { opacity: 0.88 }]}
            accessibilityLabel={showFormula ? 'Hide formula' : 'Show formula'}
            accessibilityRole="button"
          >
            <Text style={sc.formulaToggleText}>
              {showFormula ? '▲ Hide the math formula' : '▼ Show the math formula'}
            </Text>
          </Pressable>
        </View>

        {showFormula && <FormulaPanel scores={scores} user={user} />}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const sc = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bgDeep },
  bgLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg },

  // ── Nav ──
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    zIndex: 2,
  },
  backPillWrap: { position: 'relative', minWidth: 72 },
  backGlow: {
    position: 'absolute',
    left: 0, right: 0, top: 2, bottom: -2,
    borderRadius: 20,
    backgroundColor: C.glowOne,
    transform: [{ scale: 1.06 }],
  },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  backPillText: { fontSize: 13, fontWeight: '700', color: C.black },
  navTitle: { fontSize: 18, fontWeight: '800', color: C.black, letterSpacing: -0.2 },

  // ── Scroll ──
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },

  // ── Section label ──
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: C.blackSoft,
    letterSpacing: 1.4,
    marginTop: 4,
    marginBottom: 0,
    paddingHorizontal: 2,
  },

  // ── Who row ──
  whoRow:      { flexDirection: 'row', alignItems: 'center' },
  avatar:      {
    width: 52, height: 52,
    borderRadius: 26,
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderColor: C.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarEmoji: { fontSize: 26 },
  userName:    { fontSize: 20, fontWeight: '800', color: C.black, letterSpacing: -0.2 },
  userOffers:  { fontSize: 12, color: C.blackSoft, marginTop: 2 },

  // ── Verdict ──
  verdictRow:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  verdictEmoji: { fontSize: 32 },
  verdictLabel: { fontSize: 18, fontWeight: '900', marginBottom: 3 },
  verdictSub:   { fontSize: 13, color: C.blackMid },

  // ── Formula toggle — orange CTA ──
  formulaToggleWrap: { position: 'relative', marginTop: 4, marginBottom: 4 },
  btnGlow: { position: 'absolute', left: 8, right: 8, top: 4, bottom: -2, borderRadius: 8 },
  btnGlowA: { backgroundColor: C.orangeGlowA },
  btnGlowB: { backgroundColor: C.orangeGlowB, transform: [{ scale: 1.03 }] },
  btnGlowC: { backgroundColor: C.orangeGlowC, transform: [{ scale: 1.06 }] },
  formulaToggle: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: C.orange,
    alignItems: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  formulaToggleText: { fontSize: 13, fontWeight: '800', color: C.black },

  // ── Error ──
  errorState:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: C.bg },
  errorText:    { fontSize: 16, color: C.blackSoft },
  errorBtn:     {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 8,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  errorBtnText: { fontSize: 14, fontWeight: '700', color: C.black },
});
