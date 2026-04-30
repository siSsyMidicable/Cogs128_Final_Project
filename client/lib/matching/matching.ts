/**
 * SkillSwap Discrete Math Matching Engine
 *
 * Based on the COGS 128 math model:
 *   T(u)    = trust score (weighted portfolio, ratings, verification, consistency, communication)
 *   SF(u,v) = SkillFit — how well offered/needed skills overlap
 *   TC(u,v) = Trust Compatibility — geometric mean of both trust scores
 *   M(u,v)  = 0.34·SF + 0.33·TC + 0.33·F  (overall match score)
 *
 *   F for completed swaps is computed from verifiable proof fields,
 *   not a raw star rating that can be gamed.
 */

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MatchUser = {
  id: string;
  name: string;
  avatar: string;         // emoji
  offers: string[];       // O(u) ⊆ S — skills user offers
  requests: string[];     // R(u) ⊆ S — skills user wants to receive
  portfolio: number;      // P(u)        ∈ [0,1]
  rating: number;         // R_avg(u)    ∈ [1,5]
  verified: number;       // V(u)        ∈ {0,1,2}
  consistency: number;    // C(u)        ∈ [0,1]
  communication: number;  // Q_comm(u)   ∈ [0,1]
};

export type MatchScoreBreakdown = {
  total: number;  // M(u,v)
  sf: number;     // SkillFit(u,v)
  tc: number;     // TrustCompat(u,v)
  fair: number;   // F(u,v)
  tu: number;     // T(you)
  tv: number;     // T(other)
};

/**
 * ProofField — the 4 verifiable transparency checkboxes.
 * These replace a star rating.  Each field is a claim that can be
 * cross-checked against chat logs, portfolio links, or delivery dates.
 *
 * Fairness is computed as a weighted sum so no single field dominates:
 *   F = 0.35·deliveredOnTime + 0.35·scopeMatchedAgreement
 *     + 0.15·portfolioEvidenceAttached + 0.15·wouldSwapAgain
 */
export type ProofField = {
  deliveredOnTime: boolean;
  scopeMatchedAgreement: boolean;
  portfolioEvidenceAttached: boolean;
  wouldSwapAgain: boolean;
  notes?: string;
};

export function fairnessFromProof(proof: ProofField): number {
  let f = 0;
  if (proof.deliveredOnTime)          f += 0.35;
  if (proof.scopeMatchedAgreement)    f += 0.35;
  if (proof.portfolioEvidenceAttached) f += 0.15;
  if (proof.wouldSwapAgain)           f += 0.15;
  return f;
}

/**
 * TrustImpact — human-readable tags derived from proof fields.
 * Surfaces what improved (or didn't) in the trust model.
 */
export function trustImpactTags(proof: ProofField): string[] {
  const tags: string[] = [];
  if (proof.deliveredOnTime && proof.scopeMatchedAgreement) tags.push('+consistency');
  if (proof.wouldSwapAgain) tags.push('+review signal');
  if (proof.portfolioEvidenceAttached) tags.push('+portfolio evidence');
  if (!proof.deliveredOnTime) tags.push('⚠ late delivery');
  if (!proof.scopeMatchedAgreement) tags.push('⚠ scope drift');
  return tags;
}

export type HistoryRecord = {
  id: string;                    // unique record id
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  skillGiven: string;            // what you gave
  skillReceived: string;         // what you received
  completedAt: string;           // ISO date string
  proof: ProofField;
  fairness: number;              // computed from proof
  scores: MatchScoreBreakdown;   // the M(u,v) breakdown at time of match
};

// ─── Core Math Functions ───────────────────────────────────────────────────────

/**
 * T(u) = w_P·P + w_R·R̂ + w_V·V̂ + w_C·C + w_Q·Q
 * Weights from interview emphasis: P=0.2, R=0.3, V=0.2, C=0.2, Q=0.1
 * R̂ = (R_avg - 1) / 4   rescales [1,5] → [0,1]
 * V̂ = V / 2              rescales {0,1,2} → {0,0.5,1}
 */
export function trustScore(u: MatchUser): number {
  const rHat = (u.rating - 1) / 4;
  const vHat = u.verified / 2;
  return (
    0.2 * u.portfolio +
    0.3 * rHat +
    0.2 * vHat +
    0.2 * u.consistency +
    0.1 * u.communication
  );
}

/**
 * SkillFit(u,v):
 *   forward  = |O(u) ∩ R(v)| / |R(v)|   — how much of v's needs u covers
 *   backward = |O(v) ∩ R(u)| / |R(u)|   — how much of u's needs v covers
 *   SF = (forward + backward) / 2
 */
export function skillFit(u: MatchUser, v: MatchUser): number {
  if (v.requests.length === 0 || u.requests.length === 0) return 0;
  const forward  = u.offers.filter(s => v.requests.includes(s)).length / v.requests.length;
  const backward = v.offers.filter(s => u.requests.includes(s)).length / u.requests.length;
  return (forward + backward) / 2;
}

/**
 * TrustCompat(u,v) = √(T(u) · T(v))
 * Geometric mean — both users must have reasonable trust for a high score.
 */
export function trustCompat(u: MatchUser, v: MatchUser): number {
  return Math.sqrt(trustScore(u) * trustScore(v));
}

/**
 * M(u,v) = γ_F·F + γ_T·TC + γ_S·SF
 * γ_S=0.34, γ_T=0.33, γ_F=0.33  (skill fit weighted slightly higher)
 *
 * When called for a live match candidate, F defaults to 1.0 (no history yet).
 * When called for a completed swap, pass the proof-derived fairness value.
 */
export function matchScore(
  u: MatchUser,
  v: MatchUser,
  fairOverride?: number,
): MatchScoreBreakdown {
  const sf   = skillFit(u, v);
  const tc   = trustCompat(u, v);
  const fair = fairOverride !== undefined ? fairOverride : 1.0;
  const tu   = trustScore(u);
  const tv   = trustScore(v);
  return {
    sf,
    tc,
    fair,
    tu,
    tv,
    total: 0.34 * sf + 0.33 * tc + 0.33 * fair,
  };
}

// ─── Module-Level State (same pattern as auth) ────────────────────────────────
// Keeps connection/request/history state across screens without a full store.

let _connections = new Set<string>();
let _requests    = new Set<string>();
let _completed   = new Set<string>();          // ids that have been completed
let _history: HistoryRecord[] = [];
const _listeners = new Set<() => void>();

function _notify() {
  _listeners.forEach(fn => fn());
}

export function sendRequest(userId: string) {
  if (!_connections.has(userId)) {
    _requests.add(userId);
    _notify();
  }
}

export function confirmConnect(userId: string) {
  _requests.delete(userId);
  _connections.add(userId);
  _notify();
}

/**
 * completeSwap — called from the completion modal.
 * Creates a HistoryRecord with proof-derived fairness and removes the
 * connection from the active "connected" set (swap is done).
 */
export function completeSwap(
  partner: MatchUser,
  currentUser: MatchUser,
  skillGiven: string,
  skillReceived: string,
  proof: ProofField,
): void {
  const fair = fairnessFromProof(proof);
  const scores = matchScore(currentUser, partner, fair);
  const record: HistoryRecord = {
    id: `${partner.id}-${Date.now()}`,
    partnerId: partner.id,
    partnerName: partner.name,
    partnerAvatar: partner.avatar,
    skillGiven,
    skillReceived,
    completedAt: new Date().toISOString(),
    proof,
    fairness: fair,
    scores,
  };
  _history = [record, ..._history];
  _completed.add(partner.id);
  _connections.delete(partner.id);
  _notify();
}

export function getMatchingState() {
  return {
    connections: new Set(_connections),
    requests:    new Set(_requests),
    completed:   new Set(_completed),
    history:     [..._history],
  };
}

/** React hook — subscribes to live connection/request/history state. */
export function useMatchingState() {
  const [state, setState] = useState(getMatchingState);

  useEffect(() => {
    const update = () => setState(getMatchingState());
    _listeners.add(update);
    return () => { _listeners.delete(update); };
  }, []);

  const request  = useCallback((id: string) => sendRequest(id), []);
  const connect  = useCallback((id: string) => confirmConnect(id), []);
  const complete = useCallback(
    (partner: MatchUser, cu: MatchUser, given: string, received: string, proof: ProofField) =>
      completeSwap(partner, cu, given, received, proof),
    [],
  );

  return { ...state, request, connect, complete };
}

/** Hook for the history screen — only cares about history records. */
export function useHistoryState() {
  const [history, setHistory] = useState<HistoryRecord[]>(() => [..._history]);

  useEffect(() => {
    const update = () => setHistory([..._history]);
    _listeners.add(update);
    return () => { _listeners.delete(update); };
  }, []);

  return history;
}
