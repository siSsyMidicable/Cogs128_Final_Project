/**
 * SkillSwap — Swap History  (Atelier Redesign)
 *
 * Design language: teal-glass world from intro + login screens.
 * Floating illusion achieved via:
 *   – layered white-glow halos behind every card  (cardGlowOne/Two)
 *   – deep shadow underneath  (shadowOpacity 0.22, radius 14)
 *   – semi-transparent glass surface  rgba(255,255,255,0.55)
 *   – teal ambient background so cards appear to hover in air
 *   – subtle scale-up on press (no translation, pure perceptual lift)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon } from 'react-native-svg';
import { router } from 'expo-router';
import {
  useHistoryState,
  trustImpactTags,
  type HistoryRecord,
  type MatchScoreBreakdown,
} from '@/lib/matching/matching';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Palette (exact match to intro + login) ───────────────────────────────────
const C = {
  bg:           '#7DE5E5',
  bgDeep:       '#8FEBE5',
  glass:        'rgba(255,255,255,0.55)',
  glassBorder:  'rgba(255,255,255,0.45)',
  glowOne:      'rgba(255,255,255,0.22)',
  glowTwo:      'rgba(255,255,255,0.15)',
  black:        '#000000',
  blackMid:     'rgba(0,0,0,0.80)',
  blackSoft:    'rgba(0,0,0,0.60)',
  blackFaint:   'rgba(0,0,0,0.35)',
  tealAccent:   '#61d8cc',
  tealDark:     '#243836',
  orange:       '#FF8C42',
  orangeGlowA:  'rgba(255,107,26,0.45)',
  orangeGlowB:  'rgba(255,140,66,0.45)',
  orangeGlowC:  'rgba(255,163,102,0.35)',
  gold:         '#FFD166',
  red:          '#EF767A',
  inputBg:      'rgba(255,255,255,0.60)',
  inputBorder:  'rgba(0,0,0,0.15)',
  divider:      'rgba(0,0,0,0.10)',
  proofOff:     'rgba(0,0,0,0.18)',
  tagGoodBg:    'rgba(97,216,204,0.28)',
  tagWarnBg:    'rgba(255,140,66,0.22)',
  shadow:       '#000',
};

// ─── Star Display ─────────────────────────────────────────────────────────────
function StarDisplay({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Svg key={n} width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={n <= Math.round(rating) ? C.gold : 'none'}
            stroke={n <= Math.round(rating) ? '#8a6800' : C.blackFaint}
            strokeWidth={1.75}
            strokeLinejoin="round"
          />
        </Svg>
      ))}
      <Text style={s.starNum}>{rating.toFixed(1)}</Text>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fairnessColor(f: number): string {
  if (f >= 0.85) return C.tealAccent;
  if (f >= 0.5)  return C.gold;
  return C.red;
}

// ─── Math Panel ───────────────────────────────────────────────────────────────
function HistoryMathPanel({
  scores,
  partnerName,
}: {
  scores: MatchScoreBreakdown;
  partnerName: string;
}) {
  return (
    <View style={s.mathPanel}>
      <View style={[s.mathGlow, s.mathGlowOne]} />
      <View style={[s.mathGlow, s.mathGlowTwo]} />
      <View style={s.mathInner}>
        <Text style={s.mathTitle}>M(you, {partnerName})</Text>
        <Text style={s.mathFormula}>M = 0.34 × SF + 0.33 × TC + 0.33 × F</Text>
        <View style={s.mathDivider} />
        <Text style={s.mathLine}>
          SF  = SkillFit(you, {partnerName}){' '}
          <Text style={s.mathVal}>= {scores.sf.toFixed(3)}</Text>
        </Text>
        <Text style={s.mathLine}>
          TC  = √(T(you) × T({partnerName})){' '}
          <Text style={s.mathVal}>= {scores.tc.toFixed(3)}</Text>
        </Text>
        <Text style={s.mathSub}>
          = √({scores.tu.toFixed(3)} × {scores.tv.toFixed(3)})
        </Text>
        <Text style={s.mathLine}>
          F   = Fairness from proof{' '}
          <Text style={s.mathVal}>= {scores.fair.toFixed(3)}</Text>
        </Text>
        <Text style={s.mathSub}>
          0.35·deliveredOnTime + 0.35·scopeMatched + 0.15·evidence + 0.15·wouldSwapAgain
        </Text>
        <View style={s.mathDivider} />
        <Text style={s.mathTotal}>
          M = {(0.34 * scores.sf).toFixed(3)} + {(0.33 * scores.tc).toFixed(3)} +{' '}
          {(0.33 * scores.fair).toFixed(3)} ={' '}
          <Text style={s.mathTotalValue}>{scores.total.toFixed(3)}</Text>
        </Text>
        <View style={s.mathDivider} />
        <Text style={s.mathNote}>T(u) = 0.2P + 0.3R̂ + 0.2V̂ + 0.2C + 0.1Q</Text>
        <Text style={s.mathLine}>
          T(you) = {scores.tu.toFixed(3)} | T({partnerName}) = {scores.tv.toFixed(3)}
        </Text>
      </View>
    </View>
  );
}

// ─── History Card ─────────────────────────────────────────────────────────────
function HistoryCard({ record }: { record: HistoryRecord }) {
  const [showMath, setShowMath] = useState(false);
  const impacts = trustImpactTags(record.proof);
  const fc = fairnessColor(record.fairness);

  function toggleMath() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowMath(v => !v);
  }

  const checks = [
    { label: 'Delivered on time',           done: record.proof.deliveredOnTime },
    { label: 'Scope matched agreement',     done: record.proof.scopeMatchedAgreement },
    { label: 'Portfolio evidence attached', done: record.proof.portfolioEvidenceAttached },
    { label: 'Would swap again',            done: record.proof.wouldSwapAgain },
  ];

  return (
    <View style={s.cardWrapper}>
      <View style={[s.cardGlow, s.cardGlowOne]} />
      <View style={[s.cardGlow, s.cardGlowTwo]} />
      <View style={s.cardInner}>

        {/* ── Header row ── */}
        <View style={s.cardHeader}>
          <View style={s.avatarBox}>
            <Text style={s.avatarEmoji}>{record.partnerAvatar}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.cardName}>{record.partnerName}</Text>
            <Text style={s.cardDate}>{formatDate(record.completedAt)}</Text>
          </View>
          <View style={[s.fairnessBadge, { borderColor: fc }]}>
            <Text style={s.fairnessBadgeSmall}>FAIRNESS</Text>
            <Text style={[s.fairnessBadgeNum, { color: fc }]}>
              {Math.round(record.fairness * 100)}%
            </Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Skills exchanged ── */}
        <View style={s.skillsRow}>
          <View style={s.skillPill}>
            <Text style={s.skillPillLabel}>YOU GAVE</Text>
            <Text style={s.skillPillValue}>{record.skillGiven}</Text>
          </View>
          <View style={s.skillArrowBox}>
            <Text style={s.skillArrow}>⇄</Text>
          </View>
          <View style={s.skillPill}>
            <Text style={s.skillPillLabel}>YOU RECEIVED</Text>
            <Text style={s.skillPillValue}>{record.skillReceived}</Text>
          </View>
        </View>

        {/* ── Proof checkmarks ── */}
        <View style={s.proofSection}>
          <Text style={s.sectionLabel}>TRANSPARENCY PROOF</Text>
          {checks.map(c => (
            <View key={c.label} style={s.proofRow}>
              <View style={[s.proofDot, { backgroundColor: c.done ? C.tealAccent : C.proofOff }]}>
                <Text style={[s.proofDotIcon, { color: c.done ? C.black : C.blackFaint }]}>
                  {c.done ? '✓' : '—'}
                </Text>
              </View>
              <Text style={[s.proofLabel, !c.done && s.proofLabelOff]}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Trust impact tags ── */}
        {impacts.length > 0 && (
          <View style={s.tagsRow}>
            {impacts.map(t => (
              <View key={t} style={[s.tag, t.startsWith('⚠') ? s.tagWarn : s.tagGood]}>
                <Text style={[s.tagText, t.startsWith('⚠') ? s.tagTextWarn : s.tagTextGood]}>
                  {t}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Star rating ── */}
        {record.starRating !== undefined && (
          <View style={s.ratingBox}>
            <Text style={s.sectionLabel}>YOUR RATING</Text>
            <StarDisplay rating={record.starRating} />
            {!!record.reviewComment && (
              <Text style={s.reviewText}>"{record.reviewComment}"</Text>
            )}
          </View>
        )}

        {/* ── Notes ── */}
        {!!record.proof.notes && (
          <View style={s.notesBox}>
            <Text style={s.sectionLabel}>NOTES</Text>
            <Text style={s.notesText}>{record.proof.notes}</Text>
          </View>
        )}

        {/* ── Math toggle — orange CTA ── */}
        <View style={s.mathToggleContainer}>
          <View style={[s.btnGlow, s.btnGlowA]} />
          <View style={[s.btnGlow, s.btnGlowB]} />
          <Pressable
            onPress={toggleMath}
            style={({ pressed }) => [s.mathToggle, pressed && s.mathTogglePressed]}
            accessibilityLabel={showMath ? 'Hide match math' : 'Show match math'}
            accessibilityRole="button"
          >
            <Text style={s.mathToggleText}>
              {showMath ? '▲ Hide Math' : `▼ Show Math  M(you, ${record.partnerName})`}
            </Text>
          </Pressable>
        </View>

        {showMath && (
          <HistoryMathPanel scores={record.scores} partnerName={record.partnerName} />
        )}
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyHistory() {
  return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>⇄</Text>
      <Text style={s.emptyTitle}>No completed swaps yet</Text>
      <Text style={s.emptyBody}>
        When you and a match complete a skill exchange, it will appear here
        with a full transparency proof record and math breakdown.
      </Text>
      <View style={s.emptyCTAWrap}>
        <View style={[s.btnGlow, s.btnGlowA]} />
        <View style={[s.btnGlow, s.btnGlowB]} />
        <View style={[s.btnGlow, s.btnGlowC]} />
        <Pressable
          style={({ pressed }) => [s.emptyBtn, pressed && s.emptyBtnPressed]}
          onPress={() => router.back()}
          accessibilityLabel="Go back to find matches"
          accessibilityRole="button"
        >
          <Text style={s.emptyBtnText}>← Find Matches</Text>
          <Text style={s.emptyBtnArrow}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Legend Row ───────────────────────────────────────────────────────────────
function LegendRow() {
  return (
    <View style={s.legendWrapper}>
      <View style={[s.legendGlow, s.legendGlowOne]} />
      <View style={[s.legendGlow, s.legendGlowTwo]} />
      <View style={s.legendInner}>
        <Text style={s.legendText}>
          F = 0.35·time + 0.35·scope + 0.15·evidence + 0.15·wouldSwapAgain
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SwapHistory() {
  const history = useHistoryState();

  const totalFairness =
    history.length > 0
      ? history.reduce((sum, r) => sum + r.fairness, 0) / history.length
      : null;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={s.bgLayer} />
      <View style={[s.heroGlow, s.heroGlowOuter]} />
      <View style={[s.heroGlow, s.heroGlowInner]} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.backPillWrap}>
          <View style={[s.cardGlow, s.cardGlowOne]} />
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [s.backPill, pressed && { opacity: 0.75 }]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={s.backPillText}>← Matches</Text>
          </Pressable>
        </View>

        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Swap History</Text>
          <Text style={s.headerSub}>
            {history.length} completed swap{history.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {totalFairness !== null ? (
          <View style={s.avgWrapper}>
            <View style={[s.cardGlow, s.cardGlowOne]} />
            <View style={s.avgBox}>
              <Text style={s.avgLabel}>AVG FAIRNESS</Text>
              <Text style={[s.avgValue, { color: fairnessColor(totalFairness) }]}>
                {Math.round(totalFairness * 100)}%
              </Text>
              <Text style={s.avgNote}>proof-based</Text>
            </View>
          </View>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      <LegendRow />

      {history.length === 0 ? (
        <EmptyHistory />
      ) : (
        <FlatList
          data={history}
          keyExtractor={r => r.id}
          renderItem={({ item }) => <HistoryCard record={item} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  safe: { flex: 1, backgroundColor: C.bgDeep },
  bgLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg },

  heroGlow: { position: 'absolute', borderRadius: 100, top: 40, alignSelf: 'center' },
  heroGlowOuter: {
    width: 280, height: 100,
    backgroundColor: 'rgba(0,0,0,0.07)',
    transform: [{ scale: 1.4 }],
  },
  heroGlowInner: {
    width: 240, height: 85,
    backgroundColor: 'rgba(0,0,0,0.05)',
    transform: [{ scale: 1.2 }],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    zIndex: 2,
  },

  backPillWrap: { position: 'relative', minWidth: 80 },
  backPill: {
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  backPillText: { fontSize: 13, fontWeight: '700', color: C.black },

  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.black, letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: C.blackMid, fontWeight: '500', marginTop: 2 },

  avgWrapper: { position: 'relative', minWidth: 80, alignItems: 'flex-end' },
  avgBox: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  avgLabel: { fontSize: 9, fontWeight: '800', color: C.blackSoft, letterSpacing: 0.8 },
  avgValue: { fontSize: 20, fontWeight: '800', marginVertical: 2 },
  avgNote:  { fontSize: 9, color: C.blackSoft, fontWeight: '600' },

  legendWrapper: {
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 10,
    zIndex: 2,
  },
  legendGlow: {
    position: 'absolute',
    left: 0, right: 0, top: 2, bottom: -2,
    borderRadius: 10,
  },
  legendGlowOne: { backgroundColor: C.glowOne, transform: [{ scale: 1.04 }] },
  legendGlowTwo: { backgroundColor: C.glowTwo, transform: [{ scale: 1.08 }] },
  legendInner: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  legendText: {
    fontSize: 11,
    color: C.blackSoft,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 18 },

  cardWrapper: { position: 'relative' },
  cardGlow: {
    position: 'absolute',
    left: 0, right: 0, top: 2, bottom: -2,
    borderRadius: 16,
  },
  cardGlowOne: { backgroundColor: C.glowOne, transform: [{ scale: 1.07 }] },
  cardGlowTwo: { backgroundColor: C.glowTwo, transform: [{ scale: 1.12 }] },
  cardInner: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
    gap: 12,
  },

  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: {
    width: 44, height: 44,
    borderRadius: 22,
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
  avatarEmoji: { fontSize: 22 },
  cardName: { fontSize: 16, fontWeight: '800', color: C.black, letterSpacing: -0.2 },
  cardDate: { fontSize: 12, color: C.blackSoft, fontWeight: '500', marginTop: 2 },

  fairnessBadge: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  fairnessBadgeSmall: { fontSize: 8, fontWeight: '800', color: C.blackSoft, letterSpacing: 0.8 },
  fairnessBadgeNum: { fontSize: 18, fontWeight: '800', marginTop: 1 },

  divider: { height: 1, backgroundColor: C.divider, marginVertical: 2 },

  skillsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  skillPill: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.inputBorder,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  skillPillLabel: { fontSize: 9, fontWeight: '800', color: C.blackSoft, letterSpacing: 0.8, marginBottom: 4 },
  skillPillValue: { fontSize: 13, fontWeight: '700', color: C.black },
  skillArrowBox: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  skillArrow: { fontSize: 16, color: C.black, fontWeight: '800' },

  sectionLabel: { fontSize: 9, fontWeight: '800', color: C.blackSoft, letterSpacing: 1.1, marginBottom: 8 },
  proofSection: { gap: 0 },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  proofDot: {
    width: 22, height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  proofDotIcon: { fontSize: 11, fontWeight: '800' },
  proofLabel: { fontSize: 13, color: C.blackMid, fontWeight: '600', flex: 1 },
  proofLabelOff: { color: C.blackFaint },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1 },
  tagGood: { backgroundColor: C.tagGoodBg, borderColor: 'rgba(97,216,204,0.50)' },
  tagWarn: { backgroundColor: C.tagWarnBg, borderColor: 'rgba(255,140,66,0.40)' },
  tagText: { fontSize: 11, fontWeight: '700' },
  tagTextGood: { color: '#004e48' },
  tagTextWarn: { color: '#7a3800' },

  ratingBox: { gap: 6 },
  starNum: { fontSize: 12, color: C.gold, fontWeight: '700', marginLeft: 2 },
  reviewText: { fontSize: 13, color: C.blackSoft, fontStyle: 'italic', marginTop: 4, lineHeight: 19 },

  notesBox: { gap: 4 },
  notesText: { fontSize: 13, color: C.blackMid, lineHeight: 19 },

  mathToggleContainer: { position: 'relative', marginTop: 4 },
  btnGlow: { position: 'absolute', left: 8, right: 8, top: 4, bottom: -2, borderRadius: 8 },
  btnGlowA: { backgroundColor: C.orangeGlowA },
  btnGlowB: { backgroundColor: C.orangeGlowB, transform: [{ scale: 1.03 }] },
  btnGlowC: { backgroundColor: C.orangeGlowC, transform: [{ scale: 1.06 }] },
  mathToggle: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: C.orange,
    alignItems: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  mathTogglePressed: { opacity: 0.88 },
  mathToggleText: { fontSize: 13, fontWeight: '800', color: C.black, letterSpacing: 0.2 },

  mathPanel: { position: 'relative', marginTop: 8 },
  mathGlow: { position: 'absolute', left: 0, right: 0, top: 2, bottom: -2, borderRadius: 12 },
  mathGlowOne: { backgroundColor: C.glowOne, transform: [{ scale: 1.05 }] },
  mathGlowTwo: { backgroundColor: C.glowTwo, transform: [{ scale: 1.09 }] },
  mathInner: {
    borderRadius: 10,
    padding: 14,
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.glassBorder,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    gap: 4,
  },
  mathTitle: { fontSize: 13, fontWeight: '800', color: C.black, marginBottom: 4 },
  mathFormula: {
    fontSize: 12, fontWeight: '700', color: C.blackMid,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  mathDivider: { height: 1, backgroundColor: C.divider, marginVertical: 6 },
  mathLine: {
    fontSize: 12, color: C.blackMid, fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  mathSub: {
    fontSize: 10, color: C.blackSoft,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginLeft: 12, marginTop: -2,
  },
  mathVal: { color: C.tealAccent, fontWeight: '800' },
  mathTotal: {
    fontSize: 12, color: C.blackMid, fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  mathTotalValue: { fontSize: 14, fontWeight: '800', color: C.black },
  mathNote: {
    fontSize: 10, color: C.blackSoft,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
  emptyIcon: { fontSize: 52, color: C.black },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: C.black, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: C.blackMid, textAlign: 'center', lineHeight: 21, maxWidth: 300 },
  emptyCTAWrap: { position: 'relative', width: '100%', maxWidth: 260, marginTop: 8 },
  emptyBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: C.orange,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 10,
    elevation: 8,
  },
  emptyBtnPressed: { opacity: 0.88 },
  emptyBtnText: { fontSize: 16, color: C.black, fontWeight: '800' },
  emptyBtnArrow: { fontSize: 22, lineHeight: 22, fontWeight: '900', color: C.black },
});
