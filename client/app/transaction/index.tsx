/**
 * SkillSwap — Match Hub
 *
 * Shows users ranked by M(you, v) = 0.34·SF + 0.33·TC + 0.33·F
 *
 * Features:
 *   • "Show Math" — expandable dark panel with live formula substitution
 *   • "Why This Match?" — plain English auto-generated summary per card
 *   • Trust Score Breakdown — tap the Trust bar label to expand T(u) components
 *   • Complete Swap — bottom-sheet modal with proof checkboxes + live F preview
 *   • Custom icon system wired in throughout (SwapIcon, HistoryIcon, etc.)
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
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
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

// ─── Inline Icon Components ───────────────────────────────────────────────────
// Rendered inline so no extra import chain is needed for this screen.
// All on 24px grid, 1.75px stroke, stroke-only unless `filled`.

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

function FairnessMeterIcon({ size = 16, color = '#61d8cc' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M5 9h14" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Circle cx={5} cy={13} r={2.5} stroke={color} strokeWidth={1.75} />
      <Path d="M5 11v-2" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Circle cx={19} cy={11} r={1.75} stroke={color} strokeWidth={1.75} />
      <Path d="M9 19h6" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
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
      <Path d="M6 9h5M9 7.5l1.5 1.5L9 10.5" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
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

function DisputeIcon({ size = 15, color = '#EF767A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 2h9l3 3v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M15 2v3h3" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M9 10h6" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M9 10l-1 3" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M15 10l1 3" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Circle cx={12} cy={15} r={1} fill={color} />
    </Svg>
  );
}

// ─── ScoreBar ─────────────────────────────────────────────────────────────────

function ScoreBar({ value, color }: { value: number; color: string }) {
  const pct = `${Math.min(100, Math.round(value * 100))}%` as any;
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: pct, backgroundColor: color }]} />
    </View>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, variant }: { label: string; variant: 'offer' | 'request' | 'match' }) {
  const bg = variant === 'offer' ? '#1f4642' : variant === 'request' ? '#FF8C42' : '#61d8cc';
  const fg = variant === 'offer' ? '#61d8cc' : '#000';
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
    </View>
  );
}

// ─── MathPanel ────────────────────────────────────────────────────────────────

function MathPanel({ scores, user }: { scores: MatchScoreBreakdown; user: MatchUser }) {
  return (
    <View style={styles.mathPanel}>
      <Text style={styles.mathTitle}>M(you, {user.name}) breakdown</Text>
      <Text style={styles.mathFormula}>M = 0.34 × SF + 0.33 × TC + 0.33 × F</Text>
      <View style={styles.mathDivider} />
      <Text style={styles.mathLine}>
        SF  = SkillFit(you, {user.name}){' '}
        <Text style={styles.mathVal}>= {scores.sf.toFixed(3)}</Text>
      </Text>
      <Text style={styles.mathSub}>
        (|O(you)∩R({user.name})| / |R({user.name})| + |O({user.name})∩R(you)| / |R(you)|) / 2
      </Text>
      <Text style={styles.mathLine}>
        TC  = √(T(you) × T({user.name})){' '}
        <Text style={styles.mathVal}>= {scores.tc.toFixed(3)}</Text>
      </Text>
      <Text style={styles.mathSub}>
        = √({scores.tu.toFixed(3)} × {scores.tv.toFixed(3)})
      </Text>
      <Text style={styles.mathLine}>
        F   = Fairness{' '}
        <Text style={styles.mathVal}>= {scores.fair.toFixed(3)}</Text>
      </Text>
      <View style={styles.mathDivider} />
      <Text style={styles.mathTotal}>
        M = {(0.34 * scores.sf).toFixed(3)} + {(0.33 * scores.tc).toFixed(3)} +{' '}
        {(0.33 * scores.fair).toFixed(3)} ={' '}
        <Text style={styles.mathTotalValue}>{scores.total.toFixed(3)}</Text>
      </Text>
      <View style={styles.mathDivider} />
      <Text style={styles.mathNote}>T(u) = 0.2P + 0.3R̂ + 0.2V̂ + 0.2C + 0.1Q</Text>
      <Text style={styles.mathLine}>
        T(you) = {scores.tu.toFixed(3)} | T({user.name}) = {scores.tv.toFixed(3)}
      </Text>
    </View>
  );
}

// ─── TrustBreakdown ───────────────────────────────────────────────────────────

function TrustBreakdown({ user }: { user: MatchUser }) {
  const comp = trustComponents(user);
  const rows: { label: string; sym: string; weight: number; value: number }[] = [
    { label: 'Portfolio',     sym: 'P',   weight: comp.P.weight,    value: comp.P.value },
    { label: 'Avg Rating',    sym: 'R̂',  weight: comp.Rhat.weight, value: comp.Rhat.value },
    { label: 'Verification',  sym: 'V̂',  weight: comp.Vhat.weight, value: comp.Vhat.value },
    { label: 'Consistency',   sym: 'C',   weight: comp.C.weight,    value: comp.C.value },
    { label: 'Communication', sym: 'Q',   weight: comp.Q.weight,    value: comp.Q.value },
  ];
  return (
    <View style={styles.trustBreakdown}>
      <Text style={styles.trustBreakdownTitle}>T({user.name}) = 0.2P + 0.3R̂ + 0.2V̂ + 0.2C + 0.1Q</Text>
      {rows.map(r => (
        <View key={r.sym} style={styles.trustBreakdownRow}>
          <Text style={styles.trustBreakdownSym}>{r.sym}</Text>
          <Text style={styles.trustBreakdownLabel}>{r.label}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.round(r.value * 100)}%` as any, backgroundColor: '#4f98a3' }]} />
          </View>
          <Text style={styles.trustBreakdownVal}>{r.value.toFixed(2)}</Text>
          <Text style={styles.trustBreakdownWeight}>×{r.weight}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── WhyCard ──────────────────────────────────────────────────────────────────

function WhyCard({ you, other, scores }: { you: MatchUser; other: MatchUser; scores: MatchScoreBreakdown }) {
  const text = useMemo(() => whyThisMatch(you, other, scores), [you, other, scores]);
  return (
    <View style={styles.whyCard}>
      <Text style={styles.whyLabel}>WHY THIS MATCH</Text>
      <Text style={styles.whyText}>{text}</Text>
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
  const [given, setGiven]     = useState('');
  const [received, setReceived] = useState('');
  const [proof, setProof]     = useState<ProofField>({
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

  const checks: { key: keyof Omit<ProofField, 'notes'>; label: string; weight: string }[] = [
    { key: 'deliveredOnTime',           label: 'Delivered on time',           weight: '×0.35' },
    { key: 'scopeMatchedAgreement',     label: 'Scope matched our agreement', weight: '×0.35' },
    { key: 'portfolioEvidenceAttached', label: 'Portfolio / evidence attached', weight: '×0.15' },
    { key: 'wouldSwapAgain',            label: 'Would swap again',             weight: '×0.15' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.handle} />

          {/* Modal header with SwapIcon */}
          <View style={modal.titleRow}>
            <SwapIcon size={20} color="#61d8cc" />
            <Text style={modal.title}>Complete Swap with {partner.name}</Text>
          </View>

          <Text style={modal.subtitle}>
            Fairness is computed from verifiable fields — not a star rating that can be gamed.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={modal.fieldLabel}>Skill you gave</Text>
            <TextInput style={modal.input} value={given} onChangeText={setGiven}
              placeholder={currentUser.offers[0] ?? 'e.g. Web Dev'} placeholderTextColor="#607876" />
            <Text style={modal.fieldLabel}>Skill you received</Text>
            <TextInput style={modal.input} value={received} onChangeText={setReceived}
              placeholder={partner.offers[0] ?? 'e.g. Graphic Design'} placeholderTextColor="#607876" />

            {/* Transparency proof section header with icon */}
            <View style={modal.proofHeader}>
              <TransparencyReviewIcon size={15} color="#a8c5c2" />
              <Text style={[modal.fieldLabel, { marginTop: 0, marginLeft: 6, marginBottom: 0 }]}>
                Transparency proof
              </Text>
              <FairnessMeterIcon size={15} color="#607876" />
            </View>

            {checks.map(c => (
              <Pressable key={c.key}
                style={[modal.checkRow, proof[c.key] && modal.checkRowActive]}
                onPress={() => toggle(c.key)}>
                <View style={[modal.checkbox, proof[c.key] && modal.checkboxChecked]}>
                  {proof[c.key] && <Text style={modal.checkmark}>✓</Text>}
                </View>
                <Text style={modal.checkLabel}>{c.label}</Text>
                <Text style={modal.checkWeight}>{c.weight}</Text>
              </Pressable>
            ))}

            <View style={modal.fairnessRow}>
              <Text style={modal.fairnessLabel}>
                F = 0.35·{proof.deliveredOnTime ? '1' : '0'} + 0.35·{proof.scopeMatchedAgreement ? '1' : '0'} +
                0.15·{proof.portfolioEvidenceAttached ? '1' : '0'} + 0.15·{proof.wouldSwapAgain ? '1' : '0'}
              </Text>
              <Text style={modal.fairnessValue}>{fairness.toFixed(2)}</Text>
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
                  <Text style={modal.submitBtnText}>Submit Completion</Text>
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
  const [saved, setSaved] = useState(false);
  const scores = useMemo(() => matchScore(currentUser, user), [user, currentUser]);

  const isConnected = connections.has(user.id);
  const isRequested = requests.has(user.id);
  const isDone      = completed.has(user.id);

  const youCoverTheirNeeds = currentUser.offers.filter(s => user.requests.includes(s));
  const theyCoverYourNeeds = user.offers.filter(s => currentUser.requests.includes(s));
  const badgeColor = scores.total >= 0.7 ? '#61d8cc' : scores.total >= 0.45 ? '#FFD166' : '#EF767A';

  function toggle(setter: React.Dispatch<React.SetStateAction<boolean>>) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(v => !v);
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarEmoji}>{user.avatar}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          {/* Name row: VerifiedIcon inline with name */}
          <View style={styles.nameRow}>
            <Text style={styles.cardName}>{user.name}</Text>
            <VerifiedIcon size={13} color="#4f98a3" />
          </View>
          <Text style={styles.cardOffersLine} numberOfLines={1}>
            Offers: {user.offers.join(', ')}
          </Text>
        </View>
        {/* SaveSkillIcon — bookmark, filled when saved */}
        <Pressable
          onPress={() => setSaved(s => !s)}
          style={styles.saveBtn}
          accessibilityLabel={saved ? 'Unsave skill' : 'Save skill'}
        >
          <SaveSkillIcon size={18} color={saved ? '#61d8cc' : '#394140'} filled={saved} />
        </Pressable>
        <View style={[styles.scoreBadge, { borderColor: badgeColor }]}>
          <Text style={[styles.scoreBadgeText, { color: badgeColor }]}>
            {Math.round(scores.total * 100)}%
          </Text>
        </View>
      </View>

      {/* Skill overlap chips */}
      {theyCoverYourNeeds.length > 0 && (
        <View style={styles.highlightRow}>
          <Text style={styles.highlightLabel}>✓ They cover your need: </Text>
          <View style={styles.chipRow}>
            {theyCoverYourNeeds.map(s => <Chip key={s} label={s} variant="match" />)}
          </View>
        </View>
      )}
      {youCoverTheirNeeds.length > 0 && (
        <View style={styles.highlightRow}>
          <Text style={styles.highlightLabel}>✓ You cover their need: </Text>
          <View style={styles.chipRow}>
            {youCoverTheirNeeds.map(s => <Chip key={s} label={s} variant="offer" />)}
          </View>
        </View>
      )}
      {theyCoverYourNeeds.length === 0 && youCoverTheirNeeds.length === 0 && (
        <Text style={styles.noOverlap}>— No direct skill overlap</Text>
      )}

      {/* Why This Match — plain English */}
      <WhyCard you={currentUser} other={user} scores={scores} />

      {/* Score bars — trust bar label tappable to expand T(u) */}
      <View style={styles.barsSection}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>SkillFit</Text>
          <ScoreBar value={scores.sf} color="#61d8cc" />
          <Text style={styles.barValue}>{scores.sf.toFixed(2)}</Text>
        </View>
        {/* Trust row: VerifiedIcon as inline label prefix */}
        <Pressable onPress={() => toggle(setShowTrust)} style={styles.barRow}>
          <View style={styles.barLabelRow}>
            <VerifiedIcon size={11} color="#4f98a3" />
            <Text style={[styles.barLabel, styles.barLabelTappable]}>Trust▾</Text>
          </View>
          <ScoreBar value={scores.tc} color="#4f98a3" />
          <Text style={styles.barValue}>{scores.tc.toFixed(2)}</Text>
        </Pressable>
        {showTrust && <TrustBreakdown user={user} />}
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Match  </Text>
          <ScoreBar value={scores.total} color={badgeColor} />
          <Text style={styles.barValue}>{scores.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Math toggle */}
      <Pressable onPress={() => toggle(setShowMath)} style={styles.mathToggle}>
        <Text style={styles.mathToggleText}>
          {showMath ? '▲ Hide Math' : `▼ Show Math  M(you, ${user.name})`}
        </Text>
      </Pressable>
      {showMath && <MathPanel scores={scores} user={user} />}

      {/* Action buttons — icons wired */}
      <View style={styles.actionRow}>
        {isDone ? (
          <View style={[styles.actionBtn, styles.doneBtn]}>
            <Text style={styles.actionBtnText}>✓ Swap Completed</Text>
          </View>
        ) : isConnected ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={[styles.actionBtn, styles.connectedBtn, { flex: 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <NegotiateIcon size={16} color="#1f4642" />
                <Text style={styles.actionBtnText}>Connected</Text>
              </View>
            </View>
            <Pressable style={[styles.actionBtn, styles.completeBtn, { flex: 1 }]}
              onPress={() => onComplete(user)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <SwapIcon size={16} color="#000" />
                <Text style={styles.actionBtnText}>Complete Swap</Text>
              </View>
            </Pressable>
          </View>
        ) : isRequested ? (
          <Pressable style={[styles.actionBtn, styles.acceptBtn]} onPress={() => connect(user.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SwapIcon size={16} color="#000" />
              <Text style={styles.actionBtnText}>Accept Match</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable style={[styles.actionBtn, styles.requestBtn]} onPress={() => request(user.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SwapIcon size={16} color="#000" />
              <Text style={styles.actionBtnText}>Request Match</Text>
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

  const handleComplete = useCallback((partner: MatchUser) => setCompletionTarget(partner), []);
  const handleSubmitCompletion = useCallback(
    (given: string, received: string, proof: ProofField) => {
      if (!completionTarget) return;
      complete(completionTarget, YOU, given, received, proof);
      setCompletionTarget(null);
    },
    [completionTarget, complete],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>SKILLSWAP</Text>
          <Text style={styles.headerTitle}>Skill Matches</Text>
          {authUser && <Text style={styles.headerSub}>Signed in as {authUser.name}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#61d8cc' }]}>{connections.size}</Text>
              <Text style={styles.statLabel}>Connected</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#FF8C42' }]}>{requests.size}</Text>
              <Text style={styles.statLabel}>Requested</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#FFD166' }]}>{pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
          {/* History button with HistoryIcon */}
          <Pressable style={styles.historyBtn} onPress={() => router.push('/transaction/history')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <HistoryIcon size={14} color="#61d8cc" />
              <Text style={styles.historyBtnText}>History ({completed.size})</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.yourProfile}>
        <Text style={styles.yourProfileTitle}>Your Skills</Text>
        <View style={styles.chipRow}>
          <Text style={styles.chipGroupLabel}>Offers  </Text>
          {YOU.offers.map(s => <Chip key={s} label={s} variant="offer" />)}
        </View>
        <View style={[styles.chipRow, { marginTop: 6 }]}>
          <Text style={styles.chipGroupLabel}>Wants   </Text>
          {YOU.requests.map(s => <Chip key={s} label={s} variant="request" />)}
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
        contentContainerStyle={styles.list}
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
const styles = StyleSheet.create({
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
  historyBtn: {
    backgroundColor: '#2f3333', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3,
  },
  historyBtnText: { fontSize: 12, fontWeight: '800', color: '#61d8cc' },
  yourProfile: {
    backgroundColor: '#f3f4f1', borderBottomWidth: 2, borderBottomColor: '#2f3333',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  yourProfileTitle: { fontSize: 11, fontWeight: '700', color: '#434948', letterSpacing: 1.2, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  chipGroupLabel: { fontSize: 11, fontWeight: '700', color: '#2f3333', width: 44 },
  chip: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 12, fontWeight: '700' },
  list: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 32, gap: 14 },
  card: {
    backgroundColor: '#f3f4f1', borderWidth: 2, borderColor: '#2f3333',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderBottomWidth: 1, borderBottomColor: '#d0d2ce',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  avatarBox: {
    width: 44, height: 44, backgroundColor: '#61d8cc',
    borderWidth: 2, borderColor: '#1f4642',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji:     { fontSize: 22 },
  cardName:        { fontSize: 17, fontWeight: '800', color: '#101414' },
  cardOffersLine:  { fontSize: 12, color: '#394140', marginTop: 1 },
  saveBtn:         { padding: 6, marginRight: 4 },
  scoreBadge: {
    borderWidth: 2, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4,
    alignItems: 'center', justifyContent: 'center', minWidth: 50,
  },
  scoreBadgeText:  { fontSize: 16, fontWeight: '900' },
  highlightRow: {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 8, gap: 4,
  },
  highlightLabel:  { fontSize: 12, fontWeight: '700', color: '#2a8780' },
  noOverlap:       { fontSize: 12, color: '#888', paddingHorizontal: 12, paddingTop: 8, fontStyle: 'italic' },

  // Why This Match
  whyCard: {
    backgroundColor: '#e8ebe5', borderTopWidth: 1, borderTopColor: '#d0d2ce',
    paddingHorizontal: 12, paddingVertical: 8, marginTop: 4,
  },
  whyLabel: { fontSize: 9, fontWeight: '800', color: '#607876', letterSpacing: 1.3, marginBottom: 3 },
  whyText:  { fontSize: 13, color: '#2f3333', lineHeight: 19 },

  // Bars
  barsSection: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6, gap: 6 },
  barRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3, width: 60 },
  barLabel: { fontSize: 11, fontWeight: '700', color: '#2f3333', fontFamily: MONO },
  barLabelTappable: { color: '#1f4642', textDecorationLine: 'underline' },
  barTrack: { flex: 1, height: 8, backgroundColor: '#d0d2ce', borderRadius: 2, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 2 },
  barValue: { fontSize: 11, fontWeight: '700', color: '#2f3333', width: 32, textAlign: 'right', fontFamily: MONO },

  // Trust breakdown
  trustBreakdown: {
    backgroundColor: '#1c2424', paddingHorizontal: 12, paddingVertical: 10,
    marginTop: 2, gap: 5,
  },
  trustBreakdownTitle: { fontSize: 11, color: '#4f98a3', fontFamily: MONO, marginBottom: 4 },
  trustBreakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustBreakdownSym:    { fontSize: 12, fontWeight: '800', color: '#61d8cc', width: 20, fontFamily: MONO },
  trustBreakdownLabel:  { fontSize: 11, color: '#a8c5c2', width: 88 },
  trustBreakdownVal:    { fontSize: 11, color: '#61d8cc', fontWeight: '700', width: 32, textAlign: 'right', fontFamily: MONO },
  trustBreakdownWeight: { fontSize: 10, color: '#607876', width: 28, fontFamily: MONO },

  mathToggle: {
    borderTopWidth: 1, borderTopColor: '#d0d2ce',
    paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#e8ebe5',
  },
  mathToggleText: { fontSize: 12, fontWeight: '700', color: '#1f4642', letterSpacing: 0.3 },
  mathPanel: { backgroundColor: '#1c2424', borderTopWidth: 1, borderTopColor: '#2f3333', padding: 12, gap: 3 },
  mathTitle:   { fontSize: 12, fontWeight: '800', color: '#61d8cc', letterSpacing: 0.5, marginBottom: 4 },
  mathFormula: { fontSize: 13, color: '#fff', fontFamily: MONO, fontWeight: '700' },
  mathDivider: { height: 1, backgroundColor: '#2f4a47', marginVertical: 4 },
  mathLine:    { fontSize: 12, color: '#a8c5c2', fontFamily: MONO },
  mathVal:     { color: '#61d8cc', fontWeight: '800' },
  mathSub:     { fontSize: 10, color: '#607876', fontFamily: MONO, marginLeft: 8, marginBottom: 2 },
  mathTotal:   { fontSize: 12, color: '#fff', fontFamily: MONO, fontWeight: '700' },
  mathTotalValue: { color: '#61d8cc', fontWeight: '900' },
  mathNote:    { fontSize: 11, color: '#607876', fontFamily: MONO, marginTop: 2 },

  actionRow: { borderTopWidth: 1, borderTopColor: '#d0d2ce', padding: 10 },
  actionBtn: { paddingVertical: 11, alignItems: 'center', borderWidth: 2, flex: 1 },
  actionBtnText: { fontSize: 15, fontWeight: '800', color: '#000' },
  requestBtn:   { backgroundColor: '#61d8cc', borderColor: '#1f4642' },
  acceptBtn:    { backgroundColor: '#FF8C42', borderColor: '#7a3a10' },
  connectedBtn: { backgroundColor: '#d0f0ec', borderColor: '#2a8780' },
  completeBtn:  { backgroundColor: '#FFD166', borderColor: '#8a6800' },
  doneBtn:      { backgroundColor: '#e8ebe5', borderColor: '#999' },
});

const modal = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1c2424', borderTopWidth: 2, borderTopColor: '#61d8cc',
    borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '90%',
  },
  handle: { width: 40, height: 4, backgroundColor: '#607876', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  title:    { fontSize: 18, fontWeight: '900', color: '#61d8cc' },
  subtitle: { fontSize: 12, color: '#607876', marginBottom: 16, lineHeight: 18 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#a8c5c2', letterSpacing: 0.8, marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#131b1b', borderWidth: 1, borderColor: '#2f4a47',
    color: '#fff', padding: 10, fontSize: 14, marginBottom: 14, fontFamily: MONO,
  },
  proofHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2f4a47', marginBottom: 8,
  },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 6,
    borderWidth: 1, borderColor: '#2f4a47', backgroundColor: '#131b1b', gap: 10,
  },
  checkRowActive: { borderColor: '#61d8cc', backgroundColor: '#1f3530' },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#607876', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { borderColor: '#61d8cc', backgroundColor: '#61d8cc' },
  checkmark:   { fontSize: 13, fontWeight: '900', color: '#000' },
  checkLabel:  { flex: 1, fontSize: 14, color: '#ccc' },
  checkWeight: { fontSize: 11, color: '#607876', fontFamily: MONO },
  fairnessRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#131b1b', borderWidth: 1, borderColor: '#2f4a47',
    padding: 10, marginVertical: 12,
  },
  fairnessLabel: { fontSize: 11, color: '#607876', fontFamily: MONO, flex: 1 },
  fairnessValue: { fontSize: 20, fontWeight: '900', color: '#61d8cc' },
  actions:       { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 20 },
  cancelBtn:     { flex: 1, padding: 14, borderWidth: 2, borderColor: '#2f4a47', alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#607876' },
  submitBtn:     { flex: 2, padding: 14, backgroundColor: '#61d8cc', borderWidth: 2, borderColor: '#1f4642', alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#2f4a47', borderColor: '#2f4a47' },
  submitBtnText: { fontSize: 14, fontWeight: '900', color: '#000' },
});
