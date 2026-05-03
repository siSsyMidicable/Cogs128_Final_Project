/**
 * SkillSwap — Match Hub  (index.tsx)
 *
 * Report recommendations implemented here:
 *   Rec 2 — Toast feedback (loading / success / error) on every swap action
 *   Rec 3 — Action-specific button labels: "Request a Swap", "Accept Swap", "Swap In Progress"
 *   Rec 4 — Text search + category filter chips
 *   Rec 5 — Designed empty state when search/filter returns no results
 *   Rec 6 — 1–5 star rating + review comment in CompletionModal; avg rating shown on cards
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  SafeAreaView, StatusBar, Platform, UIManager,
  LayoutAnimation, Modal, ScrollView, TextInput,
} from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { router } from 'expo-router';
import { useUser } from '@/lib/auth/auth';
import {
  matchScore, useMatchingState, whyThisMatch, averageStarRating, swapCount,
  type MatchUser, type MatchScoreBreakdown, type ProofField,
} from '@/lib/matching/matching';
import { YOU, MOCK_USERS } from '@/lib/matching/data';
import { toast } from '@/components/ui/toast';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental)
  UIManager.setLayoutAnimationEnabledExperimental(true);

// ─── Skill categories ──────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Tech', 'Creative', 'Life Skills', 'Finance'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_SKILLS: Record<Exclude<Category, 'All'>, string[]> = {
  Tech:         ['Web Dev', 'Linux Admin', 'Computer Repair'],
  Creative:     ['Graphic Design', 'Logo Creation', 'Illustration', 'Photography', 'Social Media', 'Video Editing', 'Makeup', 'Styling', 'Event Coordination', 'Cooking Classes'],
  'Life Skills':['Meal Prep', 'Nutrition Advice', 'Car Detailing', 'Mechanic', 'Welding'],
  Finance:      ['Bookkeeping', 'Tax Help', 'Spreadsheets', 'Resume Help'],
};

function userMatchesCategory(user: MatchUser, cat: Category): boolean {
  if (cat === 'All') return true;
  const catSkills = CATEGORY_SKILLS[cat];
  return user.offers.some(s => catSkills.includes(s)) ||
         user.requests.some(s => catSkills.includes(s));
}

// ─── tiny helpers ───────────────────────────────────────────────────────────────

function pct(v: number) { return `${Math.round(v * 100)}%`; }

function verdict(v: number) {
  if (v >= 0.80) return { emoji: '🔥', label: 'Excellent', color: '#61d8cc' };
  if (v >= 0.65) return { emoji: '✅', label: 'Good',      color: '#6daa45' };
  if (v >= 0.45) return { emoji: '🤝', label: 'Decent',    color: '#FFD166' };
  return           { emoji: '⚠️', label: 'Weak',       color: '#EF767A' };
}

// ─── icons ──────────────────────────────────────────────────────────────────────

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

function SearchIcon({ size = 16, color = '#607876' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.75} />
      <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
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

// ─── StarRating ─────────────────────────────────────────────────────────────────

function StarRating({
  value, onChange, size = 28,
}: {
  value: number; onChange?: (v: number) => void; size?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Pressable key={n} onPress={() => onChange?.(n)}
          accessibilityLabel={`Rate ${n} star${n !== 1 ? 's' : ''}`}
          style={{ padding: 2 }}>
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={n <= value ? '#FFD166' : 'none'}
              stroke={n <= value ? '#8a6800' : '#607876'}
              strokeWidth={1.75}
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      ))}
    </View>
  );
}

/** Compact display-only star row shown on match cards */
function StarDisplay({ rating, count }: { rating: number; count: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <StarRating value={Math.round(rating)} size={13} />
      <Text style={{ fontSize: 11, color: '#607876', fontWeight: '600' }}>
        {rating.toFixed(1)} ({count})
      </Text>
    </View>
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

// ─── CompletionModal ───────────────────────────────────────────────────────────
// Rec 6: added 1–5 star rating + review comment

function CompletionModal({
  visible, partner, currentUser, onClose, onSubmit,
}: {
  visible: boolean; partner: MatchUser | null; currentUser: MatchUser;
  onClose: () => void;
  onSubmit: (given: string, received: string, proof: ProofField, starRating: number, reviewComment: string) => void;
}) {
  const [given, setGiven]       = useState('');
  const [received, setReceived] = useState('');
  const [starRating, setStarRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
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

  const starLabel = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][starRating] ?? '';

  function handleSubmit() {
    if (!given.trim() || !received.trim() || starRating === 0) return;
    onSubmit(given.trim(), received.trim(), proof, starRating, reviewComment.trim());
    // reset
    setGiven(''); setReceived(''); setStarRating(0); setReviewComment('');
    setProof({ deliveredOnTime: false, scopeMatchedAgreement: false,
               portfolioEvidenceAttached: false, wouldSwapAgain: false, notes: '' });
  }

  if (!partner) return null;

  const canSubmit = given.trim() && received.trim() && starRating > 0;

  const checks: { key: keyof Omit<ProofField,'notes'>; label: string; desc: string; weight: string }[] = [
    { key: 'deliveredOnTime',           label: 'Delivered on time',             desc: 'They finished when they promised.',           weight: '×0.35' },
    { key: 'scopeMatchedAgreement',     label: 'Scope matched our agreement',   desc: 'They taught what we agreed on.',              weight: '×0.35' },
    { key: 'portfolioEvidenceAttached', label: 'Evidence / portfolio attached',  desc: "There's a link or file proving the work.",   weight: '×0.15' },
    { key: 'wouldSwapAgain',            label: 'Would swap again',               desc: "Overall I'd recommend this person.",          weight: '×0.15' },
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
            Rate your experience and confirm 4 proof checkpoints — each feeds directly into their trust score.
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* ── Skills exchanged ── */}
            <Text style={modal.fieldLabel}>Skill you gave</Text>
            <TextInput style={modal.input} value={given} onChangeText={setGiven}
              placeholder={currentUser.offers[0] ?? 'e.g. Web Dev'} placeholderTextColor="#607876" />
            <Text style={modal.fieldLabel}>Skill you received</Text>
            <TextInput style={modal.input} value={received} onChangeText={setReceived}
              placeholder={partner.offers[0] ?? 'e.g. Graphic Design'} placeholderTextColor="#607876" />

            {/* ── Rec 6: Star rating ── */}
            <Text style={modal.fieldLabel}>Overall rating (required)</Text>
            <View style={modal.starRow}>
              <StarRating value={starRating} onChange={setStarRating} size={32} />
              {starRating > 0 && (
                <Text style={modal.starLabel}>{starLabel}</Text>
              )}
            </View>
            {starRating === 0 && (
              <Text style={modal.starHint}>Tap a star to rate {partner.name}'s performance</Text>
            )}

            {/* ── Rec 6: Review comment ── */}
            <Text style={modal.fieldLabel}>Review (optional)</Text>
            <TextInput
              style={[modal.input, { height: 64, textAlignVertical: 'top' }]}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder={`What was it like swapping with ${partner.name}?`}
              placeholderTextColor="#607876"
              multiline
            />

            {/* ── Proof checkboxes ── */}
            <View style={modal.proofHeader}>
              <TransparencyIcon size={15} color="#a8c5c2" />
              <Text style={[modal.fieldLabel, { marginTop: 0, marginLeft: 6, marginBottom: 0 }]}>Transparency proof</Text>
            </View>
            <Text style={modal.proofSub}>Check everything that is true about this swap.</Text>
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

            {/* ── Fairness preview ── */}
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

            {/* ── Submit hint ── */}
            {!canSubmit && (
              <Text style={modal.submitHint}>
                {!given.trim() || !received.trim()
                  ? '⚠ Enter the skills exchanged above to continue.'
                  : '⚠ A star rating is required before submitting.'}
              </Text>
            )}

            <View style={modal.actions}>
              <Pressable style={modal.cancelBtn} onPress={onClose}>
                <Text style={modal.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[modal.submitBtn, !canSubmit && modal.submitDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <SwapIcon size={16} color="#000" />
                  <Text style={modal.submitText}>Submit Swap</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── MatchCard ─────────────────────────────────────────────────────────────────
// Rec 3: action-specific labels
// Rec 6: show aggregate star rating

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

  const rating = averageStarRating(user);
  const count  = swapCount(user);

  let btnLabel = 'Request a Swap';
  let btnStyle = s.requestBtn;
  let btnAction = () => request(user.id);

  if (isDone) {
    btnLabel = 'Swap Completed';
    btnStyle = s.doneBtn;
    btnAction = () => {};
  } else if (isConnected) {
    btnLabel = 'Swap In Progress';
    btnStyle = s.connectedBtn;
    btnAction = () => onComplete(user);
  } else if (isRequested) {
    btnLabel = 'Accept Swap';
    btnStyle = s.acceptBtn;
    btnAction = () => connect(user.id);
  }

  const overlaps = useMemo(() => {
    const off = user.offers.filter(o => currentUser.requests.includes(o));
    const req = user.requests.filter(r => currentUser.offers.includes(r));
    return { off, req };
  }, [user, currentUser]);

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={[s.avatar, { borderRadius: 22 }]}>
          <Text style={s.avatarEmoji}>{user.emoji ?? '🙂'}</Text>
        </View>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={s.nameRow}>
            <Text style={s.name}>{user.name}</Text>
            {user.verified && <VerifiedIcon />}
          </View>

          <Text style={s.offersLine} numberOfLines={1}>
            Offers: {user.offers.join(', ')}
          </Text>

          {count > 0 && <StarDisplay rating={rating} count={count} />}
        </View>

        <Pressable
          style={s.saveBtn}
          onPress={() => {
            LayoutAnimation.easeInEaseOut();
            setSaved(v => !v);
          }}
          accessibilityLabel={saved ? 'Unsave match' : 'Save match'}
        >
          <SaveIcon filled={saved} color={saved ? '#61d8cc' : '#394140'} />
        </Pressable>

        <View style={[s.badge, { borderColor: v.color }]}>
          <Text style={s.badgeEmoji}>{v.emoji}</Text>
          <Text style={[s.badgePct, { color: v.color }]}>{pct(scores.total)}</Text>
        </View>
      </View>

      {(overlaps.off.length > 0 || overlaps.req.length > 0) ? (
        <View style={s.chipRow}>
          <Text style={s.chipRowLabel}>Match:</Text>
          {overlaps.off.map(sk => <Chip key={sk} label={sk} variant="offer" />)}
          {overlaps.req.map(sk => <Chip key={sk} label={sk} variant="request" />)}
        </View>
      ) : (
        <Text style={s.noOverlap}>No direct skill overlap — indirect value match</Text>
      )}

      <View style={s.why}>
        <Text style={s.whyText}>{why}</Text>
      </View>

            <View style={s.bars}>
        <View style={s.barRow}>
          <Text style={s.barLabel}>Total</Text>
          <ScoreBar value={scores.total} color="#61d8cc" />
          <Text style={s.barVal}>{pct(scores.total)}</Text>
        </View>
      </View>
  
  
const modal = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:        {
    backgroundColor: '#1c2424', borderTopWidth: 2, borderTopColor: '#61d8cc',
    borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '92%',
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
  // Rec 6: star rating row
  starRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  starLabel:    { fontSize: 14, fontWeight: '700', color: '#FFD166' },
  starHint:     { fontSize: 11, color: '#607876', fontStyle: 'italic', marginBottom: 4 },

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
  submitHint:   { fontSize: 12, color: '#FFD166', marginTop: 4, marginBottom: 2, textAlign: 'center' },
  actions:      { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 20 },
  cancelBtn:    { flex: 1, padding: 14, borderWidth: 2, borderColor: '#2f4a47', alignItems: 'center' },
  cancelText:   { fontSize: 14, fontWeight: '700', color: '#607876' },
  submitBtn:    { flex: 2, padding: 14, backgroundColor: '#61d8cc', borderWidth: 2, borderColor: '#1f4642', alignItems: 'center' },
  submitDisabled: { backgroundColor: '#2f4a47', borderColor: '#2f4a47' },
  submitText:   { fontSize: 14, fontWeight: '900', color: '#000' },
});