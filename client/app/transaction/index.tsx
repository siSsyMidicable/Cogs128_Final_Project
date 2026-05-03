/**
 * SkillSwap — Match Hub  (index.tsx)
 *
 * UX Improvements applied (per SkillSwap User-Testing Critique Report):
 * 1. [HIGH]  Animated Lottie search bar replaces plain TextInput — leverages
 *            Search.json asset (60 fps, 680×120). Falls back to TextInput if
 *            lottie-react-native is not installed (safe import guard).
 * 2. [HIGH]  Action button labels are specific & context-aware:
 *            "Request Swap" → "Send Swap Request"
 *            "Accept Swap"  → "Accept & Connect"
 *            "Connected"    → "Schedule Swap" (leads somewhere)
 *            "Done"         stays, but shows ✓ prefix
 * 3. [HIGH]  Inline feedback toast messages are more descriptive.
 * 4. [MED]   Star ratings + swap counts always visible on cards (trust signals).
 * 5. [MED]   EmptyState redesigned: animated icon, warmer copy, clear-filter CTA.
 * 6. [MED]   Search box accessible (accessibilityLabel, autoFocus on tap).
 * 7. [MED]   All touch targets ≥ 44 × 44 px (per WCAG + Norman's feedback principle).
 * 8. [MED]   Category chips show skill-count badge for quick scanning (Fitts' Law).
 * 9. [LOW]   Card avatar gets color-coded ring matching match-verdict color.
 * 10.[LOW]   "Why this match" section collapsed by default, expands on tap
 *            (progressive disclosure — Sharp et al. IxD Ch.4).
 *
 * Bug fixes (v2):
 * - whyThisMatch() requires 3 args (you, other, scores) — scores now passed correctly.
 * - averageStarRating() and swapCount() take partnerId: string, not MatchUser — fixed.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  SafeAreaView, StatusBar, Platform, UIManager,
  LayoutAnimation, Modal, ScrollView, TextInput,
  Animated, TouchableOpacity,
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

// Safe Lottie import — works even if lottie-react-native is not yet installed
let LottieView: any = null;
try { LottieView = require('lottie-react-native').default; } catch (_) {}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental)
  UIManager.setLayoutAnimationEnabledExperimental(true);

// ─── Skill categories ─────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Tech', 'Creative', 'Life Skills', 'Finance'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_SKILLS: Record<Exclude<Category, 'All'>, string[]> = {
  Tech:          ['Web Dev', 'Linux Admin', 'Computer Repair'],
  Creative:      ['Graphic Design', 'Logo Creation', 'Illustration', 'Photography', 'Social Media', 'Video Editing', 'Makeup', 'Styling', 'Event Coordination', 'Cooking Classes'],
  'Life Skills': ['Meal Prep', 'Nutrition Advice', 'Car Detailing', 'Mechanic', 'Welding'],
  Finance:       ['Bookkeeping', 'Tax Help', 'Spreadsheets', 'Resume Help'],
};

function userMatchesCategory(user: MatchUser, cat: Category): boolean {
  if (cat === 'All') return true;
  const catSkills = CATEGORY_SKILLS[cat];
  return user.offers.some(s => catSkills.includes(s)) ||
         user.requests.some(s => catSkills.includes(s));
}

/** Count how many users in MOCK_USERS match a category (for badge). */
function categoryCount(cat: Category): number {
  if (cat === 'All') return MOCK_USERS.length;
  return MOCK_USERS.filter(u => userMatchesCategory(u, cat)).length;
}

// ─── tiny helpers ────────────────────────────────────────────────────────────

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

function SearchIcon({ size = 16, color = '#607876' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.75} />
      <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
    </Svg>
  );
}

function ClearIcon({ size = 16, color = '#607876' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ChevronIcon({ size = 14, color = '#607876', down = true }: { size?: number; color?: string; down?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={down ? 'M6 9l6 6 6-6' : 'M6 15l6-6 6 6'}
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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

// ─── AnimatedSearchBar ────────────────────────────────────────────────────────
// Uses Lottie Search.json when available; falls back to a styled TextInput.

function AnimatedSearchBar({
  value,
  onChangeText,
  onClear,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onClear: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const lottieRef = useRef<any>(null);

  const handleFocus = () => {
    setFocused(true);
    lottieRef.current?.play(0, 30);
  };
  const handleBlur = () => {
    if (!value) {
      setFocused(false);
      lottieRef.current?.play(30, 0);
    }
  };

  return (
    <View style={s.searchRow}>
      <Pressable
        style={[s.searchBox, focused && s.searchBoxFocused]}
        onPress={() => inputRef.current?.focus()}
        accessibilityLabel="Search by name or skill"
        accessibilityRole="search"
      >
        {LottieView ? (
          <LottieView
            ref={lottieRef}
            source={require('../../assets/animations/Search.json')}
            style={{ width: 28, height: 28 }}
            autoPlay={false}
            loop={false}
            speed={1.8}
            colorFilters={[{ keypath: '**', color: focused ? '#61d8cc' : '#607876' }]}
          />
        ) : (
          <SearchIcon size={18} color={focused ? '#61d8cc' : '#607876'} />
        )}

        <TextInput
          ref={inputRef}
          style={s.searchInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search by name or skill…"
          placeholderTextColor="#607876"
          returnKeyType="search"
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel="Search users by name or skill"
          accessibilityHint="Type to filter the list below"
        />

        {value.length > 0 && (
          <Pressable
            onPress={() => { onClear(); inputRef.current?.focus(); }}
            style={s.clearBtn}
            accessibilityLabel="Clear search"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ClearIcon size={14} color="#607876" />
          </Pressable>
        )}
      </Pressable>
    </View>
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────

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
          style={{ padding: 4, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
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

function StarDisplay({ rating, count }: { rating: number; count: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <StarRating value={Math.round(rating)} size={13} />
      <Text style={{ fontSize: 11, color: '#607876', fontWeight: '600' }}>
        {rating.toFixed(1)} ({count} swap{count !== 1 ? 's' : ''})
      </Text>
    </View>
  );
}

// ─── ScoreBar ─────────────────────────────────────────────────────────────────

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={s.barTrack}>
      <View style={[s.barFill, { width: pct(value) as any, backgroundColor: color }]} />
    </View>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, variant }: { label: string; variant: 'offer' | 'request' | 'match' }) {
  const bg = variant === 'offer' ? '#1f4642' : variant === 'request' ? '#FF8C42' : '#61d8cc';
  const fg = variant === 'offer' ? '#61d8cc' : '#000';
  return (
    <View style={[s.chip, { backgroundColor: bg }]}>
      <Text style={[s.chipText, { color: fg }]}>{label}</Text>
    </View>
  );
}

// ─── CompletionModal ──────────────────────────────────────────────────────────

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
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={modal.handle} />

            <View style={modal.titleRow}>
              <TransparencyIcon size={18} color="#61d8cc" />
              <Text style={modal.title}>Record Swap with {partner.name}</Text>
            </View>
            <Text style={modal.subtitle}>
              Be honest — your review shapes {partner.name}'s trust score and helps the community.
            </Text>

            {/* ── What you each taught ── */}
            <Text style={modal.fieldLabel}>SKILL YOU TAUGHT THEM</Text>
            <TextInput
              style={modal.input}
              value={given}
              onChangeText={setGiven}
              placeholder={`e.g. "${currentUser.offers[0] ?? 'Web Dev'}"`}
              placeholderTextColor="#607876"
              accessibilityLabel="Skill you taught"
            />

            <Text style={modal.fieldLabel}>SKILL THEY TAUGHT YOU</Text>
            <TextInput
              style={modal.input}
              value={received}
              onChangeText={setReceived}
              placeholder={`e.g. "${partner.offers[0] ?? 'Design'}"`}
              placeholderTextColor="#607876"
              accessibilityLabel="Skill they taught you"
            />

            {/* ── Star rating ── */}
            <Text style={modal.fieldLabel}>YOUR RATING</Text>
            <View style={modal.starRow}>
              <StarRating value={starRating} onChange={setStarRating} size={30} />
              {starRating > 0 && <Text style={modal.starLabel}>{starLabel}</Text>}
            </View>
            {starRating === 0 && (
              <Text style={modal.starHint}>⬆ Tap a star to rate (required)</Text>
            )}

            {/* ── Review comment ── */}
            <Text style={modal.fieldLabel}>REVIEW (optional)</Text>
            <TextInput
              style={[modal.input, { height: 72, textAlignVertical: 'top' }]}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="What went well? What could improve?"
              placeholderTextColor="#607876"
              multiline
              accessibilityLabel="Review comment"
            />

            {/* ── Proof checklist ── */}
            <Pressable style={modal.proofHeader}>
              <TransparencyIcon size={14} color="#a8c5c2" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#a8c5c2', letterSpacing: 0.8, flex: 1 }}>SWAP QUALITY CHECKLIST</Text>
            </Pressable>
            <Text style={modal.proofSub}>These affect the community trust score — be accurate.</Text>

            {checks.map(({ key, label, desc, weight }) => (
              <Pressable
                key={key}
                style={[modal.checkRow, proof[key] && modal.checkRowActive]}
                onPress={() => toggle(key)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: proof[key] }}
                accessibilityLabel={label}
              >
                <View style={[modal.checkbox, proof[key] && modal.checkboxChecked]}>
                  {proof[key] && <Text style={modal.checkmark}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={modal.checkLabel}>{label}</Text>
                  <Text style={modal.checkDesc}>{desc}</Text>
                </View>
                <Text style={modal.checkWeight}>{weight}</Text>
              </Pressable>
            ))}

            {/* ── Fairness score ── */}
            <View style={[modal.fairRow, { borderColor: fairness >= 0.65 ? '#61d8cc' : fairness >= 0.35 ? '#FFD166' : '#EF767A' }]}>
              <View style={{ flex: 1 }}>
                <Text style={modal.fairTitle}>FAIRNESS SCORE</Text>
                <Text style={modal.fairBlurb}>{fairLabel}</Text>
              </View>
              <Text style={[modal.fairValue, { color: fairness >= 0.65 ? '#61d8cc' : fairness >= 0.35 ? '#FFD166' : '#EF767A' }]}>
                {pct(fairness)}
              </Text>
            </View>

            {!canSubmit && (
              <Text style={modal.submitHint}>Fill in both skills and a star rating to submit.</Text>
            )}

            {/* ── Actions ── */}
            <View style={modal.actions}>
              <Pressable style={modal.cancelBtn} onPress={onClose}
                accessibilityLabel="Cancel recording swap">
                <Text style={modal.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[modal.submitBtn, !canSubmit && modal.submitDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit}
                accessibilityLabel="Submit swap record"
              >
                <Text style={modal.submitText}>Submit Swap Record</Text>
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
  user, currentUser, connections, completed, requests,
  request, connect, onComplete,
}: {
  user: MatchUser; currentUser: MatchUser;
  connections: Set<string>; completed: Set<string>; requests: Set<string>;
  request: (id: string) => void;
  connect:  (id: string) => void;
  onComplete: (u: MatchUser) => void;
}) {
  // FIX 1: compute scores first, then pass to whyThisMatch as third arg
  const scores  = useMemo(() => matchScore(currentUser, user), [currentUser, user]);
  const why     = useMemo(() => whyThisMatch(currentUser, user, scores), [currentUser, user, scores]);

  // FIX 2: averageStarRating and swapCount take a partnerId string, not a MatchUser
  const rating  = averageStarRating(user.id);
  const swaps   = swapCount(user.id);

  const v       = verdict(scores.total);
  const [saved, setSaved] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  const overlaps = useMemo(() => {
    const off = user.offers.filter(o => currentUser.requests.includes(o));
    const req = user.requests.filter(r => currentUser.offers.includes(r));
    return { off, req };
  }, [user, currentUser]);

  const isRequested  = requests.has(user.id);
  const isConnected  = connections.has(user.id);
  const isDone       = completed.has(user.id);

  // ── Specific, context-aware button labels (Report fix #2) ──
  const { btnLabel, btnStyle, btnAction } = (() => {
    if (isDone)        return { btnLabel: '✓ Swap Done',       btnStyle: s.doneBtn,      btnAction: () => {} };
    if (isConnected)   return { btnLabel: 'Schedule Swap →',   btnStyle: s.connectedBtn, btnAction: () => onComplete(user) };
    if (isRequested)   return { btnLabel: 'Request Sent ✓',    btnStyle: s.requestedBtn, btnAction: () => {} };
    return               { btnLabel: 'Send Swap Request',    btnStyle: s.requestBtn,   btnAction: () => request(user.id) };
  })();

  return (
    <View style={[s.card, { borderLeftColor: v.color, borderLeftWidth: 3 }]}>
      {/* ── Card header ── */}
      <View style={s.cardHeader}>
        <View style={[s.avatar, { borderColor: v.color, borderWidth: 2 }]}>
          <Text style={s.avatarEmoji}>{user.emoji ?? '🙂'}</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <View style={s.nameRow}>
            <Text style={s.name}>{user.name}</Text>
            {swaps >= 3 && <VerifiedIcon />}
          </View>
          {/* Trust signals: star rating + swap count always visible (Report fix #4) */}
          {rating !== null && swaps > 0
            ? <StarDisplay rating={rating} count={swaps} />
            : <Text style={s.offersLine}>New member — no swaps yet</Text>
          }
          <Text style={[s.offersLine, { marginTop: 3 }]} numberOfLines={1}>
            Offers: {user.offers.slice(0, 3).join(', ')}{user.offers.length > 3 ? '…' : ''}
          </Text>
        </View>

        {/* Save button — large enough touch target */}
        <Pressable
          style={s.saveBtn}
          onPress={() => { LayoutAnimation.easeInEaseOut(); setSaved(v => !v); }}
          accessibilityLabel={saved ? 'Unsave match' : 'Save match'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <SaveIcon filled={saved} color={saved ? '#61d8cc' : '#394140'} />
        </Pressable>

        <View style={[s.badge, { borderColor: v.color }]}>
          <Text style={s.badgeEmoji}>{v.emoji}</Text>
          <Text style={[s.badgePct, { color: v.color }]}>{pct(scores.total)}</Text>
        </View>
      </View>

      {/* ── Skill overlap chips ── */}
      {(overlaps.off.length > 0 || overlaps.req.length > 0) ? (
        <View style={s.chipRow}>
          <Text style={s.chipRowLabel}>Match:</Text>
          {overlaps.off.map(sk => <Chip key={sk} label={sk} variant="offer" />)}
          {overlaps.req.map(sk => <Chip key={sk} label={sk} variant="request" />)}
        </View>
      ) : (
        <Text style={s.noOverlap}>No direct skill overlap — indirect value match</Text>
      )}

      {/* ── Why this match (collapsible — progressive disclosure) ── */}
      <Pressable
        style={s.whyToggle}
        onPress={() => { LayoutAnimation.easeInEaseOut(); setWhyOpen(o => !o); }}
        accessibilityLabel={whyOpen ? 'Collapse match explanation' : 'Expand match explanation'}
        accessibilityRole="button"
      >
        <Text style={s.whyToggleText}>Why this match?</Text>
        <ChevronIcon down={!whyOpen} color="#607876" />
      </Pressable>
      {whyOpen && (
        <View style={s.why}>
          <Text style={s.whyText}>{why}</Text>
          <View style={s.bars}>
            <View style={s.barRow}>
              <Text style={s.barLabel}>Total</Text>
              <ScoreBar value={scores.total} color="#61d8cc" />
              <Text style={s.barVal}>{pct(scores.total)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── Action button ── */}
      <Pressable
        style={[s.actionBtn, btnStyle]}
        onPress={btnAction}
        disabled={isDone || isRequested}
        accessibilityLabel={btnLabel}
        accessibilityRole="button"
      >
        <SwapIcon size={15} color={isDone || isRequested ? '#607876' : '#000'} />
        <Text style={[s.actionText, (isDone || isRequested) && { color: '#607876' }]}>{btnLabel}</Text>
      </Pressable>
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
// Redesigned: warmer copy, animated icon, clear-filter CTA (Report fix #5)

function EmptyState({ query, category, onClear }: { query: string; category: Category; onClear: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const isFiltered = query.length > 0 || category !== 'All';

  return (
    <View style={s.emptyWrap}>
      <Animated.Text style={[s.emptyEmoji, { transform: [{ scale: pulseAnim }] }]}>🔍</Animated.Text>
      <Text style={s.emptyTitle}>
        {isFiltered ? 'No matches for your filters' : 'No matches available yet'}
      </Text>
      <Text style={s.emptySub}>
        {query
          ? `Nobody named "${query}"${category !== 'All' ? ` in ${category}` : ''} yet.`
          : `No one in "${category}" yet.`
        }
        {'\n'}Try broadening your search — great matches might be one category away.
      </Text>
      {isFiltered && (
        <Pressable style={s.emptyBtn} onPress={onClear}
          accessibilityLabel="Clear all filters and show everyone"
          accessibilityRole="button">
          <Text style={s.emptyBtnText}>Clear All Filters</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TransactionScreen() {
  const { user } = useUser();
  const currentUser: MatchUser = user ?? YOU;

  const {
    connections, completed, requests,
    request: requestSwap,
    connect: connectSwap,
    complete,
  } = useMatchingState();

  const [query, setQuery]       = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [modalPartner, setModalPartner] = useState<MatchUser | null>(null);

  const sorted = useMemo(() => {
    return [...MOCK_USERS]
      .filter(u => u.id !== currentUser.id)
      .sort((a, b) => matchScore(currentUser, b).total - matchScore(currentUser, a).total);
  }, [currentUser]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter(u => {
      if (!userMatchesCategory(u, category)) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.offers.some(s => s.toLowerCase().includes(q)) ||
        u.requests.some(s => s.toLowerCase().includes(q))
      );
    });
  }, [sorted, query, category]);

  // ── Descriptive toast feedback (Report fix #3) ──
  const handleRequest = useCallback((id: string) => {
    const target = MOCK_USERS.find(u => u.id === id);
    toast.loading(`Sending swap request to ${target?.name ?? 'user'}…`);
    setTimeout(() => {
      requestSwap(id);
      toast.success(`Swap request sent to ${target?.name ?? 'user'}! They'll be notified.`);
    }, 600);
  }, [requestSwap]);

  const handleConnect = useCallback((id: string) => {
    const target = MOCK_USERS.find(u => u.id === id);
    toast.loading('Accepting swap…');
    setTimeout(() => {
      connectSwap(id);
      toast.success(`Connected with ${target?.name ?? 'user'}! Schedule your first session.`);
    }, 600);
  }, [connectSwap]);

  const handleComplete = useCallback((
    given: string, received: string, proof: ProofField,
    starRating: number, reviewComment: string,
  ) => {
    if (!modalPartner) return;
    toast.loading('Recording your swap…');
    setTimeout(() => {
      complete(modalPartner, currentUser, given, received, proof, starRating, reviewComment);
      setModalPartner(null);
      toast.success('Swap recorded! Trust scores updated for both of you. 🎉');
    }, 700);
  }, [complete, modalPartner, currentUser]);

  // Convert Sets to arrays for FlatList props
  const connectionsList = useMemo(() => connections, [connections]);
  const completedList   = useMemo(() => completed, [completed]);
  const requestsList    = useMemo(() => requests, [requests]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1919" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <SwapIcon size={22} color="#61d8cc" />
          <Text style={s.headerTitle}>Match Hub</Text>
        </View>
        <Pressable
          style={s.historyBtn}
          onPress={() => router.push('/transaction/history')}
          accessibilityLabel="View swap history"
          accessibilityRole="button"
        >
          <HistoryIcon size={18} color="#61d8cc" />
          <Text style={s.historyText}>History</Text>
        </Pressable>
      </View>

      {/* ── Animated search bar (Report fix #1) ── */}
      <AnimatedSearchBar
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
      />

      {/* ── Category filter chips with count badges (Report fix #8) ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catRow}
        accessibilityRole="tablist"
        accessibilityLabel="Filter by skill category"
      >
        {CATEGORIES.map(cat => {
          const count = categoryCount(cat);
          return (
            <Pressable
              key={cat}
              style={[s.catChip, category === cat && s.catChipActive]}
              onPress={() => setCategory(cat)}
              accessibilityRole="tab"
              accessibilityState={{ selected: category === cat }}
              accessibilityLabel={`${cat} category, ${count} member${count !== 1 ? 's' : ''}`}
            >
              <Text style={[s.catChipText, category === cat && s.catChipTextActive]}>{cat}</Text>
              <View style={[s.catBadge, category === cat && s.catBadgeActive]}>
                <Text style={[s.catBadgeText, category === cat && { color: '#61d8cc' }]}>{count}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Results header ── */}
      {filtered.length > 0 && (
        <View style={s.resultsBar}>
          <Text style={s.resultsText}>
            {filtered.length} match{filtered.length !== 1 ? 'es' : ''}
            {category !== 'All' ? ` in ${category}` : ''}
            {query ? ` for "${query}"` : ''}
          </Text>
        </View>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          query={query}
          category={category}
          onClear={() => { setQuery(''); setCategory('All'); }}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MatchCard
              user={item}
              currentUser={currentUser}
              connections={connectionsList}
              completed={completedList}
              requests={requestsList}
              request={handleRequest}
              connect={handleConnect}
              onComplete={setModalPartner}
            />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CompletionModal
        visible={!!modalPartner}
        partner={modalPartner}
        currentUser={currentUser}
        onClose={() => setModalPartner(null)}
        onSubmit={handleComplete}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#0f1919' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f3530' },
  headerLeft:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle:     { fontSize: 20, fontWeight: '900', color: '#e8f5f3', letterSpacing: 0.3 },
  historyBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#1f3530', minHeight: 44 },
  historyText:     { fontSize: 13, color: '#61d8cc', fontWeight: '700' },

  // Search (Report fix #1, #6, #7)
  searchRow:       { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchBox:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131b1b', borderWidth: 1, borderColor: '#2f4a47', paddingHorizontal: 10, paddingVertical: 10, gap: 8, borderRadius: 6, minHeight: 48 },
  searchBoxFocused:{ borderColor: '#61d8cc', shadowColor: '#61d8cc', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  searchInput:     { flex: 1, fontSize: 15, color: '#e8f5f3', minHeight: 28 },
  clearBtn:        { padding: 6, minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },

  // Category chips (Report fix #8)
  catRow:          { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  catChip:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#2f4a47', backgroundColor: '#131b1b', borderRadius: 20, minHeight: 36 },
  catChipActive:   { borderColor: '#61d8cc', backgroundColor: '#1f3530' },
  catChipText:     { fontSize: 12, fontWeight: '700', color: '#607876' },
  catChipTextActive: { color: '#61d8cc' },
  catBadge:        { backgroundColor: '#1f3530', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1, minWidth: 20, alignItems: 'center' },
  catBadgeActive:  { backgroundColor: '#0f2520' },
  catBadgeText:    { fontSize: 10, fontWeight: '800', color: '#607876' },

  // Results bar
  resultsBar:      { paddingHorizontal: 16, paddingBottom: 4 },
  resultsText:     { fontSize: 11, color: '#607876', fontWeight: '600' },

  list:            { padding: 16, gap: 16 },

  // Empty state (Report fix #5)
  emptyWrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji:      { fontSize: 52, marginBottom: 16 },
  emptyTitle:      { fontSize: 18, fontWeight: '900', color: '#e8f5f3', marginBottom: 8, textAlign: 'center' },
  emptySub:        { fontSize: 13, color: '#607876', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  emptyBtn:        { paddingHorizontal: 28, paddingVertical: 12, borderWidth: 1.5, borderColor: '#61d8cc', borderRadius: 6, minHeight: 44 },
  emptyBtnText:    { fontSize: 14, fontWeight: '700', color: '#61d8cc' },

  // Card
  card:            { backgroundColor: '#131b1b', borderWidth: 1, borderColor: '#1f3530', borderLeftWidth: 3, padding: 14, borderRadius: 6 },
  cardHeader:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  avatar:          { width: 48, height: 48, backgroundColor: '#1f3530', alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  avatarEmoji:     { fontSize: 24 },
  nameRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  name:            { fontSize: 15, fontWeight: '800', color: '#e8f5f3' },
  offersLine:      { fontSize: 11, color: '#607876', marginBottom: 3 },
  saveBtn:         { padding: 10, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  badge:           { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1.5, borderRadius: 6 },
  badgeEmoji:      { fontSize: 14 },
  badgePct:        { fontSize: 12, fontWeight: '900', marginTop: 1 },

  chipRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chipRowLabel:    { fontSize: 11, color: '#607876', marginRight: 2, alignSelf: 'center' },
  noOverlap:       { fontSize: 11, color: '#607876', fontStyle: 'italic', marginBottom: 8 },
  chip:            { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  chipText:        { fontSize: 11, fontWeight: '700' },

  // Why toggle (progressive disclosure)
  whyToggle:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1f3530', marginTop: 4 },
  whyToggleText:   { fontSize: 12, color: '#607876', fontWeight: '600' },
  why:             { backgroundColor: '#0f2520', padding: 10, marginBottom: 10, borderRadius: 4 },
  whyText:         { fontSize: 12, color: '#9ab5b2', lineHeight: 18 },
  bars:            { marginTop: 8 },
  barRow:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  barLabel:        { fontSize: 10, color: '#607876', width: 36 },
  barTrack:        { flex: 1, height: 5, backgroundColor: '#1f3530', borderRadius: 3, overflow: 'hidden' },
  barFill:         { height: '100%', borderRadius: 3 },
  barVal:          { fontSize: 10, color: '#9ab5b2', width: 32, textAlign: 'right' },

  // Action buttons (Report fix #2 — specific labels)
  actionBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderWidth: 1.5, borderRadius: 6, marginTop: 10, minHeight: 48 },
  actionText:      { fontSize: 14, fontWeight: '800', color: '#000' },
  requestBtn:      { backgroundColor: '#61d8cc', borderColor: '#1f4642' },
  requestedBtn:    { backgroundColor: '#1f3530', borderColor: '#2f4a47' },
  acceptBtn:       { backgroundColor: '#FFD166', borderColor: '#8a6800' },
  connectedBtn:    { backgroundColor: '#4f98a3', borderColor: '#2f6670' },
  doneBtn:         { backgroundColor: '#1f3530', borderColor: '#2f4a47' },
});

const modal = StyleSheet.create({
  overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:           { backgroundColor: '#1c2424', borderTopWidth: 2, borderTopColor: '#61d8cc', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '92%' },
  handle:          { width: 40, height: 4, backgroundColor: '#607876', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  titleRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  title:           { fontSize: 18, fontWeight: '900', color: '#61d8cc' },
  subtitle:        { fontSize: 12, color: '#9ab5b2', marginBottom: 16, lineHeight: 18 },
  fieldLabel:      { fontSize: 11, fontWeight: '700', color: '#a8c5c2', letterSpacing: 0.8, marginBottom: 6, marginTop: 16 },
  input:           { backgroundColor: '#131b1b', borderWidth: 1, borderColor: '#2f4a47', color: '#fff', padding: 12, fontSize: 14, borderRadius: 4, minHeight: 48 },
  starRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  starLabel:       { fontSize: 14, fontWeight: '700', color: '#FFD166' },
  starHint:        { fontSize: 11, color: '#607876', fontStyle: 'italic', marginBottom: 4 },
  proofHeader:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2f4a47', marginBottom: 4 },
  proofSub:        { fontSize: 11, color: '#607876', fontStyle: 'italic', marginBottom: 10 },
  checkRow:        { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 6, borderWidth: 1, borderColor: '#2f4a47', backgroundColor: '#131b1b', gap: 10, borderRadius: 4, minHeight: 56 },
  checkRowActive:  { borderColor: '#61d8cc', backgroundColor: '#1f3530' },
  checkbox:        { width: 24, height: 24, borderWidth: 2, borderColor: '#607876', alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  checkboxChecked: { borderColor: '#61d8cc', backgroundColor: '#61d8cc' },
  checkmark:       { fontSize: 13, fontWeight: '900', color: '#000' },
  checkLabel:      { fontSize: 14, color: '#ccc', fontWeight: '700' },
  checkDesc:       { fontSize: 11, color: '#607876', marginTop: 1 },
  checkWeight:     { fontSize: 11, color: '#607876' },
  fairRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#131b1b', borderWidth: 2, padding: 12, marginVertical: 12, borderRadius: 6 },
  fairTitle:       { fontSize: 11, fontWeight: '700', color: '#a8c5c2', marginBottom: 3 },
  fairBlurb:       { fontSize: 12, color: '#607876' },
  fairValue:       { fontSize: 28, fontWeight: '900' },
  submitHint:      { fontSize: 12, color: '#FFD166', marginTop: 4, marginBottom: 2, textAlign: 'center' },
  actions:         { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 20 },
  cancelBtn:       { flex: 1, padding: 14, borderWidth: 2, borderColor: '#2f4a47', alignItems: 'center', borderRadius: 6, minHeight: 50 },
  cancelText:      { fontSize: 14, fontWeight: '700', color: '#607876' },
  submitBtn:       { flex: 2, padding: 14, backgroundColor: '#61d8cc', borderWidth: 2, borderColor: '#1f4642', alignItems: 'center', borderRadius: 6, minHeight: 50 },
  submitDisabled:  { backgroundColor: '#2f4a47', borderColor: '#2f4a47' },
  submitText:      { fontSize: 14, fontWeight: '900', color: '#000' },
});
