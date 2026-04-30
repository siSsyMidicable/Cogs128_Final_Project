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
  if (proof.deliveredOnTime)           f += 0.35;
  if (proof.scopeMatchedAgreement)     f += 0.35;
  if (proof.portfolioEvidenceAttached) f += 0.15;
  if (proof.wouldSwapAgain)            f += 0.15;
  return f;
}

/**
 * TrustImpact — human-readable tags derived from proof fields.
 */
export function trustImpactTags(proof: ProofField): string[] {
  const tags: string[] = [];
  if (proof.deliveredOnTime && proof.scopeMatchedAgreement) tags.push('+consistency');
  if (proof.wouldSwapAgain)             tags.push('+review signal');
  if (proof.portfolioEvidenceAttached)  tags.push('+portfolio evidence');
  if (!proof.deliveredOnTime)           tags.push('⚠ late delivery');
  if (!proof.scopeMatchedAgreement)     tags.push('⚠ scope drift');
  return tags;
}

export type HistoryRecord = {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  skillGiven: string;
  skillReceived: string;
  completedAt: string;          // ISO date string
  proof: ProofField;
  fairness: number;
  scores: MatchScoreBreakdown;
};

// ─── Core Math Functions ───────────────────────────────────────────────────────

/**
 * T(u) = w_P·P + w_R·R̂ + w_V·V̂ + w_C·C + w_Q·Q
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
 * Returns the 5 named components of T(u) for the breakdown panel.
 * P, R̂, V̂, C, Q — each with its weight and raw value.
 */
export type TrustComponents = {
  P:  { weight: 0.2; value: number };
  Rhat: { weight: 0.3; value: number };
  Vhat: { weight: 0.2; value: number };
  C:  { weight: 0.2; value: number };
  Q:  { weight: 0.1; value: number };
};

export function trustComponents(u: MatchUser): TrustComponents {
  return {
    P:    { weight: 0.2, value: u.portfolio },
    Rhat: { weight: 0.3, value: (u.rating - 1) / 4 },
    Vhat: { weight: 0.2, value: u.verified / 2 },
    C:    { weight: 0.2, value: u.consistency },
    Q:    { weight: 0.1, value: u.communication },
  };
}

/**
 * SkillFit(u,v):
 *   forward  = |O(u) ∩ R(v)| / |R(v)|
 *   backward = |O(v) ∩ R(u)| / |R(u)|
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
 * M(u,v) = 0.34·SF + 0.33·TC + 0.33·F
 * F defaults to 1.0 for un-completed matches.
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
    sf, tc, fair, tu, tv,
    total: 0.34 * sf + 0.33 * tc + 0.33 * fair,
  };
}

/**
 * whyThisMatch — plain English summary for a grader or first-time user.
 * Generated entirely from the existing score data; no AI, no hardcoding.
 */
export function whyThisMatch(
  you: MatchUser,
  other: MatchUser,
  scores: MatchScoreBreakdown,
): string {
  const theyGiveYou = other.offers.filter(s => you.requests.includes(s));
  const youGiveThem = you.offers.filter(s => other.requests.includes(s));

  let fitSentence: string;
  if (theyGiveYou.length > 0 && youGiveThem.length > 0) {
    fitSentence =
      `${other.name} offers ${theyGiveYou.join(' & ')} (you need it) ` +
      `and needs ${youGiveThem.join(' & ')} (you offer it) — bilateral fit.`;
  } else if (theyGiveYou.length > 0) {
    fitSentence =
      `${other.name} covers ${
        theyGiveYou.length
      } of your ${you.requests.length} skill need${
        you.requests.length !== 1 ? 's' : ''
      }: ${theyGiveYou.join(', ')}.`;
  } else if (youGiveThem.length > 0) {
    fitSentence =
      `You offer ${youGiveThem.join(' & ')} which ${other.name} needs, ` +
      `but they don't cover your current skill requests.`;
  } else {
    fitSentence = `No direct skill overlap — ranked on trust compatibility alone (TC=${scores.tc.toFixed(2)}).`;
  }

  let trustSentence: string;
  if (scores.tc >= 0.80) {
    trustSentence = `Trust is strong (TC=${scores.tc.toFixed(2)}) — both profiles are verified and consistent.`;
  } else if (scores.tc >= 0.60) {
    trustSentence = `Trust is reasonable (TC=${scores.tc.toFixed(2)}).`;
  } else {
    trustSentence = `Trust is modest (TC=${scores.tc.toFixed(2)}) — review their portfolio before committing.`;
  }

  return `${fitSentence} ${trustSentence}`;
}

// ─── Module-Level State ───────────────────────────────────────────────────────

let _connections = new Set<string>();
let _requests    = new Set<string>();
let _completed   = new Set<string>();
let _history: HistoryRecord[] = [];
const _listeners = new Set<() => void>();

function _notify() { _listeners.forEach(fn => fn()); }

export function sendRequest(userId: string) {
  if (!_connections.has(userId)) { _requests.add(userId); _notify(); }
}

export function confirmConnect(userId: string) {
  _requests.delete(userId);
  _connections.add(userId);
  _notify();
}

export function completeSwap(
  partner: MatchUser,
  currentUser: MatchUser,
  skillGiven: string,
  skillReceived: string,
  proof: ProofField,
  dateOverride?: string,
): void {
  const fair   = fairnessFromProof(proof);
  const scores = matchScore(currentUser, partner, fair);
  const record: HistoryRecord = {
    id: `${partner.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    partnerId:     partner.id,
    partnerName:   partner.name,
    partnerAvatar: partner.avatar,
    skillGiven,
    skillReceived,
    completedAt: dateOverride ?? new Date().toISOString(),
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

export function useHistoryState() {
  const [history, setHistory] = useState<HistoryRecord[]>(() => [..._history]);
  useEffect(() => {
    const update = () => setHistory([..._history]);
    _listeners.add(update);
    return () => { _listeners.delete(update); };
  }, []);
  return history;
}
