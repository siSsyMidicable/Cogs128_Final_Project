import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import type { MatchUser, ProofField } from '@/lib/matching/matching';
import { Atelier } from '@/lib/atelier/theme';

type Props = {
  visible: boolean;
  partner: MatchUser | null;
  currentUser: MatchUser;
  onClose: () => void;
  onSubmit: (
    given: string,
    received: string,
    proof: ProofField,
    starRating: number,
    reviewComment: string,
  ) => void;
};

function fairnessFromProof(proof: ProofField): number {
  let f = 0;
  if (proof.deliveredOnTime) f += 0.35;
  if (proof.scopeMatchedAgreement) f += 0.35;
  if (proof.portfolioEvidenceAttached) f += 0.15;
  if (proof.wouldSwapAgain) f += 0.15;
  return f;
}

export function RecordSwapSheet({
  visible,
  partner,
  currentUser,
  onClose,
  onSubmit,
}: Props) {
  const [given, setGiven] = useState('');
  const [received, setReceived] = useState('');
  const [starRating, setStarRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [proofOpen, setProofOpen] = useState(false);
  const [proof, setProof] = useState<ProofField>({
    deliveredOnTime: false,
    scopeMatchedAgreement: false,
    portfolioEvidenceAttached: false,
    wouldSwapAgain: false,
    notes: '',
  });

  if (!partner) return null;

  const toggle = (key: keyof Omit<ProofField, 'notes'>) =>
    setProof(p => ({ ...p, [key]: !p[key] }));

  const fairness = fairnessFromProof(proof);
  const canSubmit = given.trim().length > 0 && received.trim().length > 0 && starRating > 0;

  const checks: { key: keyof Omit<ProofField, 'notes'>; label: string }[] = [
    { key: 'deliveredOnTime', label: 'On time' },
    { key: 'scopeMatchedAgreement', label: 'Scope matched' },
    { key: 'portfolioEvidenceAttached', label: 'Proof shared' },
    { key: 'wouldSwapAgain', label: 'Would swap again' },
  ];

  function submit() {
    if (!canSubmit) return;
    onSubmit(given.trim(), received.trim(), proof, starRating, reviewComment.trim());
    setGiven('');
    setReceived('');
    setStarRating(0);
    setReviewComment('');
    setProof({
      deliveredOnTime: false,
      scopeMatchedAgreement: false,
      portfolioEvidenceAttached: false,
      wouldSwapAgain: false,
      notes: '',
    });
    setProofOpen(false);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Record this swap</Text>
          <Text style={styles.sub}>
            With {partner.name}. Clear labels help everyone trust the system (Norman: signifiers).
          </Text>

          <Text style={styles.label}>You taught</Text>
          <TextInput
            style={styles.input}
            value={given}
            onChangeText={setGiven}
            placeholder={`e.g. ${currentUser.offers[0] ?? 'a skill'}`}
            placeholderTextColor={Atelier.inkTertiary}
            accessibilityLabel="Skill you taught"
          />

          <Text style={styles.label}>They taught you</Text>
          <TextInput
            style={styles.input}
            value={received}
            onChangeText={setReceived}
            placeholder={`e.g. ${partner.offers[0] ?? 'a skill'}`}
            placeholderTextColor={Atelier.inkTertiary}
            accessibilityLabel="Skill they taught you"
          />

          <Text style={styles.label}>Your rating (required)</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(n => (
              <Pressable
                key={n}
                onPress={() => setStarRating(n)}
                style={styles.starHit}
                accessibilityLabel={`${n} stars`}
              >
                <Text style={[styles.star, n <= starRating && styles.starOn]}>★</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Short note (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={reviewComment}
            onChangeText={setReviewComment}
            placeholder="One line others should know"
            placeholderTextColor={Atelier.inkTertiary}
            multiline
          />

          <Pressable
            style={styles.proofToggle}
            onPress={() => setProofOpen(o => !o)}
            accessibilityRole="button"
          >
            <Text style={styles.proofToggleText}>
              {proofOpen ? '▼ Hide fairness details' : '▶ Fairness checklist (optional)'}
            </Text>
          </Pressable>

          {proofOpen &&
            checks.map(({ key, label }) => (
              <Pressable
                key={key}
                style={[styles.checkRow, proof[key] && styles.checkRowOn]}
                onPress={() => toggle(key)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: proof[key] }}
              >
                <View style={[styles.box, proof[key] && styles.boxOn]}>
                  {proof[key] ? <Text style={styles.tick}>✓</Text> : null}
                </View>
                <Text style={styles.checkLabel}>{label}</Text>
              </Pressable>
            ))}

          <View style={styles.fairBox}>
            <Text style={styles.fairLabel}>Fairness preview</Text>
            <Text style={styles.fairVal}>{Math.round(fairness * 100)}%</Text>
          </View>

          {!canSubmit ? (
            <Text style={styles.hint}>Add both skills and a star to continue — a gentle constraint.</Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.secondary} onPress={onClose}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.primary, !canSubmit && styles.primaryOff]}
              onPress={submit}
              disabled={!canSubmit}
            >
              <Text style={styles.primaryText}>Save record</Text>
            </Pressable>
          </View>
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28,25,23,0.35)',
  },
  sheet: {
    backgroundColor: Atelier.paper,
    borderTopLeftRadius: Atelier.radiusLg,
    borderTopRightRadius: Atelier.radiusLg,
    paddingHorizontal: Atelier.space.lg,
    paddingBottom: Atelier.space.xl,
    maxHeight: '88%',
    borderTopWidth: 1,
    borderColor: Atelier.rule,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Atelier.rule,
    marginTop: Atelier.space.sm,
    marginBottom: Atelier.space.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Atelier.ink,
    letterSpacing: -0.3,
  },
  sub: {
    marginTop: Atelier.space.sm,
    fontSize: 14,
    color: Atelier.inkSecondary,
    lineHeight: 20,
    marginBottom: Atelier.space.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Atelier.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Atelier.space.md,
    marginBottom: Atelier.space.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Atelier.rule,
    borderRadius: Atelier.radiusSm,
    padding: 14,
    fontSize: 16,
    color: Atelier.ink,
    backgroundColor: Atelier.paperMuted,
  },
  inputMulti: { minHeight: 72, textAlignVertical: 'top' },
  stars: { flexDirection: 'row', gap: 4, marginBottom: Atelier.space.sm },
  starHit: { padding: 8, minWidth: 44, alignItems: 'center' },
  star: { fontSize: 28, color: Atelier.rule },
  starOn: { color: Atelier.accent },
  proofToggle: { paddingVertical: Atelier.space.md },
  proofToggleText: { fontSize: 14, fontWeight: '600', color: Atelier.accent },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Atelier.radiusSm,
    borderWidth: 1,
    borderColor: Atelier.rule,
    marginBottom: Atelier.space.sm,
  },
  checkRowOn: { borderColor: Atelier.sage, backgroundColor: Atelier.paperMuted },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: Atelier.inkTertiary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: Atelier.sage, borderColor: Atelier.sage },
  tick: { color: Atelier.paper, fontSize: 12, fontWeight: '800' },
  checkLabel: { fontSize: 15, color: Atelier.ink, flex: 1 },
  fairBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Atelier.space.md,
    borderRadius: Atelier.radiusMd,
    backgroundColor: Atelier.accentSoft,
    marginTop: Atelier.space.sm,
  },
  fairLabel: { fontSize: 13, color: Atelier.inkSecondary, fontWeight: '600' },
  fairVal: { fontSize: 20, fontWeight: '800', color: Atelier.accent },
  hint: {
    fontSize: 13,
    color: Atelier.inkTertiary,
    marginTop: Atelier.space.md,
    textAlign: 'center',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: Atelier.space.lg },
  secondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Atelier.radiusMd,
    borderWidth: 1,
    borderColor: Atelier.rule,
    alignItems: 'center',
  },
  secondaryText: { fontSize: 15, fontWeight: '600', color: Atelier.inkSecondary },
  primary: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: Atelier.radiusMd,
    backgroundColor: Atelier.accent,
    alignItems: 'center',
  },
  primaryOff: { opacity: 0.45 },
  primaryText: { fontSize: 15, fontWeight: '700', color: Atelier.paper },
});
