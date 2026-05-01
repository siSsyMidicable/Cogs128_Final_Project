/**
 * SkillSwap — Match Hub
 *
 * Design philosophy (Norman + Sharp/Rogers/Preece):
 *   - Plain language leads. Math is progressive disclosure — opt-in, never forced.
 *   - Every number shown to a user has a sentence-level label before the digit.
 *   - The "Show Math" panel follows a 3-layer reveal:
 *       Layer 1 — What does this score MEAN? (plain English verdict)
 *       Layer 2 — Why? (3 visual ingredient bars with labels anyone can read)
 *       Layer 3 — The actual formula (opt-in "Show Formula" inside the panel)
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
  UIManager,
  LayoutAnimation,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { router } from 'expo-router';
import { useUser } from '@/lib/auth/auth';
import {
  matchScore,
  useMatchingState,
  trustComponents,
  whyThisMatch,
  type MatchUser,
  type MatchScoreBreakdown,
  type ProofField,
} from '@/lib/matching/matching';
import { YOU, MOCK_USERS } from '@/lib/matching/data';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MONO: any = Platform.OS === 'ios' ? 'Courier' : 'monospace';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function pct(v: number) { return `${Math.round(v * 100)}%`; }

/** Turn a 0–1 score into a human verdict + emoji */
function verdict(v: number): { emoji: string; label: string; color: string } {
  if (v >= 0.80) return { emoji: '🔥', label: 'Excellent match',   color: '#61d8cc' };
  if (v >= 0.65) return { emoji: '✅', label: 'Good match',        color: '#6daa45' };
  if (v >= 0.45) return { emoji: '🤝', label: 'Decent match',      color: '#FFD166' };
  return           { emoji: '⚠️', label: 'Weak match',            color: '#EF767A' };
}

/** Describe the SkillFit number in plain English */
function sfBlurb(sf: number, you: MatchUser, other: MatchUser): string {
  const theyGiveYou = other.offers.filter(s => you.requests.includes(s));
  const youGiveThem = you.offers.filter(s => other.requests.includes(s));
  if (sf >= 0.75) return `Great overlap — you each cover most of what the other needs.`;
  if (sf >= 0.4)  return `Partial overlap — ${theyGiveYou.length > 0 ? `they offer ${theyGiveYou[0]}` : 'you cover some of their needs'}.`;
  return `Low overlap — skills don't line up well right now.`;
}

/** Describe TrustCompat in plain English */
function tcBlurb(tc: number, tv: number): string {
  if (tc >= 0.80) return `Both of you have strong track records. High confidence.`;
  if (tc >= 0.55) return `Reasonable trust on both sides. Worth a first swap.`;
  if (tv < 0.4)   return `Their trust score is low — review their portfolio first.`;
  return `Limited history on one or both sides. Start small.`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SwapIcon({ size = 18, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 8h14M14 5l3 3-3 3" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 16H7M10 13l-3 3 3 3" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HistoryIcon({ size = 16, color = '#61d8cc' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3v18" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Circle cx={8} cy={8} r={2} stroke={color} strokeWidth={1.75} />
      <Path d="M10 8h2" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Circle cx={16} cy={14} r={2} stroke={color} strokeWidth={1.75} />
      <Path d="M12 14h2" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Circle cx={12} cy={3} r={1} fill={color} />
      <Circle cx={12} cy={21} r={1} fill={color} />
    </Svg>
  );
}

function SaveSkillIcon({ size = 16, color = '#394140', filled = false }: { size?: number; color?: string; filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
        stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}

function NegotiateIcon({ size = 18, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7l-4 3V6z" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M14 9h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2l-3 2.5V10" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
    </Svg>
  );
}

function VerifiedIcon({ size = 13, color = '#4f98a3' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L22 12 12 22 2 12 12 2z" stroke={color} strokeWidth={1.75} strokeLinejoin="round" fill="none" />
      <Path d="M8.5 12l2.5 2.5 4.5-4.5" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TransparencyReviewIcon({ size = 15, color = '#a8c5c2' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3h10l3 3v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M15 3v3h3" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M8 9h5" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M8 12h7" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M8 15l1 1 2-2" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── ScoreBar ──────────────────────────────────────────────────────────────────

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={s.barTrack}>
      <View style={[s.barFill, { width: pct(value) as any, backgroundColor: color }]} />
    </View>
  );
}

// ─── Chip ──────────────────────────────────────────────────────────────────────

function Chip({ label, variant }: { label: string; variant: 'offer' | 'request' | 'match' }) {
  const bg = variant === 'offer' ? '#1f4642' : variant === 'request' ? '#FF8C42' : '#61d8cc';
  const fg = variant === 'offer' ? '#61d8cc' : '#000';
  return (
    <View style={[s.chip, { backgroundColor: bg }]}>
      <Text style={[s.chipText, { color: fg }]}>{label}</Text>
    </View>
  );
}

// ─── IngredientBar ─────────────────────────────────────────────────────────────
// The primary user-facing explanation of a score component.
// Label + plain sentence + visual bar + percentage. No symbols.

function IngredientBar({
  emoji, title, blurb, value, color,
}: {
  emoji: string; title: string; blurb: string; value: number; color: string;
}) {
  return (
    <View style={ing.row}>
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
      <ScoreBar value={value} color={color} />
    </View>
  );
}

const ing = StyleSheet.create({
  row:      { marginBottom: 14 },
  top:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 5 },
  emoji:    { fontSize: 20, marginTop: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:    { fontSize: 14, fontWeight: '800', color: '#e8ebe5' },
  pct:      { fontSize: 15, fontWeight: '900' },
  blurb:    { fontSize: 12, color: '#9ab5b2', lineHeight: 17, marginTop: 2 },
});

// ─── FormulaPanel ─────────────────────────────────────────────────────────────
// Layer 3: the actual notation. Hidden by default, opt-in via "Show Formula".
// Every symbol is annotated inline so it's self-explanatory.

function FormulaPanel({ scores, user }: { scores: MatchScoreBreakdown; user: MatchUser }) {
  const comp = trustComponents(user);
  return (
    <View style={fp.container}>
      <Text style={fp.sectionLabel}>OVERALL SCORE</Text>
      <Text style={fp.formula}>M(you, {user.name})</Text>
      <Text style={fp.def}>= 0.34 × SF  +  0.33 × TC  +  0.33 × F</Text>
      <Text style={fp.anno}>Each piece is weighted roughly equally.</Text>
      <Text style={fp.anno}>SF gets a tiny edge because skill fit matters most.</Text>

      <View style={fp.divider} />

      <Text style={fp.sectionLabel}>SKILL FIT  SF = {scores.sf.toFixed(3)}</Text>
      <Text style={fp.formula}>SF = ( |O(you)∩R({user.name})| / |R({user.name})|</Text>
      <Text style={fp.formula}>       +  |O({user.name})∩R(you)| / |R(you)| ) / 2</Text>
      <Text style={fp.anno}>O(u) = skills u offers  |  R(u) = skills u needs</Text>
      <Text style={fp.anno}>∩  = "overlap between" — items in both lists</Text>
      <Text style={fp.anno}>|·| = count of items in a set</Text>

      <View style={fp.divider} />

      <Text style={fp.sectionLabel}>TRUST COMPATIBILITY  TC = {scores.tc.toFixed(3)}</Text>
      <Text style={fp.formula}>TC = √( T(you) × T({user.name}) )</Text>
      <Text style={fp.formula}>   = √( {scores.tu.toFixed(3)} × {scores.tv.toFixed(3)} )</Text>
      <Text style={fp.anno}>√ = square root (geometric mean).</Text>
      <Text style={fp.anno}>Why not just average? If one trust score is 0,</Text>
      <Text style={fp.anno}>the whole product is 0. One bad actor tanks the swap.</Text>

      <View style={fp.divider} />

      <Text style={fp.sectionLabel}>TRUST SCORE  T(u) components</Text>
      <Text style={fp.formula}>T(u) = 0.2P + 0.3R̂ + 0.2V̂ + 0.2C + 0.1Q</Text>
      {[
        { sym: 'P',  label: 'Portfolio quality',        val: comp.P.value,    w: '0.2' },
        { sym: 'R̂',  label: 'Average rating (1–5→0–1)', val: comp.Rhat.value, w: '0.3' },
        { sym: 'V̂',  label: 'Verification level',       val: comp.Vhat.value, w: '0.2' },
        { sym: 'C',  label: 'Consistency of past swaps', val: comp.C.value,   w: '0.2' },
        { sym: 'Q',  label: 'Communication speed',       val: comp.Q.value,   w: '0.1' },
      ].map(r => (
        <Text key={r.sym} style={fp.anno}>
          {r.sym.padEnd(3)} ({r.label}) = {r.val.toFixed(2)}  ×{r.w}
        </Text>
      ))}
      <Text style={[fp.anno, { marginTop: 4 }]}>
        T(you) = {scores.tu.toFixed(3)}  |  T({user.name}) = {scores.tv.toFixed(3)}
      </Text>

      <View style={fp.divider} />

      <Text style={fp.sectionLabel}>FAIRNESS  F = {scores.fair.toFixed(3)}</Text>
      <Text style={fp.formula}>F = 0.35·onTime + 0.35·scopeMatch</Text>
      <Text style={fp.formula}>  + 0.15·evidence + 0.15·wouldSwapAgain</Text>
      <Text style={fp.anno}>Set by the 4 proof checkboxes after a swap completes.</Text>
      <Text style={fp.anno}>Default = 1.0 until a swap is recorded.</Text>

      <View style={fp.divider} />

      <Text style={fp.sectionLabel}>FINAL CALCULATION</Text>
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
  container:    { paddingTop: 8, paddingBottom: 4 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: '#607876', letterSpacing: 1.4, marginBottom: 4, marginTop: 4 },
  formula:      { fontFamily: MONO, fontSize: 12, color: '#cde0de', lineHeight: 19 },
  def:          { fontFamily: MONO, fontSize: 12, color: '#a8c5c2', lineHeight: 19 },
  anno:         { fontFamily: MONO, fontSize: 11, color: '#607876', lineHeight: 17, marginLeft: 4 },
  divider:      { height: 1, backgroundColor: '#2f4a47', marginVertical: 8 },
});

// ─── MathPanel ────────────────────────────────────────────────────────────────
// Redesigned information architecture:
//   1. Verdict card   — one sentence, emoji, color-coded
//   2. 3 ingredient bars — plain English, no symbols
//   3. "Show Formula" toggle — opens FormulaPanel with annotated notation

function MathPanel({ scores, you, user }: { scores: MatchScoreBreakdown; you: MatchUser; user: MatchUser }) {
  const [showFormula, setShowFormula] = useState(false);
  const v = verdict(scores.total);

  function toggleFormula() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFormula(f => !f);
  }

  return (
    <View style={mp.panel}>
      {/* ── Layer 1: Verdict ── */}
      <View style={[mp.verdictCard, { borderColor: v.color }]}>
        <Text style={mp.verdictEmoji}>{v.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[mp.verdictLabel, { color: v.color }]}>{v.label}</Text>
          <Text style={mp.verdictScore}>
            Overall match score: <Text style={{ color: v.color, fontWeight: '900' }}>{pct(scores.total)}</Text>
          </Text>
        </View>
      </View>

      {/* ── Layer 2: Plain-English Ingredient Bars ── */}
      <Text style={mp.sectionHeader}>HOW THIS SCORE IS BUILT</Text>

      <IngredientBar
        emoji="🧩"
        title="Skill Fit"
        blurb={sfBlurb(scores.sf, you, user)}
        value={scores.sf}
        color="#61d8cc"
      />
      <IngredientBar
        emoji="🛡️"
        title="Trust"
        blurb={tcBlurb(scores.tc, scores.tv)}
        value={scores.tc}
        color="#4f98a3"
      />
      <IngredientBar
        emoji="⚖️"
        title="Past Fairness"
        blurb={
          scores.fair >= 1.0
            ? `No completed swaps yet — defaults to full score.`
            : scores.fair >= 0.7
            ? `Past swaps were mostly fair based on delivery and scope.`
            : `Past swaps had some issues. Check their history before committing.`
        }
        value={scores.fair}
        color="#FFD166"
      />

      <Text style={mp.weightNote}>
        Weights: Skill Fit 34% · Trust 33% · Past Fairness 33%
      </Text>

      {/* ── Layer 3: Formula toggle ── */}
      <Pressable onPress={toggleFormula} style={mp.formulaToggle}>
        <Text style={mp.formulaToggleText}>
          {showFormula ? '▲ Hide Formula' : '▼ Show Formula  (discrete math notation)'}
        </Text>
      </Pressable>

      {showFormula && <FormulaPanel scores={scores} user={user} />}
    </View>
  );
}

const mp = StyleSheet.create({
  panel:          { backgroundColor: '#1c2424', borderTopWidth: 1, borderTopColor: '#2f3333', padding: 14 },
  verdictCard:    {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, padding: 12, marginBottom: 16, backgroundColor: '#131b1b',
  },
  verdictEmoji:   { fontSize: 28 },
  verdictLabel:   { fontSize: 16, fontWeight: '900', marginBottom: 2 },
  verdictScore:   { fontSize: 13, color: '#9ab5b2' },
  sectionHeader:  { fontSize: 9, fontWeight: '800', color: '#607876', letterSpacing: 1.4, marginBottom: 12 },
  weightNote:     {
    fontSize: 11, color: '#607876', textAlign: 'center',
    marginTop: 4, marginBottom: 10, fontStyle: 'italic',
  },
  formulaToggle:  {
    borderWidth: 1, borderColor: '#2f4a47', paddingVertical: 9,
    paddingHorizontal: 12, backgroundColor: '#131b1b', marginTop: 2,
  },
  formulaToggleText: { fontSize: 12, fontWeight: '700', color: '#4f98a3' },
});

// ─── TrustBreakdown ───────────────────────────────────────────────────────────

function TrustBreakdown({ user }: { user: MatchUser }) {
  const comp = trustComponents(user);
  const rows: { label: string; sym: string; weight: number; value: number }[] = [
    { label: 'Portfolio',     sym: 'P',  weight: comp.P.weight,    value: comp.P.value },
    { label: 'Avg Rating',    sym: 'R̂',  weight: comp.Rhat.weight, value: comp.Rhat.value },
    { label: 'Verification',  sym: 'V̂',  weight: comp.Vhat.weight, value: comp.Vhat.value },
    { label: 'Consistency',   sym: 'C',  weight: comp.C.weight,    value: comp.C.value },
    { label: 'Communication', sym: 'Q',  weight: comp.Q.weight,    value: comp.Q.value },
  ];
  return (
    <View style={s.trustBreakdown}>
      <Text style={s.trustBreakdownTitle}>How is their trust calculated?</Text>
      {rows.map(r => (
        <View key={r.sym} style={s.trustBreakdownRow}>
          <Text style={s.trustBreakdownSym}>{r.sym}</Text>
          <Text style={s.trustBreakdownLabel}>{r.label}</Text>
          <View style={s.barTrack}>
            <View style={[s.barFill, { width: pct(r.value) as any, backgroundColor: '#4f98a3' }]} />
          </View>
          <Text style={s.trustBreakdownVal}>{r.value.toFixed(2)}</Text>
          <Text style={s.trustBreakdownWeight}>×{r.weight}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── WhyCard ──────────────────────────────────────────────────────────────────

function WhyCard({ you, other, scores }: { you: MatchUser; other: MatchUser; scores: MatchScoreBreakdown }) {
  const text = useMemo(() => whyThisMatch(you, other, scores), [you, other, scores]);
  return (
    <View style={s.whyCard}>
      <Text style={s.whyLabel}>WHY THIS MATCH</Text>
      <Text style={s.whyText}>{text}</Text>
    </View>
  );
}

// ─── CompletionModal ──────────────────────────────────────────────────────────

type CompletionModalProps = {
  visible: boolean;
  partner: MatchUser | null;
  currentUser: MatchUser;
  onClose: () => void;
  onSubmit: (given: string, received: string, proof: ProofField) => void;
};

function CompletionModal({ visible, partner, currentUser, onClose, onSubmit }: CompletionModalProps) {
  const [given, setGiven]       = useState('');
  const [received, setReceived] = useState('');
  const [proof, setProof]       = useState<ProofField>({
    deliveredOnTime: false, scopeMatchedAgreement: false,
    portfolioEvidenceAttached: false, wouldSwapAgain: false, notes: '',
  });

  const toggle = (key: keyof Omit<ProofField, 'notes'>) =>
    setProof(p => ({ ...p, [key]: !p[key] }));

  const fairness =
    (proof.deliveredOnTime ? 0.35 : 0) +
    (proof.scopeMatchedAgreement ? 0.35 : 0) +
    (proof.portfolioEvidenceAttached ? 0.15 : 0) +
    (proof.wouldSwapAgain ? 0.15 : 0);

  function handleSubmit() {
    if (!given.trim() || !received.trim()) return;
    onSubmit(given.trim(), received.trim(), proof);
    setGiven(''); setReceived('');
    setProof({ deliveredOnTime: false, scopeMatchedAgreement: false,
               portfolioEvidenceAttached: false, wouldSwapAgain: false, notes: '' });
  }

  if (!partner) return null;

  const checks: { key: keyof Omit<ProofField, 'notes'>; label: string; desc: string; weight: string }[] = [
    { key: 'deliveredOnTime',           label: 'Delivered on time',            desc: 'They showed up and finished when promised.',      weight: '×0.35' },
    { key: 'scopeMatchedAgreement',     label: 'Scope matched our agreement',  desc: 'The skill they taught was what we agreed on.',    weight: '×0.35' },
    { key: 'portfolioEvidenceAttached', label: 'Portfolio / evidence attached', desc: 'There\'s a link or file proving the work.',      weight: '×0.15' },
    { key: 'wouldSwapAgain',            label: 'Would swap again',              desc: 'Overall I\'d recommend this person.',            weight: '×0.15' },
  ];

  // Plain-English fairness label
  const fairLabel =
    fairness >= 0.85 ? 'Excellent — their trust score will go up.' :
    fairness >= 0.65 ? 'Good swap recorded.' :
    fairness >= 0.35 ? 'Partial — some issues noted.' :
    'Poor swap — trust score will reflect this.';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.handle} />

          <View style={modal.titleRow}>
            <SwapIcon size={20} color="#61d8cc" />
            <Text style={modal.title}>Complete Swap with {partner.name}</Text>
          </View>

          <Text style={modal.subtitle}>
            Instead of a star rating, SkillSwap uses 4 checkboxes that are harder to fake.
            Each one feeds directly into their trust score.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={modal.fieldLabel}>Skill you gave</Text>
            <TextInput style={modal.input} value={given} onChangeText={setGiven}
              placeholder={currentUser.offers[0] ?? 'e.g. Web Dev'} placeholderTextColor="#607876" />

            <Text style={modal.fieldLabel}>Skill you received</Text>
            <TextInput style={modal.input} value={received} onChangeText={setReceived}
              placeholder={partner.offers[0] ?? 'e.g. Graphic Design'} placeholderTextColor="#607876" />

            <View style={modal.proofHeader}>
              <TransparencyReviewIcon size={15} color="#a8c5c2" />
              <Text style={[modal.fieldLabel, { marginTop: 0, marginLeft: 6, marginBottom: 0 }]}>
                How did it go?
              </Text>
            </View>
            <Text style={modal.proofSubtitle}>Check everything that is true.</Text>

            {checks.map(c => (
              <Pressable key={c.key}
                style={[modal.checkRow, proof[c.key] && modal.checkRowActive]}
                onPress={() => toggle(c.key)}>
                <View style={[modal.checkbox, proof[c.key] && modal.checkboxChecked]}>
                  {proof[c.key] && <Text style={modal.checkmark}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={modal.checkLabel}>{c.label}</Text>
                  <Text style={modal.checkDesc}>{c.desc}</Text>
                </View>
                <Text style={modal.checkWeight}>{c.weight}</Text>
              </Pressable>
            ))}

            {/* Live fairness verdict */}
            <View style={[modal.fairnessRow, { borderColor: fairness >= 0.65 ? '#61d8cc' : fairness >= 0.35 ? '#FFD166' : '#EF767A' }]}>
              <View style={{ flex: 1 }}>
                <Text style={modal.fairnessTitle}>Fairness score</Text>
                <Text style={modal.fairnessBlurb}>{fairLabel}</Text>
              </View>
              <Text style={[modal.fairnessValue, {
                color: fairness >= 0.65 ? '#61d8cc' : fairness >= 0.35 ? '#FFD166' : '#EF767A'
              }]}>{pct(fairness)}</Text>
            </View>

            <Text style={modal.fieldLabel}>Notes (optional)</Text>
            <TextInput style={[modal.input, { height: 72, textAlignVertical: 'top' }]}
              value={proof.notes} onChangeText={t => setProof(p => ({ ...p, notes: t }))}
              placeholder="Context, evidence links, etc." placeholderTextColor="#607876" multiline />

            <View style={modal.actions}>
              <Pressable style={modal.cancelBtn} onPress={onClose}>
                <Text style={modal.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[modal.submitBtn, (!given.trim() || !received.trim()) && modal.submitBtnDisabled]}
                onPress={handleSubmit} disabled={!given.trim() || !received.trim()}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <SwapIcon size={16} color="#000" />
                  <Text style={modal.submitBtnText}>Submit</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── MatchCard ────────────────────────────────────────────────────────────────

function MatchCard({
  user, currentUser, connections, completed, requests, request, connect, onComplete,
}: {
  user: MatchUser; currentUser: MatchUser;
  connections: Set<string>; completed: Set<string>; requests: Set<string>;
  request: (id: string) => void; connect: (id: string) => void;
  onComplete: (partner: MatchUser) => void;
}) {
  const [showMath,  setShowMath]  = useState(false);
  const [showTrust, setShowTrust] = useState(false);
  const [saved, setSaved]         = useState(false);
  const scores = useMemo(() => matchScore(currentUser, user), [user, currentUser]);

  const isConnected = connections.has(user.id);
  const isRequested = requests.has(user.id);
  const isDone      = completed.has(user.id);

  const v = verdict(scores.total);
  const youCoverTheirNeeds = currentUser.offers.filter(s => user.requests.includes(s));
  const theyCoverYourNeeds = user.offers.filter(s => currentUser.requests.includes(s));

  function toggle(setter: React.Dispatch<React.SetStateAction<boolean>>) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(prev => !prev);
  }

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.cardHeader}>
        <View style={s.avatarBox}>
          <Text style={s.avatarEmoji}>{user.avatar}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={s.nameRow}>
            <Text style={s.cardName}>{user.name}</Text>
            <VerifiedIcon size={13} color="#4f98a3" />
          </View>
          <Text style={s.cardOffersLine} numberOfLines={1}>
            Offers: {user.offers.join(', ')}
          </Text>
        </View>
        <Pressable onPress={() => setSaved(sv => !sv)} style={s.saveBtn}
          accessibilityLabel={saved ? 'Unsave' : 'Save'}>
          <SaveSkillIcon size={18} color={saved ? '#61d8cc' : '#394140'} filled={saved} />
        </Pressable>
        {/* Score badge — verdict color, plain percentage, no symbols */}
        <View style={[s.scoreBadge, { borderColor: v.color }]}>
          <Text style={s.scoreBadgeEmoji}>{v.emoji}</Text>
          <Text style={[s.scoreBadgeText, { color: v.color }]}>{pct(scores.total)}</Text>
        </View>
      </View>

      {/* Skill overlap chips */}
      {theyCoverYourNeeds.length > 0 && (
        <View style={s.highlightRow}>
          <Text style={s.highlightLabel}>✓ They teach what you need: </Text>
          <View style={s.chipRow}>
            {theyCoverYourNeeds.map(sk => <Chip key={sk} label={sk} variant="match" />)}
          </View>
        </View>
      )}
      {youCoverTheirNeeds.length > 0 && (
        <View style={s.highlightRow}>
          <Text style={s.highlightLabel}>✓ You teach what they need: </Text>
          <View style={s.chipRow}>
            {youCoverTheirNeeds.map(sk => <Chip key={sk} label={sk} variant="offer" />)}
          </View>
        </View>
      )}
      {theyCoverYourNeeds.length === 0 && youCoverTheirNeeds.length === 0 && (
        <Text style={s.noOverlap}>— No direct skill overlap</Text>
      )}

      <WhyCard you={currentUser} other={user} scores={scores} />

      {/* Score bars — label on top, tappable Trust row */}
      <View style={s.barsSection}>
        <View style={s.barRow}>
          <Text style={s.barLabel}>Skill Fit</Text>
          <ScoreBar value={scores.sf} color="#61d8cc" />
          <Text style={s.barValue}>{pct(scores.sf)}</Text>
        </View>
        <Pressable onPress={() => toggle(setShowTrust)} style={s.barRow}>
          <View style={s.barLabelRow}>
            <VerifiedIcon size={11} color="#4f98a3" />
            <Text style={[s.barLabel, s.barLabelTappable]}>Trust▾</Text>
          </View>
          <ScoreBar value={scores.tc} color="#4f98a3" />
          <Text style={s.barValue}>{pct(scores.tc)}</Text>
        </Pressable>
        {showTrust && <TrustBreakdown user={user} />}
        <View style={s.barRow}>
          <Text style={s.barLabel}>Match </Text>
          <ScoreBar value={scores.total} color={v.color} />
          <Text style={s.barValue}>{pct(scores.total)}</Text>
        </View>
      </View>

      {/* Math toggle — relabeled to remove jargon */}
      <Pressable onPress={() => toggle(setShowMath)} style={s.mathToggle}>
        <Text style={s.mathToggleText}>
          {showMath ? '▲ Hide score breakdown' : `▼ How was ${pct(scores.total)} calculated?`}
        </Text>
      </Pressable>
      {showMath && <MathPanel scores={scores} you={currentUser} user={user} />}

      {/* Action row */}
      <View style={s.actionRow}>
        {isDone ? (
          <View style={[s.actionBtn, s.doneBtn]}>
            <Text style={s.actionBtnText}>✓ Swap Completed</Text>
          </View>
        ) : isConnected ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={[s.actionBtn, s.connectedBtn, { flex: 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <NegotiateIcon size={16} color="#1f4642" />
                <Text style={s.actionBtnText}>Connected</Text>
              </View>
            </View>
            <Pressable style={[s.actionBtn, s.completeBtn, { flex: 1 }]} onPress={() => onComplete(user)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <SwapIcon size={16} color="#000" />
                <Text style={s.actionBtnText}>Complete Swap</Text>
              </View>
            </Pressable>
          </View>
        ) : isRequested ? (
          <Pressable style={[s.actionBtn, s.acceptBtn]} onPress={() => connect(user.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SwapIcon size={16} color="#000" />
              <Text style={s.actionBtnText}>Accept Match</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable style={[s.actionBtn, s.requestBtn]} onPress={() => request(user.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SwapIcon size={16} color="#000" />
              <Text style={s.actionBtnText}>Request Match</Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MatchHub() {
  const { data: authUser } = useUser();
  const { connections, requests, completed, request, connect, complete } = useMatchingState();
  const [completionTarget, setCompletionTarget] = useState<MatchUser | null>(null);

  const sortedUsers = useMemo(
    () =>
      [...MOCK_USERS]
        .map(u => ({ user: u, score: matchScore(YOU, u).total }))
        .sort((a, b) => b.score - a.score)
        .map(({ user }) => user),
    [],
  );

  const pending = MOCK_USERS.length - connections.size - requests.size - completed.size;

  const handleComplete     = useCallback((partner: MatchUser) => setCompletionTarget(partner), []);
  const handleSubmitCompletion = useCallback(
    (given: string, received: string, proof: ProofField) => {
      if (!completionTarget) return;
      complete(completionTarget, YOU, given, received, proof);
      setCompletionTarget(null);
    },
    [completionTarget, complete],
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={s.header}>
        <View>
          <Text style={s.headerEyebrow}>SKILLSWAP</Text>
          <Text style={s.headerTitle}>Skill Matches</Text>
          {authUser && <Text style={s.headerSub}>Signed in as {authUser.name}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: '#61d8cc' }]}>{connections.size}</Text>
              <Text style={s.statLabel}>Connected</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: '#FF8C42' }]}>{requests.size}</Text>
              <Text style={s.statLabel}>Requested</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: '#FFD166' }]}>{pending}</Text>
              <Text style={s.statLabel}>Pending</Text>
            </View>
          </View>
          <Pressable style={s.historyBtn} onPress={() => router.push('/transaction/history')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <HistoryIcon size={14} color="#61d8cc" />
              <Text style={s.historyBtnText}>History ({completed.size})</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View style={s.yourProfile}>
        <Text style={s.yourProfileTitle}>Your Skills</Text>
        <View style={s.chipRow}>
          <Text style={s.chipGroupLabel}>Offers  </Text>
          {YOU.offers.map(sk => <Chip key={sk} label={sk} variant="offer" />)}
        </View>
        <View style={[s.chipRow, { marginTop: 6 }]}>
          <Text style={s.chipGroupLabel}>Wants   </Text>
          {YOU.requests.map(sk => <Chip key={sk} label={sk} variant="request" />)}
        </View>
      </View>

      <FlatList
        data={sortedUsers}
        keyExtractor={u => u.id}
        renderItem={({ item }) => (
          <MatchCard
            user={item} currentUser={YOU}
            connections={connections} completed={completed} requests={requests}
            request={request} connect={connect} onComplete={handleComplete}
          />
        )}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      />

      <CompletionModal
        visible={completionTarget !== null} partner={completionTarget}
        currentUser={YOU} onClose={() => setCompletionTarget(null)}
        onSubmit={handleSubmitCompletion}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#d6d8d3' },
  header: {
    backgroundColor: '#ececea', borderBottomWidth: 2, borderBottomColor: '#2f3333',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  headerEyebrow: { fontSize: 11, fontWeight: '700', color: '#434948', letterSpacing: 1.4 },
  headerTitle:   { fontSize: 24, fontWeight: '800', color: '#101414' },
  headerSub:     { fontSize: 12, color: '#394140', marginTop: 2 },
  statsRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statBox:       { alignItems: 'center', minWidth: 52 },
  statNum:       { fontSize: 22, fontWeight: '800' },
  statLabel:     { fontSize: 10, color: '#434948', fontWeight: '600', letterSpacing: 0.4 },
  statDivider:   { width: 1, height: 28, backgroundColor: '#2f3333', marginHorizontal: 6 },
  historyBtn:    { backgroundColor: '#2f3333', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 },
  historyBtnText: { fontSize: 12, fontWeight: '800', color: '#61d8cc' },
  yourProfile:   {
    backgroundColor: '#f3f4f1', borderBottomWidth: 2, borderBottomColor: '#2f3333',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  yourProfileTitle: { fontSize: 11, fontWeight: '700', color: '#434948', letterSpacing: 1.2, marginBottom: 6 },
  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  chipGroupLabel: { fontSize: 11, fontWeight: '700', color: '#2f3333', width: 44 },
  chip:          { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  chipText:      { fontSize: 12, fontWeight: '700' },
  list:          { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 32, gap: 14 },
  card:          {
    backgroundColor: '#f3f4f1', borderWidth: 2, borderColor: '#2f3333',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  cardHeader:    {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderBottomWidth: 1, borderBottomColor: '#d0d2ce',
  },
  nameRow:       { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  avatarBox:     {
    width: 44, height: 44, backgroundColor: '#61d8cc',
    borderWidth: 2, borderColor: '#1f4642',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji:   { fontSize: 22 },
  cardName:      { fontSize: 17, fontWeight: '800', color: '#101414' },
  cardOffersLine: { fontSize: 12, color: '#394140', marginTop: 1 },
  saveBtn:       { padding: 6, marginRight: 4 },
  scoreBadge:    {
    borderWidth: 2, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4,
    alignItems: 'center', justifyContent: 'center', minWidth: 54,
  },
  scoreBadgeEmoji: { fontSize: 13, marginBottom: 1 },
  scoreBadgeText:  { fontSize: 14, fontWeight: '900' },
  highlightRow:  {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 8, gap: 4,
  },
  highlightLabel: { fontSize: 12, fontWeight: '700', color: '#2a8780' },
  noOverlap:     { fontSize: 12, color: '#888', paddingHorizontal: 12, paddingTop: 8, fontStyle: 'italic' },
  whyCard:       {
    backgroundColor: '#e8ebe5', borderTopWidth: 1, borderTopColor: '#d0d2ce',
    paddingHorizontal: 12, paddingVertical: 8, marginTop: 4,
  },
  whyLabel:      { fontSize: 9, fontWeight: '800', color: '#607876', letterSpacing: 1.3, marginBottom: 3 },
  whyText:       { fontSize: 13, color: '#2f3333', lineHeight: 19 },
  barsSection:   { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6, gap: 6 },
  barRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabelRow:   { flexDirection: 'row', alignItems: 'center', gap: 3, width: 60 },
  barLabel:      { fontSize: 11, fontWeight: '700', color: '#2f3333', width: 60 },
  barLabelTappable: { color: '#1f4642', textDecorationLine: 'underline' },
  barTrack:      { flex: 1, height: 8, backgroundColor: '#d0d2ce', borderRadius: 2, overflow: 'hidden' },
  barFill:       { height: '100%', borderRadius: 2 },
  barValue:      { fontSize: 11, fontWeight: '700', color: '#2f3333', width: 36, textAlign: 'right' },
  trustBreakdown: {
    backgroundColor: '#1c2424', paddingHorizontal: 12, paddingVertical: 10,
    marginTop: 2, gap: 5,
  },
  trustBreakdownTitle: { fontSize: 12, color: '#a8c5c2', fontWeight: '700', marginBottom: 6 },
  trustBreakdownRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustBreakdownSym:   { fontSize: 12, fontWeight: '800', color: '#61d8cc', width: 20, fontFamily: MONO },
  trustBreakdownLabel: { fontSize: 11, color: '#a8c5c2', width: 100 },
  trustBreakdownVal:   { fontSize: 11, color: '#61d8cc', fontWeight: '700', width: 32, textAlign: 'right', fontFamily: MONO },
  trustBreakdownWeight: { fontSize: 10, color: '#607876', width: 28, fontFamily: MONO },
  mathToggle:    {
    borderTopWidth: 1, borderTopColor: '#d0d2ce',
    paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#e8ebe5',
  },
  mathToggleText: { fontSize: 12, fontWeight: '700', color: '#1f4642' },
  actionRow:     { borderTopWidth: 1, borderTopColor: '#d0d2ce', padding: 10 },
  actionBtn:     { paddingVertical: 11, alignItems: 'center', borderWidth: 2, flex: 1 },
  actionBtnText: { fontSize: 15, fontWeight: '800', color: '#000' },
  requestBtn:    { backgroundColor: '#61d8cc', borderColor: '#1f4642' },
  acceptBtn:     { backgroundColor: '#FF8C42', borderColor: '#7a3a10' },
  connectedBtn:  { backgroundColor: '#d0f0ec', borderColor: '#2a8780' },
  completeBtn:   { backgroundColor: '#FFD166', borderColor: '#8a6800' },
  doneBtn:       { backgroundColor: '#e8ebe5', borderColor: '#999' },
});

const modal = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:         {
    backgroundColor: '#1c2424', borderTopWidth: 2, borderTopColor: '#61d8cc',
    borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '90%',
  },
  handle:        { width: 40, height: 4, backgroundColor: '#607876', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  titleRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  title:         { fontSize: 18, fontWeight: '900', color: '#61d8cc' },
  subtitle:      { fontSize: 12, color: '#9ab5b2', marginBottom: 16, lineHeight: 18 },
  fieldLabel:    { fontSize: 11, fontWeight: '700', color: '#a8c5c2', letterSpacing: 0.8, marginBottom: 6, marginTop: 16 },
  input:         {
    backgroundColor: '#131b1b', borderWidth: 1, borderColor: '#2f4a47',
    color: '#fff', padding: 10, fontSize: 14, marginBottom: 4, fontFamily: MONO,
  },
  proofHeader:   {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2f4a47', marginBottom: 4,
  },
  proofSubtitle: { fontSize: 11, color: '#607876', fontStyle: 'italic', marginBottom: 10 },
  checkRow:      {
    flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 6,
    borderWidth: 1, borderColor: '#2f4a47', backgroundColor: '#131b1b', gap: 10,
  },
  checkRowActive:   { borderColor: '#61d8cc', backgroundColor: '#1f3530' },
  checkbox:         { width: 22, height: 22, borderWidth: 2, borderColor: '#607876', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked:  { borderColor: '#61d8cc', backgroundColor: '#61d8cc' },
  checkmark:        { fontSize: 13, fontWeight: '900', color: '#000' },
  checkLabel:       { fontSize: 14, color: '#ccc', fontWeight: '700' },
  checkDesc:        { fontSize: 11, color: '#607876', marginTop: 1 },
  checkWeight:      { fontSize: 11, color: '#607876', fontFamily: MONO },
  fairnessRow:      {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#131b1b', borderWidth: 2,
    padding: 12, marginVertical: 12,
  },
  fairnessTitle:    { fontSize: 11, fontWeight: '700', color: '#a8c5c2', marginBottom: 3 },
  fairnessBlurb:    { fontSize: 12, color: '#607876' },
  fairnessValue:    { fontSize: 28, fontWeight: '900' },
  actions:          { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 20 },
  cancelBtn:        { flex: 1, padding: 14, borderWidth: 2, borderColor: '#2f4a47', alignItems: 'center' },
  cancelBtnText:    { fontSize: 14, fontWeight: '700', color: '#607876' },
  submitBtn:        { flex: 2, padding: 14, backgroundColor: '#61d8cc', borderWidth: 2, borderColor: '#1f4642', alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#2f4a47', borderColor: '#2f4a47' },
  submitBtnText:    { fontSize: 14, fontWeight: '900', color: '#000' },
});
