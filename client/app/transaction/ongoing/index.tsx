/**
 * /transaction/ongoing  — Active swaps in progress
 * Shows users you've connected with but haven't completed yet.
 * "Mark Complete" opens a quick proof form inline, then calls completeSwap.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, StatusBar, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { router, useFocusEffect } from 'expo-router';
import { MOCK_USERS, YOU } from '@/lib/matching/data';
import {
  getMatchingState,
  completeSwap,
  type ProofField,
  type MatchUser,
} from '@/lib/matching/matching';

const C = {
  bg: '#7DE5E5', bgDeep: '#8FEBE5',
  glass: 'rgba(255,255,255,0.55)', glassBorder: 'rgba(255,255,255,0.45)',
  glowOne: 'rgba(255,255,255,0.22)', glowTwo: 'rgba(255,255,255,0.15)',
  black: '#000', blackMid: 'rgba(0,0,0,0.78)', blackSoft: 'rgba(0,0,0,0.55)',
  teal: '#61d8cc', tealDark: '#2a8780',
  orange: '#FF8C42', gold: '#FFD166',
  red: '#EF767A', shadow: '#000',
};

function Island({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <View style={isl.outer}>
      <View style={isl.glow1} />
      <View style={isl.glow2} />
      <View style={[isl.inner, accent ? { borderColor: accent, borderWidth: 1.5 } : null]}>
        {children}
      </View>
    </View>
  );
}
const isl = StyleSheet.create({
  outer:  { paddingVertical: 14, overflow: 'visible' },
  glow1:  { position: 'absolute', left: 0, right: 0, top: 14, bottom: 14, borderRadius: 14, backgroundColor: C.glowOne, transform: [{ scale: 1.07 }] },
  glow2:  { position: 'absolute', left: 0, right: 0, top: 14, bottom: 14, borderRadius: 14, backgroundColor: C.glowTwo, transform: [{ scale: 1.12 }] },
  inner:  { borderRadius: 12, padding: 16, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder, shadowColor: C.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 14, elevation: 8 },
});

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={C.black} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Pressable key={i} onPress={() => onChange(i)} hitSlop={8}>
          <Text style={{ fontSize: 24, color: i <= value ? C.gold : 'rgba(0,0,0,0.18)' }}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

type ProofState = {
  deliveredOnTime: boolean;
  scopeMatchedAgreement: boolean;
  portfolioEvidenceAttached: boolean;
  wouldSwapAgain: boolean;
  notes: string;
  star: number;
  skillGiven: string;
  skillReceived: string;
};

function ProofModal({
  user,
  visible,
  onClose,
  onSubmit,
}: {
  user: MatchUser;
  visible: boolean;
  onClose: () => void;
  onSubmit: (p: ProofState) => void;
}) {
  const [p, setP] = useState<ProofState>({
    deliveredOnTime: true,
    scopeMatchedAgreement: true,
    portfolioEvidenceAttached: false,
    wouldSwapAgain: true,
    notes: '',
    star: 5,
    skillGiven: YOU.offers[0] ?? '',
    skillReceived: user.offers[0] ?? '',
  });

  function toggle(key: keyof ProofState) {
    setP(prev => ({ ...prev, [key]: !prev[key as keyof ProofState] }));
  }

  const BoolRow = ({ label, k }: { label: string; k: keyof ProofState }) => (
    <Pressable
      onPress={() => toggle(k)}
      style={[pm.boolRow, (p[k] as boolean) && pm.boolRowOn]}
      accessibilityRole="checkbox"
    >
      <Text style={pm.boolCheck}>{(p[k] as boolean) ? '✓' : '○'}</Text>
      <Text style={pm.boolLabel}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={pm.backdrop}>
        <SafeAreaView style={pm.sheet}>
          <View style={pm.header}>
            <Text style={pm.title}>Complete swap with {user.name}</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
              <Text style={pm.close}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={pm.body} showsVerticalScrollIndicator={false}>
            <Text style={pm.sectionLabel}>SKILL EXCHANGED</Text>
            <View style={pm.row}>
              <View style={{ flex: 1 }}>
                <Text style={pm.fieldLabel}>You gave</Text>
                <TextInput
                  style={pm.input}
                  value={p.skillGiven}
                  onChangeText={v => setP(prev => ({ ...prev, skillGiven: v }))}
                  placeholder="e.g. Python tutoring"
                  placeholderTextColor="rgba(0,0,0,0.3)"
                />
              </View>
              <Text style={{ fontSize: 20, color: C.blackSoft, marginTop: 22 }}>⇄</Text>
              <View style={{ flex: 1 }}>
                <Text style={pm.fieldLabel}>You received</Text>
                <TextInput
                  style={pm.input}
                  value={p.skillReceived}
                  onChangeText={v => setP(prev => ({ ...prev, skillReceived: v }))}
                  placeholder="e.g. Logo design"
                  placeholderTextColor="rgba(0,0,0,0.3)"
                />
              </View>
            </View>

            <Text style={[pm.sectionLabel, { marginTop: 16 }]}>PROOF OF SWAP</Text>
            <BoolRow label="Delivered on time" k="deliveredOnTime" />
            <BoolRow label="Scope matched agreement" k="scopeMatchedAgreement" />
            <BoolRow label="Portfolio evidence attached" k="portfolioEvidenceAttached" />
            <BoolRow label="Would swap again" k="wouldSwapAgain" />

            <Text style={[pm.sectionLabel, { marginTop: 16 }]}>YOUR RATING</Text>
            <StarPicker value={p.star} onChange={v => setP(prev => ({ ...prev, star: v }))} />

            <Text style={[pm.sectionLabel, { marginTop: 16 }]}>NOTES (optional)</Text>
            <TextInput
              style={[pm.input, { minHeight: 72, textAlignVertical: 'top' }]}
              value={p.notes}
              onChangeText={v => setP(prev => ({ ...prev, notes: v }))}
              placeholder="How did the swap go?"
              placeholderTextColor="rgba(0,0,0,0.3)"
              multiline
            />

            <Pressable
              onPress={() => onSubmit(p)}
              style={({ pressed }) => [pm.submitBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
            >
              <Text style={pm.submitTxt}>Mark as Complete ›</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const pm = StyleSheet.create({
  backdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: C.bgDeep, maxHeight: '92%', borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title:       { fontSize: 17, fontWeight: '800', color: C.black, flex: 1 },
  close:       { fontSize: 18, color: C.blackSoft, paddingLeft: 12 },
  body:        { paddingHorizontal: 20, paddingBottom: 40, gap: 8 },
  sectionLabel:{ fontSize: 9, fontWeight: '800', letterSpacing: 1.4, color: C.blackSoft, marginBottom: 6 },
  row:         { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  fieldLabel:  { fontSize: 12, fontWeight: '700', color: C.blackSoft, marginBottom: 4 },
  input:       { borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: C.glassBorder, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: C.black },
  boolRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: 'transparent' },
  boolRowOn:   { backgroundColor: 'rgba(42,135,128,0.12)', borderColor: C.teal },
  boolCheck:   { fontSize: 16, width: 20, textAlign: 'center', color: C.tealDark },
  boolLabel:   { fontSize: 13, color: C.blackMid, fontWeight: '600' },
  submitBtn:   { marginTop: 20, borderRadius: 8, paddingVertical: 14, backgroundColor: C.tealDark, alignItems: 'center' },
  submitTxt:   { fontSize: 16, fontWeight: '800', color: '#fff' },
});

export default function OngoingScreen() {
  const [tick, setTick] = useState(0);
  const [modalUser, setModalUser] = useState<MatchUser | null>(null);
  useFocusEffect(useCallback(() => { setTick(t => t + 1); }, []));

  const { connections } = getMatchingState();
  const active = MOCK_USERS.filter(u => connections.has(u.id));

  function handleComplete(user: MatchUser, proof: ProofState) {
    const pf: ProofField = {
      deliveredOnTime: proof.deliveredOnTime,
      scopeMatchedAgreement: proof.scopeMatchedAgreement,
      portfolioEvidenceAttached: proof.portfolioEvidenceAttached,
      wouldSwapAgain: proof.wouldSwapAgain,
      notes: proof.notes || undefined,
    };
    completeSwap(
      user, YOU,
      proof.skillGiven, proof.skillReceived,
      pf, undefined,
      proof.star,
      proof.notes || undefined,
    );
    setModalUser(null);
    router.back();
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.bgLayer} />

      <View style={s.nav}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [s.backPill, pressed && { opacity: 0.75 }]} accessibilityLabel="Go back">
          <BackIcon />
          <Text style={s.backText}>Back</Text>
        </Pressable>
        <Text style={s.navTitle}>Ongoing Swaps</Text>
        <View style={{ width: 72 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {active.length === 0 ? (
          <Island>
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🔄</Text>
              <Text style={s.emptyTitle}>No active swaps yet</Text>
              <Text style={s.emptySub}>Accept an incoming request to start a swap.</Text>
            </View>
          </Island>
        ) : active.map(user => {
          const theyOffer = user.offers.filter(o => YOU.requests.includes(o));
          const youOffer  = YOU.offers.filter(o => user.requests.includes(o));
          return (
            <Island key={user.id} accent={C.orange}>
              <View style={s.cardHeader}>
                <View style={s.avatar}>
                  <Text style={s.avatarEmoji}>{user.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.userName}>{user.name}</Text>
                  <Text style={s.statusBadge}>🔄 In progress</Text>
                </View>
              </View>

              <View style={s.swapRow}>
                <View style={s.swapCol}>
                  <Text style={s.swapLabel}>They offer you</Text>
                  {theyOffer.length > 0
                    ? theyOffer.map(sk => <Text key={sk} style={s.skill}>✓ {sk}</Text>)
                    : <Text style={s.skillMuted}>No direct match</Text>}
                </View>
                <Text style={s.arrow}>⇄</Text>
                <View style={s.swapCol}>
                  <Text style={s.swapLabel}>You offer them</Text>
                  {youOffer.length > 0
                    ? youOffer.map(sk => <Text key={sk} style={s.skill}>✓ {sk}</Text>)
                    : <Text style={s.skillMuted}>No direct match</Text>}
                </View>
              </View>

              <View style={s.divider} />
              <View style={s.actionRow}>
                <Pressable
                  onPress={() => router.push(`/transaction/score-breakdown?userId=${user.id}` as any)}
                  style={({ pressed }) => [s.detailBtn, pressed && { opacity: 0.8 }]}
                  accessibilityRole="button"
                >
                  <Text style={s.detailTxt}>Score ›</Text>
                </Pressable>
                <Pressable
                  onPress={() => setModalUser(user)}
                  style={({ pressed }) => [s.completeBtn, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                >
                  <Text style={s.completeTxt}>Mark Complete ›</Text>
                </Pressable>
              </View>
            </Island>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>

      {modalUser && (
        <ProofModal
          user={modalUser}
          visible
          onClose={() => setModalUser(null)}
          onSubmit={p => handleComplete(modalUser, p)}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bgDeep },
  bgLayer:     { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg },
  nav:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, zIndex: 2 },
  backPill:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder },
  backText:    { fontSize: 13, fontWeight: '700', color: C.black },
  navTitle:    { fontSize: 18, fontWeight: '800', color: C.black },
  scroll:      { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },
  empty:       { alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyEmoji:  { fontSize: 40 },
  emptyTitle:  { fontSize: 17, fontWeight: '800', color: C.black },
  emptySub:    { fontSize: 13, color: C.blackSoft, textAlign: 'center', maxWidth: 260 },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar:      { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1.5, borderColor: C.glassBorder, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 24 },
  userName:    { fontSize: 18, fontWeight: '800', color: C.black },
  statusBadge: { fontSize: 12, color: C.orange, fontWeight: '700', marginTop: 2 },
  swapRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  swapCol:     { flex: 1, gap: 4 },
  swapLabel:   { fontSize: 11, fontWeight: '800', color: C.blackSoft, letterSpacing: 0.6, marginBottom: 4 },
  skill:       { fontSize: 13, fontWeight: '600', color: C.tealDark },
  skillMuted:  { fontSize: 12, color: C.blackSoft, fontStyle: 'italic' },
  arrow:       { fontSize: 22, color: C.blackSoft, marginTop: 20 },
  divider:     { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 12 },
  actionRow:   { flexDirection: 'row', gap: 10 },
  detailBtn:   { flex: 0, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: 'rgba(97,216,204,0.2)', borderWidth: 1, borderColor: C.teal },
  detailTxt:   { fontSize: 13, fontWeight: '700', color: C.tealDark },
  completeBtn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center', backgroundColor: C.tealDark },
  completeTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
