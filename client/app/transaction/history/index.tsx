/**
 * SkillSwap — Swap History
 *
 * A transparency ledger of completed swaps. Each record shows:
 *   • Who you swapped with + skills exchanged
 *   • Proof checkmarks (the 4 verifiable fields)
 *   • Computed fairness score F (weighted from proof, not stars)
 *   • Trust-impact tags derived from proof
 *   • Expandable "Show Math" panel: full M(u,v) breakdown at swap time
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fairnessColor(f: number): string {
  if (f >= 0.85) return '#61d8cc';
  if (f >= 0.5)  return '#FFD166';
  return '#EF767A';
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
      <Text style={s.mathTitle}>M(you, {partnerName}) at swap time</Text>
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
    <View style={s.card}>
      {/* Header row */}
      <View style={s.cardHeader}>
        <View style={s.avatarBox}>
          <Text style={s.avatarEmoji}>{record.partnerAvatar}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.cardName}>{record.partnerName}</Text>
          <Text style={s.cardDate}>{formatDate(record.completedAt)}</Text>
        </View>
        <View style={[s.fairnessBadge, { borderColor: fc }]}>
          <Text style={s.fairnessBadgeSmall}>Fairness</Text>
          <Text style={[s.fairnessBadgeNum, { color: fc }]}>
            {Math.round(record.fairness * 100)}%
          </Text>
        </View>
      </View>

      {/* Skills exchanged */}
      <View style={s.skillsRow}>
        <View style={s.skillBox}>
          <Text style={s.skillBoxLabel}>YOU GAVE</Text>
          <Text style={s.skillBoxValue}>{record.skillGiven}</Text>
        </View>
        <Text style={s.skillArrow}>⇄</Text>
        <View style={s.skillBox}>
          <Text style={s.skillBoxLabel}>YOU RECEIVED</Text>
          <Text style={s.skillBoxValue}>{record.skillReceived}</Text>
        </View>
      </View>

      {/* Proof checkmarks */}
      <View style={s.proofSection}>
        <Text style={s.proofTitle}>Transparency Proof</Text>
        {checks.map(c => (
          <View key={c.label} style={s.proofRow}>
            <View style={[s.proofDot, { backgroundColor: c.done ? '#61d8cc' : '#3a4a47' }]}>
              <Text style={[s.proofDotIcon, { color: c.done ? '#000' : '#607876' }]}>
                {c.done ? '✓' : '—'}
              </Text>
            </View>
            <Text style={[s.proofLabel, !c.done && s.proofLabelOff]}>{c.label}</Text>
          </View>
        ))}
      </View>

      {/* Trust impact tags */}
      {impacts.length > 0 && (
        <View style={s.tagsRow}>
          {impacts.map(t => (
            <View
              key={t}
              style={[s.tag, t.startsWith('⚠') ? s.tagWarn : s.tagGood]}
            >
              <Text style={[s.tagText, t.startsWith('⚠') ? s.tagTextWarn : s.tagTextGood]}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {!!record.proof.notes && (
        <View style={s.notesBox}>
          <Text style={s.notesLabel}>NOTES</Text>
          <Text style={s.notesText}>{record.proof.notes}</Text>
        </View>
      )}

      {/* Math toggle */}
      <Pressable onPress={toggleMath} style={s.mathToggle}>
        <Text style={s.mathToggleText}>
          {showMath ? '▲ Hide Math' : `▼ Show Math  M(you, ${record.partnerName})`}
        </Text>
      </Pressable>
      {showMath && (
        <HistoryMathPanel scores={record.scores} partnerName={record.partnerName} />
      )}
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
      <Pressable style={s.emptyBtn} onPress={() => router.back()}>
        <Text style={s.emptyBtnText}>← Find Matches</Text>
      </Pressable>
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

      {/* Header */}
      <View style={s.header}>
        <View>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backBtnText}>← Matches</Text>
          </Pressable>
          <Text style={s.headerTitle}>Swap History</Text>
          <Text style={s.headerSub}>
            {history.length} completed swap{history.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {totalFairness !== null && (
          <View style={s.avgBox}>
            <Text style={s.avgLabel}>AVG FAIRNESS</Text>
            <Text style={[s.avgValue, { color: fairnessColor(totalFairness) }]}>
              {Math.round(totalFairness * 100)}%
            </Text>
            <Text style={s.avgNote}>proof-based</Text>
          </View>
        )}
      </View>

      {/* Math legend */}
      <View style={s.legend}>
        <Text style={s.legendText}>
          F = 0.35·time + 0.35·scope + 0.15·evidence + 0.15·wouldSwapAgain
        </Text>
      </View>

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
const MONO: any = Platform.OS === 'ios' ? 'Courier' : 'monospace';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#d6d8d3' },

  header: {
    backgroundColor: '#ececea',
    borderBottomWidth: 2,
    borderBottomColor: '#2f3333',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  backBtn: { marginBottom: 4 },
  backBtnText: { fontSize: 13, fontWeight: '700', color: '#2a8780' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#101414' },
  headerSub: { fontSize: 12, color: '#394140', marginTop: 2 },

  avgBox: { alignItems: 'center' },
  avgLabel: { fontSize: 9, fontWeight: '700', color: '#434948', letterSpacing: 1.2 },
  avgValue: { fontSize: 30, fontWeight: '900' },
  avgNote: { fontSize: 9, color: '#607876' },

  legend: {
    backgroundColor: '#1c2424',
    borderBottomWidth: 2,
    borderBottomColor: '#2f3333',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  legendText: { fontSize: 11, color: '#607876', fontFamily: MONO },

  list: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 40, gap: 14 },

  card: {
    backgroundColor: '#f3f4f1',
    borderWidth: 2,
    borderColor: '#2f3333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d2ce',
  },
  avatarBox: {
    width: 44, height: 44,
    backgroundColor: '#61d8cc',
    borderWidth: 2, borderColor: '#1f4642',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  cardName: { fontSize: 17, fontWeight: '800', color: '#101414' },
  cardDate: { fontSize: 12, color: '#607876', marginTop: 1 },

  fairnessBadge: {
    borderWidth: 2, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    alignItems: 'center', minWidth: 60,
  },
  fairnessBadgeSmall: { fontSize: 9, color: '#607876', fontWeight: '700', letterSpacing: 0.5 },
  fairnessBadgeNum: { fontSize: 18, fontWeight: '900' },

  skillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d2ce',
    gap: 8,
  },
  skillBox: { flex: 1, alignItems: 'center' },
  skillBoxLabel: { fontSize: 9, fontWeight: '700', color: '#607876', letterSpacing: 1 },
  skillBoxValue: { fontSize: 15, fontWeight: '800', color: '#101414', marginTop: 2, textAlign: 'center' },
  skillArrow: { fontSize: 22, color: '#61d8cc', fontWeight: '800' },

  proofSection: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d2ce',
    gap: 6,
  },
  proofTitle: { fontSize: 10, fontWeight: '700', color: '#607876', letterSpacing: 1.2, marginBottom: 2 },
  proofRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  proofDot: {
    width: 20, height: 20, borderRadius: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  proofDotIcon: { fontSize: 12, fontWeight: '900' },
  proofLabel: { fontSize: 13, color: '#2f3333', fontWeight: '600' },
  proofLabelOff: { color: '#999' },

  tagsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#d0d2ce',
  },
  tag: { borderRadius: 3, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  tagGood: { backgroundColor: '#d0f0ec', borderColor: '#2a8780' },
  tagWarn: { backgroundColor: '#fff0d0', borderColor: '#b07a00' },
  tagText: { fontSize: 11, fontWeight: '700' },
  tagTextGood: { color: '#1f4642' },
  tagTextWarn: { color: '#7a5000' },

  notesBox: {
    backgroundColor: '#e8ebe5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d2ce',
  },
  notesLabel: { fontSize: 9, fontWeight: '700', color: '#607876', letterSpacing: 1, marginBottom: 3 },
  notesText: { fontSize: 13, color: '#2f3333', lineHeight: 18 },

  mathToggle: {
    borderTopWidth: 1, borderTopColor: '#d0d2ce',
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: '#e8ebe5',
  },
  mathToggleText: { fontSize: 12, fontWeight: '700', color: '#1f4642', letterSpacing: 0.3 },

  mathPanel: {
    backgroundColor: '#1c2424',
    borderTopWidth: 1, borderTopColor: '#2f3333',
    padding: 12, gap: 3,
  },
  mathTitle: { fontSize: 12, fontWeight: '800', color: '#61d8cc', letterSpacing: 0.5, marginBottom: 4 },
  mathFormula: { fontSize: 13, color: '#fff', fontFamily: MONO, fontWeight: '700' },
  mathDivider: { height: 1, backgroundColor: '#2f4a47', marginVertical: 4 },
  mathLine: { fontSize: 12, color: '#a8c5c2', fontFamily: MONO },
  mathVal: { color: '#61d8cc', fontWeight: '800' },
  mathSub: { fontSize: 10, color: '#607876', fontFamily: MONO, marginLeft: 8, marginBottom: 2 },
  mathTotal: { fontSize: 12, color: '#fff', fontFamily: MONO, fontWeight: '700' },
  mathTotalValue: { color: '#61d8cc', fontWeight: '900' },
  mathNote: { fontSize: 11, color: '#607876', fontFamily: MONO, marginTop: 2 },

  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 48, color: '#61d8cc', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#101414', marginBottom: 8 },
  emptyBody: {
    fontSize: 14, color: '#607876', textAlign: 'center',
    lineHeight: 22, marginBottom: 24, maxWidth: 300,
  },
  emptyBtn: {
    backgroundColor: '#61d8cc', borderWidth: 2, borderColor: '#1f4642',
    paddingVertical: 12, paddingHorizontal: 24,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '800', color: '#000' },
});
