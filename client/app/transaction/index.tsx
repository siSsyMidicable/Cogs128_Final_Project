/**
 * SkillSwap — Match Hub  (index.tsx)
 *
 * Cards are now lean: avatar, chips, why-sentence, 3 mini-bars, actions.
 * The full score breakdown lives at /transaction/score-breakdown?userId=X
 * — reached via a small "ℹ How scored?" link on each card.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  SafeAreaView, StatusBar, Platform, UIManager,
  LayoutAnimation, Modal, ScrollView, TextInput,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { useUser } from '@/lib/auth/auth';
import {
  matchScore, useMatchingState, whyThisMatch,
  type MatchUser, type MatchScoreBreakdown, type ProofField,
} from '@/lib/matching/matching';
import { YOU, MOCK_USERS } from '@/lib/matching/data';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental)
  UIManager.setLayoutAnimationEnabledExperimental(true);

// ─── tiny helpers ──────────────────────────────────────────────────────────────────

function pct(v: number) { return `${Math.round(v * 100)}%`; }

function verdict(v: number) {
  if (v >= 0.80) return { emoji: '🔥', label: 'Excellent', color: '#61d8cc' };
  if (v >= 0.65) return { emoji: '✅', label: 'Good',      color: '#6daa45' };
  if (v >= 0.45) return { emoji: '🤝', label: 'Decent',    color: '#FFD166' };
  return           { emoji: '⚠️', label: 'Weak',       color: '#EF767A' };
}

// ─── icons ────────────────────────────────────────────────────────────────────

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
      <Circle cx={16} cy={14} r={2} stroke={color} strokeWidth={1.75} />
      <Circle cx={12} cy={3} r={1} fill={color} />
      <Circle cx={12} cy={21} r={1} fill={color} />
    </Svg>
  );
}

function SaveIcon({ size = 16, color = '#394140', filled = false }: { size?: number; color?: string; filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
        stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
        fill={filled ? color : 'none'} />
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

function TransparencyIcon({ size = 15, color = '#a8c5c2' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3h10l3 3v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M15 3v3h3" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M8 9h5M8 12h7M8 15l1 1 2-2" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── ScoreBar ───────────────────────────────────────────────────────────────────

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={s.barTrack}>
      <View style={[s.barFill, { width: pct(value) as any, backgroundColor: color }]} />
    </View>
  );
}

// ─── Chip ───────────────────────────────────────────────────────────────────────

function Chip({ label, variant }: { label: string; variant: 'offer' | 'request' | 'match' }) {
  const bg = variant === 'offer' ? '#1f4642' : variant === 'request' ? '#FF8C42' : '#61d8cc';
  const fg = variant === 'offer' ? '#61d8cc' : '#000';
  return (
    <View style={[s.chip, { backgroundColor: bg }]}>
      <Text style={[s.chipText, { color: fg }]}>{label}</Text>
    </View>
  );
}

// ─── CompletionModal ──────────────────────────────────────────────────────────────

function CompletionModal({
  visible, partner, currentUser, onClose, onSubmit,
}: {
  visible: boolean; partner: MatchUser | null; currentUser: MatchUser;
  onClose: () => void;
  onSubmit: (given: string, received: string, proof: ProofField) => void;
}) {
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

  const fairLabel =
    fairness >= 0.85 ? 'Excellent — their trust score goes up.' :
    fairness >= 0.65 ? 'Good swap recorded.' :
    fairness >= 0.35 ? 'Partial — some issues noted.' :
    'Poor swap — trust score will reflect this.';

  function handleSubmit() {
    if (!given.trim() || !received.trim()) return;
    onSubmit(given.trim(), received.trim(), proof);
    setGiven(''); setReceived('');
    setProof({ deliveredOnTime: false, scopeMatchedAgreement: false,
               portfolioEvidenceAttached: false, wouldSwapAgain: false, notes: '' });
  }

  if (!partner) return null;

  const checks: { key: keyof Omit<ProofField,'notes'>; label: string; desc: string; weight: string }[] = [
    { key: 'deliveredOnTime',           label: 'Delivered on time',             desc: 'They finished when they promised.',           weight: '×0.35' },
    { key: 'scopeMatchedAgreement',     label: 'Scope matched our agreement',   desc: 'They taught what we agreed on.',              weight: '×0.35' },
    { key: 'portfolioEvidenceAttached', label: 'Evidence / portfolio attached',  desc: 'There’s a link or file proving the work.',   weight: '×0.15' },
    { key: 'wouldSwapAgain',            label: 'Would swap again',               desc: 'Overall I’d recommend this person.',          weight: '×0.15' },
  ];

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
            4 checkboxes replace a star rating — each one feeds directly into their trust score.
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={modal.fieldLabel}>Skill you gave</Text>
            <TextInput style={modal.input} value={given} onChangeText={setGiven}
              placeholder={currentUser.offers[0] ?? 'e.g. Web Dev'} placeholderTextColor="#607876" />
            <Text style={modal.fieldLabel}>Skill you received</Text>
            <TextInput style={modal.input} value={received} onChangeText={setReceived}
              placeholder={partner.offers[0] ?? 'e.g. Graphic Design'} placeholderTextColor="#607876" />
            <View style={modal.proofHeader}>
              <TransparencyIcon size={15} color="#a8c5c2" />
              <Text style={[modal.fieldLabel, { marginTop: 0, marginLeft: 6, marginBottom: 0 }]}>How did it go?</Text>
            </View>
            <Text style={modal.proofSub}>Check everything that is true.</Text>
            {checks.map(c => (
              <Pressable key={c.key} style={[modal.checkRow, proof[c.key] && modal.checkRowActive]}
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
            <View style={[modal.fairRow, { borderColor: fairness >= 0.65 ? '#61d8cc' : fairness >= 0.35 ? '#FFD166' : '#EF767A' }]}>
              <View style={{ flex: 1 }}>
                <Text style={modal.fairTitle}>Fairness score</Text>
                <Text style={modal.fairBlurb}>{fairLabel}</Text>
              </View>
              <Text style={[modal.fairValue, { color: fairness >= 0.65 ? '#61d8cc' : fairness >= 0.35 ? '#FFD166' : '#EF767A' }]}>
                {pct(fairness)}
              </Text>
            </View>
            <Text style={modal.fieldLabel}>Notes (optional)</Text>
            <TextInput style={[modal.input, { height: 72, textAlignVertical: 'top' }]}
              value={proof.notes} onChangeText={t => setProof(p => ({ ...p, notes: t }))}
              placeholder="Context, evidence links…" placeholderTextColor="#607876" multiline />
            <View style={modal.actions}>
              <Pressable style={modal.cancelBtn} onPress={onClose}>
                <Text style={modal.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[modal.submitBtn, (!given.trim() || !received.trim()) && modal.submitDisabled]}
                onPress={handleSubmit} disabled={!given.trim() || !received.trim()}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <SwapIcon size={16} color="#000" />
                  <Text style={modal.submitText}>Submit</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── MatchCard ──────────────────────────────────────────────────────────────────
// Lean card: no math panel, no dropdown. Just the essentials.
// Full breakdown → /transaction/score-breakdown?userId=X

function MatchCard({
  user, currentUser, connections, completed, requests, request, connect, onComplete,
}: {
  user: MatchUser; currentUser: MatchUser;
  connections: Set<string>; completed: Set<string>; requests: Set<string>;
  request: (id: string) => void; connect: (id: string) => void;
  onComplete: (partner: MatchUser) => void;
}) {
  const [saved, setSaved] = useState(false);
  const scores  = useMemo(() => matchScore(currentUser, user), [user, currentUser]);
  const v       = verdict(scores.total);
  const why     = useMemo(() => whyThisMatch(currentUser, user, scores), [currentUser, user, scores]);

  const isConnected = connections.has(user.id);
  const isRequested = requests.has(user.id);
  const isDone      = completed.has(user.id);

  const youCover  = currentUser.offers.filter(s => user.requests.includes(s));
  const theyCover = user.offers.filter(s => currentUser.requests.includes(s));

  return (
    <View style={s.card}>
      {/* ── Header ── */}
      <View style={s.cardHeader}>
        <View style={s.avatar}><Text style={s.avatarEmoji}>{user.avatar}</Text></View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={s.nameRow}>
            <Text style={s.name}>{user.name}</Text>
            <VerifiedIcon size={13} color="#4f98a3" />
          </View>
          <Text style={s.offersLine} numberOfLines={1}>Offers: {user.offers.join(', ')}</Text>
        </View>
        <Pressable onPress={() => setSaved(v => !v)} style={s.saveBtn}
          accessibilityLabel={saved ? 'Unsave' : 'Save'}>
          <SaveIcon size={18} color={saved ? '#61d8cc' : '#394140'} filled={saved} />
        </Pressable>
        {/* Score badge — verdict + percentage only */}
        <View style={[s.badge, { borderColor: v.color }]}>
          <Text style={s.badgeEmoji}>{v.emoji}</Text>
          <Text style={[s.badgePct, { color: v.color }]}>{pct(scores.total)}</Text>
        </View>
      </View>

      {/* ── Skill overlap chips ── */}
      {theyCover.length > 0 && (
        <View style={s.chipRow}>
          <Text style={s.chipRowLabel}>✓ They teach what you need: </Text>
          {theyCover.map(sk => <Chip key={sk} label={sk} variant="match" />)}
        </View>
      )}
      {youCover.length > 0 && (
        <View style={s.chipRow}>
          <Text style={s.chipRowLabel}>✓ You teach what they need: </Text>
          {youCover.map(sk => <Chip key={sk} label={sk} variant="offer" />)}
        </View>
      )}
      {theyCover.length === 0 && youCover.length === 0 && (
        <Text style={s.noOverlap}>— No direct skill overlap</Text>
      )}

      {/* ── Why this match (one sentence) ── */}
      <View style={s.why}>
        <Text style={s.whyText}>{why}</Text>
      </View>

      {/* ── 3 compact score bars (no toggle, always visible) ── */}
      <View style={s.bars}>
        <View style={s.barRow}>
          <Text style={s.barLabel}>Skill Fit</Text>
          <ScoreBar value={scores.sf} color="#61d8cc" />
          <Text style={s.barVal}>{pct(scores.sf)}</Text>
        </View>
        <View style={s.barRow}>
          <Text style={s.barLabel}>Trust    </Text>
          <ScoreBar value={scores.tc} color="#4f98a3" />
          <Text style={s.barVal}>{pct(scores.tc)}</Text>
        </View>
        <View style={s.barRow}>
          <Text style={s.barLabel}>Match    </Text>
          <ScoreBar value={scores.total} color={v.color} />
          <Text style={s.barVal}>{pct(scores.total)}</Text>
        </View>
      </View>

      {/* ── Score breakdown link ── */}
      <Pressable
        style={s.infoLink}
        onPress={() => router.push(`/transaction/score-breakdown?userId=${user.id}`)}
        accessibilityLabel={`See how ${user.name}'s score was calculated`}
      >
        <Text style={s.infoLinkText}>ℹ  How was {pct(scores.total)} calculated?</Text>
      </Pressable>

      {/* ── Actions ── */}
      <View style={s.actionRow}>
        {isDone ? (
          <View style={[s.btn, s.doneBtn]}>
            <Text style={s.btnText}>✓ Swap Completed</Text>
          </View>
        ) : isConnected ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={[s.btn, s.connectedBtn, { flex: 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <NegotiateIcon size={16} color="#1f4642" />
                <Text style={s.btnText}>Connected</Text>
              </View>
            </View>
            <Pressable style={[s.btn, s.completeBtn, { flex: 1 }]} onPress={() => onComplete(user)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <SwapIcon size={16} color="#000" />
                <Text style={s.btnText}>Complete Swap</Text>
              </View>
            </Pressable>
          </View>
        ) : isRequested ? (
          <Pressable style={[s.btn, s.acceptBtn]} onPress={() => connect(user.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SwapIcon size={16} color="#000" />
              <Text style={s.btnText}>Accept Match</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable style={[s.btn, s.requestBtn]} onPress={() => request(user.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SwapIcon size={16} color="#000" />
              <Text style={s.btnText}>Request Match</Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────────

export default function MatchHub() {
  const { data: authUser } = useUser();
  const { connections, requests, completed, request, connect, complete } = useMatchingState();
  const [completionTarget, setCompletionTarget] = useState<MatchUser | null>(null);

  const sortedUsers = useMemo(
    () => [...MOCK_USERS]
      .map(u => ({ user: u, score: matchScore(YOU, u).total }))
      .sort((a, b) => b.score - a.score)
      .map(({ user }) => user),
    [],
  );

  const pending = MOCK_USERS.length - connections.size - requests.size - completed.size;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={s.header}>
        <View>
          <Text style={s.eyebrow}>SKILLSWAP</Text>
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

      {/* Your skills strip */}
      <View style={s.yourProfile}>
        <Text style={s.yourProfileTitle}>Your Skills</Text>
        <View style={s.chipRowPlain}>
          <Text style={s.chipGroupLabel}>Offers  </Text>
          {YOU.offers.map(sk => <Chip key={sk} label={sk} variant="offer" />)}
        </View>
        <View style={[s.chipRowPlain, { marginTop: 6 }]}>
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
            request={request} connect={connect}
            onComplete={p => setCompletionTarget(p)}
          />
        )}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      />

      <CompletionModal
        visible={completionTarget !== null} partner={completionTarget}
        currentUser={YOU} onClose={() => setCompletionTarget(null)}
        onSubmit={(given, received, proof) => {
          if (!completionTarget) return;
          complete(completionTarget, YOU, given, received, proof);
          setCompletionTarget(null);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#d6d8d3' },
  header:       {
    backgroundColor: '#ececea', borderBottomWidth: 2, borderBottomColor: '#2f3333',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  eyebrow:      { fontSize: 11, fontWeight: '700', color: '#434948', letterSpacing: 1.4 },
  headerTitle:  { fontSize: 24, fontWeight: '800', color: '#101414' },
  headerSub:    { fontSize: 12, color: '#394140', marginTop: 2 },
  statsRow:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statBox:      { alignItems: 'center', minWidth: 52 },
  statNum:      { fontSize: 22, fontWeight: '800' },
  statLabel:    { fontSize: 10, color: '#434948', fontWeight: '600', letterSpacing: 0.4 },
  statDivider:  { width: 1, height: 28, backgroundColor: '#2f3333', marginHorizontal: 6 },
  historyBtn:   { backgroundColor: '#2f3333', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 },
  historyBtnText: { fontSize: 12, fontWeight: '800', color: '#61d8cc' },
  yourProfile:  {
    backgroundColor: '#f3f4f1', borderBottomWidth: 2, borderBottomColor: '#2f3333',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  yourProfileTitle: { fontSize: 11, fontWeight: '700', color: '#434948', letterSpacing: 1.2, marginBottom: 6 },
  chipRowPlain: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  chipGroupLabel: { fontSize: 11, fontWeight: '700', color: '#2f3333', width: 44 },
  list:         { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 32, gap: 14 },
  card:         {
    backgroundColor: '#f3f4f1', borderWidth: 2, borderColor: '#2f3333',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14, shadowRadius: 8, elevation: 4,
  },
  cardHeader:   {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderBottomWidth: 1, borderBottomColor: '#d0d2ce',
  },
  nameRow:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  avatar:       {
    width: 44, height: 44, backgroundColor: '#61d8cc',
    borderWidth: 2, borderColor: '#1f4642',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji:  { fontSize: 22 },
  name:         { fontSize: 17, fontWeight: '800', color: '#101414' },
  offersLine:   { fontSize: 12, color: '#394140', marginTop: 1 },
  saveBtn:      { padding: 6, marginRight: 4 },
  badge:        {
    borderWidth: 2, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4,
    alignItems: 'center', minWidth: 54,
  },
  badgeEmoji:   { fontSize: 13, marginBottom: 1 },
  badgePct:     { fontSize: 14, fontWeight: '900' },
  chipRow:      {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 8, gap: 4,
  },
  chipRowLabel: { fontSize: 12, fontWeight: '700', color: '#2a8780' },
  chip:         { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  chipText:     { fontSize: 12, fontWeight: '700' },
  noOverlap:    { fontSize: 12, color: '#888', paddingHorizontal: 12, paddingTop: 8, fontStyle: 'italic' },
  why:          {
    backgroundColor: '#e8ebe5', borderTopWidth: 1, borderTopColor: '#d0d2ce',
    paddingHorizontal: 12, paddingVertical: 8, marginTop: 4,
  },
  whyText:      { fontSize: 13, color: '#2f3333', lineHeight: 19 },
  bars:         { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4, gap: 6 },
  barRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel:     { fontSize: 11, fontWeight: '700', color: '#2f3333', width: 58 },
  barTrack:     { flex: 1, height: 7, backgroundColor: '#d0d2ce', borderRadius: 2, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 2 },
  barVal:       { fontSize: 11, fontWeight: '700', color: '#2f3333', width: 34, textAlign: 'right' },
  infoLink:     {
    borderTopWidth: 1, borderTopColor: '#d0d2ce',
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: '#e8ebe5',
  },
  infoLinkText: { fontSize: 12, fontWeight: '700', color: '#1f4642' },
  actionRow:    { borderTopWidth: 1, borderTopColor: '#d0d2ce', padding: 10 },
  btn:          { paddingVertical: 11, alignItems: 'center', borderWidth: 2, flex: 1 },
  btnText:      { fontSize: 15, fontWeight: '800', color: '#000' },
  requestBtn:   { backgroundColor: '#61d8cc', borderColor: '#1f4642' },
  acceptBtn:    { backgroundColor: '#FF8C42', borderColor: '#7a3a10' },
  connectedBtn: { backgroundColor: '#d0f0ec', borderColor: '#2a8780' },
  completeBtn:  { backgroundColor: '#FFD166', borderColor: '#8a6800' },
  doneBtn:      { backgroundColor: '#e8ebe5', borderColor: '#999' },
});

const modal = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:        {
    backgroundColor: '#1c2424', borderTopWidth: 2, borderTopColor: '#61d8cc',
    borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '90%',
  },
  handle:       { width: 40, height: 4, backgroundColor: '#607876', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  titleRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  title:        { fontSize: 18, fontWeight: '900', color: '#61d8cc' },
  subtitle:     { fontSize: 12, color: '#9ab5b2', marginBottom: 16, lineHeight: 18 },
  fieldLabel:   { fontSize: 11, fontWeight: '700', color: '#a8c5c2', letterSpacing: 0.8, marginBottom: 6, marginTop: 16 },
  input:        {
    backgroundColor: '#131b1b', borderWidth: 1, borderColor: '#2f4a47',
    color: '#fff', padding: 10, fontSize: 14,
  },
  proofHeader:  {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2f4a47', marginBottom: 4,
  },
  proofSub:     { fontSize: 11, color: '#607876', fontStyle: 'italic', marginBottom: 10 },
  checkRow:     {
    flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 6,
    borderWidth: 1, borderColor: '#2f4a47', backgroundColor: '#131b1b', gap: 10,
  },
  checkRowActive: { borderColor: '#61d8cc', backgroundColor: '#1f3530' },
  checkbox:     { width: 22, height: 22, borderWidth: 2, borderColor: '#607876', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { borderColor: '#61d8cc', backgroundColor: '#61d8cc' },
  checkmark:    { fontSize: 13, fontWeight: '900', color: '#000' },
  checkLabel:   { fontSize: 14, color: '#ccc', fontWeight: '700' },
  checkDesc:    { fontSize: 11, color: '#607876', marginTop: 1 },
  checkWeight:  { fontSize: 11, color: '#607876' },
  fairRow:      {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#131b1b', borderWidth: 2, padding: 12, marginVertical: 12,
  },
  fairTitle:    { fontSize: 11, fontWeight: '700', color: '#a8c5c2', marginBottom: 3 },
  fairBlurb:    { fontSize: 12, color: '#607876' },
  fairValue:    { fontSize: 28, fontWeight: '900' },
  actions:      { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 20 },
  cancelBtn:    { flex: 1, padding: 14, borderWidth: 2, borderColor: '#2f4a47', alignItems: 'center' },
  cancelText:   { fontSize: 14, fontWeight: '700', color: '#607876' },
  submitBtn:    { flex: 2, padding: 14, backgroundColor: '#61d8cc', borderWidth: 2, borderColor: '#1f4642', alignItems: 'center' },
  submitDisabled: { backgroundColor: '#2f4a47', borderColor: '#2f4a47' },
  submitText:   { fontSize: 14, fontWeight: '900', color: '#000' },
});
