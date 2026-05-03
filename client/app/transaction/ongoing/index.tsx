/**
 * Ongoing — Active Swap Workspace
 *
 * One card per live connection. Each card shows:
 *   • Who + what you're exchanging
 *   • Agreed scope
 *   • Deadline countdown (days left, colour-coded)
 *   • Check-in thread (mini chat log of progress notes)
 *   • Add Check-in inline
 *   • Complete Swap → launches CompletionModal from index.tsx
 *
 * Design intent (Norman): the screen is a work surface, not a list.
 * Every element is there because you need it right now to do the swap.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, StatusBar, TextInput, LayoutAnimation,
  Platform, UIManager, Modal,
} from 'react-native';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
import { router } from 'expo-router';
import {
  useMatchingState,
  type MatchUser, type ProofField,
  fairnessFromProof,
} from '@/lib/matching/matching';
import { MOCK_USERS, ACTIVE_SWAPS, type ActiveSwapMeta, YOU } from '@/lib/matching/data';
import { toast } from '@/components/ui/toast';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental)
  UIManager.setLayoutAnimationEnabledExperimental(true);

// ─── helpers ──────────────────────────────────────────────────────────────────

function daysLeft(isoDeadline: string): number {
  const diff = new Date(isoDeadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function deadlineColor(days: number) {
  if (days <= 1) return '#EF767A';
  if (days <= 3) return '#FFD166';
  return '#61d8cc';
}

function pct(v: number) { return `${Math.round(v * 100)}%`; }

// ─── Icons ────────────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#101414" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SwapIcon({ size = 16, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 8h14M14 5l3 3-3 3" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 16H7M10 13l-3 3 3 3" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckInIcon({ size = 14, color = '#61d8cc' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.75} />
      <Path d="M8 12l3 3 5-5" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClockIcon({ size = 13, color = '#61d8cc' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.75} />
      <Path d="M12 7v5l3 3" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
    </Svg>
  );
}

function SendIcon({ size = 14, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={color} strokeWidth={1.75}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
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

// ─── CompletionModal ──────────────────────────────────────────────────────────

function CompletionModal({
  visible, partner, onClose, onSubmit,
}: {
  visible: boolean;
  partner: MatchUser | null;
  onClose: () => void;
  onSubmit: (given: string, received: string, proof: ProofField, starRating: number, reviewComment: string) => void;
}) {
  const [given, setGiven]             = useState('');
  const [received, setReceived]       = useState('');
  const [starRating, setStarRating]   = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [proof, setProof]             = useState<ProofField>({
    deliveredOnTime: false, scopeMatchedAgreement: false,
    portfolioEvidenceAttached: false, wouldSwapAgain: false, notes: '',
  });

  // Pre-fill from active swap meta when partner changes
  React.useEffect(() => {
    if (!partner) return;
    const meta = ACTIVE_SWAPS.find(m => m.userId === partner.id);
    if (meta) {
      setGiven(meta.youGive);
      setReceived(meta.theyGive);
    }
  }, [partner]);

  const toggle = (key: keyof Omit<ProofField, 'notes'>) =>
    setProof(p => ({ ...p, [key]: !p[key] }));

  const fairness = fairnessFromProof(proof);
  const fairLabel =
    fairness >= 0.85 ? 'Excellent \u2014 their trust score goes up.' :
    fairness >= 0.65 ? 'Good swap recorded.' :
    fairness >= 0.35 ? 'Partial \u2014 some issues noted.' :
    'Poor swap \u2014 trust score will reflect this.';

  const starLabel = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][starRating] ?? '';
  const canSubmit = given.trim() && received.trim() && starRating > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(given.trim(), received.trim(), proof, starRating, reviewComment.trim());
    setGiven(''); setReceived(''); setStarRating(0); setReviewComment('');
    setProof({ deliveredOnTime: false, scopeMatchedAgreement: false,
               portfolioEvidenceAttached: false, wouldSwapAgain: false, notes: '' });
  }

  if (!partner) return null;

  const checks: { key: keyof Omit<ProofField,'notes'>; label: string; weight: string }[] = [
    { key: 'deliveredOnTime',           label: 'Delivered on time',             weight: '\u00d70.35' },
    { key: 'scopeMatchedAgreement',     label: 'Scope matched agreement',       weight: '\u00d70.35' },
    { key: 'portfolioEvidenceAttached', label: 'Evidence / portfolio attached',  weight: '\u00d70.15' },
    { key: 'wouldSwapAgain',            label: 'Would swap again',               weight: '\u00d70.15' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={mo.overlay}>
        <View style={mo.sheet}>
          <View style={mo.handle} />
          <View style={mo.titleRow}>
            <SwapIcon size={18} color="#61d8cc" />
            <Text style={mo.title}>Complete swap with {partner.name}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={mo.label}>Skill you gave</Text>
            <TextInput style={mo.input} value={given} onChangeText={setGiven}
              placeholder="Web Dev" placeholderTextColor="#607876" />
            <Text style={mo.label}>Skill you received</Text>
            <TextInput style={mo.input} value={received} onChangeText={setReceived}
              placeholder="Graphic Design" placeholderTextColor="#607876" />

            {/* Star rating */}
            <Text style={mo.label}>Overall rating (required)</Text>
            <View style={mo.starRow}>
              <StarRating value={starRating} onChange={setStarRating} size={30} />
              {starRating > 0 && (
                <Text style={mo.starLabel}>{starLabel}</Text>
              )}
            </View>
            {starRating === 0 && (
              <Text style={mo.starHint}>Tap a star to rate {partner.name}\u2019s performance</Text>
            )}

            {/* Review comment */}
            <Text style={mo.label}>Review (optional)</Text>
            <TextInput
              style={[mo.input, { height: 60, textAlignVertical: 'top' }]}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder={`What was it like swapping with ${partner.name}?`}
              placeholderTextColor="#607876"
              multiline
            />

            <Text style={[mo.label, { marginTop: 16 }]}>How did it go?</Text>
            {checks.map(c => (
              <Pressable key={c.key}
                style={[mo.check, proof[c.key] && mo.checkActive]}
                onPress={() => toggle(c.key)}>
                <View style={[mo.box, proof[c.key] && mo.boxChecked]}>
                  {proof[c.key] && <Text style={mo.tick}>\u2713</Text>}
                </View>
                <Text style={mo.checkLabel}>{c.label}</Text>
                <Text style={mo.checkWeight}>{c.weight}</Text>
              </Pressable>
            ))}
            <View style={[mo.fairRow, {
              borderColor: fairness >= 0.65 ? '#61d8cc' : fairness >= 0.35 ? '#FFD166' : '#EF767A'
            }]}>
              <Text style={mo.fairLabel}>Fairness</Text>
              <Text style={[mo.fairVal, {
                color: fairness >= 0.65 ? '#61d8cc' : fairness >= 0.35 ? '#FFD166' : '#EF767A'
              }]}>{pct(fairness)}</Text>
              <Text style={mo.fairBlurb}>{fairLabel}</Text>
            </View>
            <Text style={mo.label}>Notes (optional)</Text>
            <TextInput style={[mo.input, { height: 64, textAlignVertical: 'top' }]}
              value={proof.notes ?? ''}
              onChangeText={t => setProof(p => ({ ...p, notes: t }))}
              placeholder="Links, context\u2026" placeholderTextColor="#607876" multiline />

            {!canSubmit && (
              <Text style={mo.submitHint}>
                {!given.trim() || !received.trim()
                  ? '\u26a0 Enter the skills exchanged above to continue.'
                  : '\u26a0 A star rating is required before submitting.'}
              </Text>
            )}

            <View style={mo.actions}>
              <Pressable style={mo.cancel} onPress={onClose}>
                <Text style={mo.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[mo.submit, !canSubmit && mo.submitDis]}
                onPress={handleSubmit}
                disabled={!canSubmit}>
                <SwapIcon size={15} color="#000" />
                <Text style={mo.submitText}>Submit Swap</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── CheckInThread ─────────────────────────────────────────────────────────────

type CheckIn = { date: string; note: string; fromMe: boolean };

function CheckInThread({
  checkIns, onAdd,
}: {
  checkIns: CheckIn[];
  onAdd: (note: string) => void;
}) {
  const [input, setInput] = useState('');
  const [open, setOpen]   = useState(false);

  function submit() {
    if (!input.trim()) return;
    onAdd(input.trim());
    setInput('');
    setOpen(false);
  }

  return (
    <View style={ct.container}>
      <Text style={ct.heading}>CHECK-INS</Text>
      {checkIns.map((c, i) => (
        <View key={i} style={[ct.bubble, c.fromMe ? ct.bubbleMe : ct.bubbleThem]}>
          <Text style={ct.bubbleMeta}>
            {c.fromMe ? 'You' : 'Them'} \u00b7 {formatDate(c.date)}
          </Text>
          <Text style={[ct.bubbleText, c.fromMe ? ct.bubbleTextMe : ct.bubbleTextThem]}>
            {c.note}
          </Text>
        </View>
      ))}
      {!open ? (
        <Pressable style={ct.addBtn} onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setOpen(true);
        }}>
          <CheckInIcon size={13} color="#61d8cc" />
          <Text style={ct.addBtnText}>Add check-in</Text>
        </Pressable>
      ) : (
        <View style={ct.inputRow}>
          <TextInput
            style={ct.input}
            value={input}
            onChangeText={setInput}
            placeholder="Progress note\u2026"
            placeholderTextColor="#607876"
            multiline
            autoFocus
          />
          <Pressable style={ct.sendBtn} onPress={submit}>
            <SendIcon size={14} color="#000" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── SwapCard ─────────────────────────────────────────────────────────────────

function SwapCard({
  user,
  meta,
  onComplete,
}: {
  user: MatchUser;
  meta: ActiveSwapMeta;
  onComplete: () => void;
}) {
  const days  = daysLeft(meta.deadlineIso);
  const dCol  = deadlineColor(days);
  const urgency = days <= 1 ? 'DUE TODAY' : days <= 3 ? `${days} DAYS LEFT` : `${days} days left`;

  const [checkIns, setCheckIns] = useState<CheckIn[]>(meta.checkIns);

  function addCheckIn(note: string) {
    setCheckIns(prev => [
      ...prev,
      { date: new Date().toISOString(), note, fromMe: true },
    ]);
  }

  return (
    <View style={sw.card}>
      {/* Header */}
      <View style={sw.header}>
        <View style={sw.avatarWrap}>
          <Text style={sw.avatarEmoji}>{user.avatar}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={sw.name}>{user.name}</Text>
          <Text style={sw.subline}>Active swap</Text>
        </View>
        <View style={[sw.deadline, { borderColor: dCol }]}>
          <ClockIcon size={11} color={dCol} />
          <Text style={[sw.deadlineText, { color: dCol }]}>{urgency}</Text>
        </View>
      </View>

      {/* Exchange banner */}
      <View style={sw.exchange}>
        <View style={sw.side}>
          <Text style={sw.sideLabel}>YOU GIVE</Text>
          <Text style={sw.sideSkill}>{meta.youGive}</Text>
        </View>
        <SwapIcon size={18} color="#61d8cc" />
        <View style={[sw.side, { alignItems: 'flex-end' }]}>
          <Text style={sw.sideLabel}>YOU GET</Text>
          <Text style={sw.sideSkill}>{meta.theyGive}</Text>
        </View>
      </View>

      {/* Agreed scope */}
      <View style={sw.scope}>
        <Text style={sw.scopeLabel}>AGREED SCOPE</Text>
        <Text style={sw.scopeText}>{meta.agreedScope}</Text>
      </View>

      {/* Check-in thread */}
      <CheckInThread checkIns={checkIns} onAdd={addCheckIn} />

      {/* Actions */}
      <View style={sw.actions}>
        <Pressable
          style={sw.completeBtn}
          onPress={onComplete}
          accessibilityLabel={`Complete swap with ${user.name}`}>
          <SwapIcon size={16} color="#000" />
          <Text style={sw.completeBtnText}>Complete Swap</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function OngoingScreen() {
  const { connections, complete } = useMatchingState();
  const [completionTarget, setCompletionTarget] = useState<MatchUser | null>(null);

  const activeUsers = useMemo(
    () => MOCK_USERS.filter(u => connections.has(u.id)),
    [connections],
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={s.nav}>
        <Pressable onPress={() => router.back()} style={s.navBack}>
          <BackIcon />
        </Pressable>
        <Text style={s.navTitle}>Active Swaps</Text>
        <View style={s.navBadge}>
          <Text style={s.navBadgeText}>{activeUsers.length}</Text>
        </View>
      </View>

      {activeUsers.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>\ud83e\udd1d</Text>
          <Text style={s.emptyTitle}>No active swaps</Text>
          <Text style={s.emptySub}>
            Accept a match from the hub to start a swap.
          </Text>
          <Pressable style={s.emptyBtn} onPress={() => router.push('/transaction')}>
            <Text style={s.emptyBtnText}>Go to Match Hub</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}>
          {activeUsers.map(user => {
            const meta = ACTIVE_SWAPS.find(m => m.userId === user.id) ?? {
              userId: user.id,
              youGive: YOU.offers[0],
              theyGive: user.offers[0],
              agreedScope: 'Scope not yet defined \u2014 add a check-in to document your agreement.',
              deadlineIso: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              checkIns: [],
            };
            return (
              <SwapCard
                key={user.id}
                user={user}
                meta={meta}
                onComplete={() => setCompletionTarget(user)}
              />
            );
          })}
        </ScrollView>
      )}

      <CompletionModal
        visible={completionTarget !== null}
        partner={completionTarget}
        onClose={() => setCompletionTarget(null)}
        onSubmit={(given, received, proof, starRating, reviewComment) => {
          if (!completionTarget) return;
          toast.loading('Recording swap\u2026');
          setTimeout(() => {
            complete(completionTarget, YOU, given, received, proof, starRating, reviewComment);
            toast.success(`Swap with ${completionTarget.name} recorded! Check History for the full breakdown.`);
            setCompletionTarget(null);
          }, 500);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#d6d8d3' },
  nav:          {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ececea', borderBottomWidth: 2, borderBottomColor: '#2f3333',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  navBack:      { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  navTitle:     { flex: 1, fontSize: 17, fontWeight: '800', color: '#101414' },
  navBadge:     {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#61d8cc',
    borderWidth: 2, borderColor: '#1f4642',
    alignItems: 'center', justifyContent: 'center',
  },
  navBadgeText: { fontSize: 13, fontWeight: '900', color: '#000' },
  scroll:       { padding: 14, gap: 16 },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyEmoji:   { fontSize: 48 },
  emptyTitle:   { fontSize: 20, fontWeight: '800', color: '#101414' },
  emptySub:     { fontSize: 14, color: '#394140', textAlign: 'center', lineHeight: 20 },
  emptyBtn:     {
    marginTop: 8, backgroundColor: '#61d8cc',
    borderWidth: 2, borderColor: '#1f4642',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#000' },
});

const sw = StyleSheet.create({
  card:         {
    backgroundColor: '#f3f4f1', borderWidth: 2, borderColor: '#2f3333',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  header:       {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#d0d2ce',
  },
  avatarWrap:   {
    width: 44, height: 44, backgroundColor: '#61d8cc',
    borderWidth: 2, borderColor: '#1f4642',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji:  { fontSize: 22 },
  name:         { fontSize: 17, fontWeight: '800', color: '#101414' },
  subline:      { fontSize: 12, color: '#394140', marginTop: 1 },
  deadline:     {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 2, paddingHorizontal: 8, paddingVertical: 4,
  },
  deadlineText: { fontSize: 11, fontWeight: '800' },
  exchange:     {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1f4642', padding: 12, gap: 8,
  },
  side:         { flex: 1 },
  sideLabel:    { fontSize: 9, fontWeight: '700', color: '#61d8cc', letterSpacing: 1.2, marginBottom: 3 },
  sideSkill:    { fontSize: 15, fontWeight: '800', color: '#fff' },
  scope:        {
    backgroundColor: '#e8ebe5', borderTopWidth: 1, borderTopColor: '#d0d2ce',
    padding: 12,
  },
  scopeLabel:   { fontSize: 9, fontWeight: '700', color: '#394140', letterSpacing: 1.2, marginBottom: 4 },
  scopeText:    { fontSize: 13, color: '#2f3333', lineHeight: 19 },
  actions:      { borderTopWidth: 1, borderTopColor: '#d0d2ce', padding: 10 },
  completeBtn:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFD166', borderWidth: 2, borderColor: '#8a6800',
    paddingVertical: 12,
  },
  completeBtnText: { fontSize: 15, fontWeight: '800', color: '#000' },
});

const ct = StyleSheet.create({
  container:    { borderTopWidth: 1, borderTopColor: '#d0d2ce', padding: 12 },
  heading:      { fontSize: 9, fontWeight: '700', color: '#394140', letterSpacing: 1.2, marginBottom: 8 },
  bubble:       { padding: 10, marginBottom: 6, maxWidth: '85%' },
  bubbleMe:     { backgroundColor: '#1f4642', alignSelf: 'flex-end' },
  bubbleThem:   { backgroundColor: '#e8ebe5', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#d0d2ce' },
  bubbleMeta:   { fontSize: 10, color: '#9ab5b2', marginBottom: 3 },
  bubbleText:   { fontSize: 13, lineHeight: 18 },
  bubbleTextMe:   { color: '#fff' },
  bubbleTextThem: { color: '#2f3333' },
  addBtn:       {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#2f3333', borderStyle: 'dashed',
    padding: 10, marginTop: 4,
  },
  addBtnText:   { fontSize: 13, fontWeight: '700', color: '#2a8780' },
  inputRow:     { flexDirection: 'row', gap: 8, marginTop: 6 },
  input:        {
    flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#2f3333',
    padding: 10, fontSize: 13, color: '#101414', minHeight: 44,
    textAlignVertical: 'top',
  },
  sendBtn:      {
    width: 44, height: 44, backgroundColor: '#61d8cc',
    borderWidth: 2, borderColor: '#1f4642',
    alignItems: 'center', justifyContent: 'center',
  },
});

const mo = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:        {
    backgroundColor: '#1c2424', borderTopWidth: 2, borderTopColor: '#61d8cc',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    padding: 20, maxHeight: '92%',
  },
  handle:       { width: 40, height: 4, backgroundColor: '#607876', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  titleRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  title:        { fontSize: 17, fontWeight: '900', color: '#61d8cc' },
  label:        { fontSize: 11, fontWeight: '700', color: '#a8c5c2', letterSpacing: 0.8, marginBottom: 6, marginTop: 12 },
  input:        {
    backgroundColor: '#131b1b', borderWidth: 1, borderColor: '#2f4a47',
    color: '#fff', padding: 10, fontSize: 14,
  },
  starRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  starLabel:    { fontSize: 14, fontWeight: '700', color: '#FFD166' },
  starHint:     { fontSize: 11, color: '#607876', fontStyle: 'italic', marginBottom: 4 },
  check:        {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderWidth: 1, borderColor: '#2f4a47',
    backgroundColor: '#131b1b', marginBottom: 6,
  },
  checkActive:  { borderColor: '#61d8cc', backgroundColor: '#1f3530' },
  box:          { width: 22, height: 22, borderWidth: 2, borderColor: '#607876', alignItems: 'center', justifyContent: 'center' },
  boxChecked:   { borderColor: '#61d8cc', backgroundColor: '#61d8cc' },
  tick:         { fontSize: 13, fontWeight: '900', color: '#000' },
  checkLabel:   { flex: 1, fontSize: 13, color: '#ccc', fontWeight: '600' },
  checkWeight:  { fontSize: 11, color: '#607876' },
  fairRow:      {
    borderWidth: 2, padding: 12, marginVertical: 12,
    backgroundColor: '#131b1b',
  },
  fairLabel:    { fontSize: 10, fontWeight: '700', color: '#a8c5c2', marginBottom: 2 },
  fairVal:      { fontSize: 28, fontWeight: '900', marginBottom: 2 },
  fairBlurb:    { fontSize: 12, color: '#607876' },
  submitHint:   { fontSize: 12, color: '#FFD166', marginTop: 4, marginBottom: 2, textAlign: 'center' },
  actions:      { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 24 },
  cancel:       { flex: 1, padding: 14, borderWidth: 2, borderColor: '#2f4a47', alignItems: 'center' },
  cancelText:   { fontSize: 14, fontWeight: '700', color: '#607876' },
  submit:       { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: '#61d8cc', borderWidth: 2, borderColor: '#1f4642' },
  submitDis:    { backgroundColor: '#2f4a47', borderColor: '#2f4a47' },
  submitText:   { fontSize: 14, fontWeight: '900', color: '#000' },
});
