/**
 * Incoming — Pending Match Requests
 *
 * Shows every user who sent YOU a match request.
 * Each card shows: who, what they offer & need, match score summary,
 * and two clear actions: Accept (→ moves to Active Swaps) or Decline.
 *
 * Lina is pre-seeded as an incoming request so the screen
 * is never empty on first load.
 */

import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, SafeAreaView, StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { useMatchingState, matchScore, whyThisMatch } from '@/lib/matching/matching';
import { MOCK_USERS, YOU } from '@/lib/matching/data';

// ─── helpers ──────────────────────────────────────────────────────────────────

function pct(v: number) { return `${Math.round(v * 100)}%`; }

function verdict(v: number) {
  if (v >= 0.80) return { emoji: '🔥', label: 'Excellent', color: '#61d8cc' };
  if (v >= 0.65) return { emoji: '✅', label: 'Good',      color: '#6daa45' };
  if (v >= 0.45) return { emoji: '🤝', label: 'Decent',    color: '#FFD166' };
  return           { emoji: '⚠️', label: 'Weak',       color: '#EF767A' };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#101414" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function AcceptIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke="#000" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DeclineIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke="#EF767A" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function VerifiedIcon({ color = '#4f98a3' }: { color?: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L22 12 12 22 2 12 12 2z" stroke={color} strokeWidth={1.75} fill="none" />
      <Path d="M8.5 12l2.5 2.5 4.5-4.5" stroke={color} strokeWidth={1.75}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── RequestCard ───────────────────────────────────────────────────────────────

function RequestCard({
  userId,
  onAccept,
  onDecline,
}: {
  userId: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const user   = MOCK_USERS.find(u => u.id === userId);
  if (!user) return null;

  const scores  = useMemo(() => matchScore(YOU, user), [user]);
  const v       = verdict(scores.total);
  const why     = useMemo(() => whyThisMatch(YOU, user, scores), [user, scores]);

  const theyGive = user.offers.filter(s => YOU.requests.includes(s));
  const youGive  = YOU.offers.filter(s => user.requests.includes(s));

  return (
    <View style={rc.card}>
      {/* Header */}
      <View style={rc.header}>
        <View style={rc.avatar}><Text style={rc.avatarEmoji}>{user.avatar}</Text></View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={rc.nameRow}>
            <Text style={rc.name}>{user.name}</Text>
            {user.verified > 0 && <VerifiedIcon color="#4f98a3" />}
          </View>
          <Text style={rc.offers} numberOfLines={1}>{user.offers.join(', ')}</Text>
        </View>
        <View style={[rc.badge, { borderColor: v.color }]}>
          <Text style={rc.badgeEmoji}>{v.emoji}</Text>
          <Text style={[rc.badgePct, { color: v.color }]}>{pct(scores.total)}</Text>
        </View>
      </View>

      {/* What you'd exchange */}
      {(theyGive.length > 0 || youGive.length > 0) && (
        <View style={rc.exchange}>
          {theyGive.length > 0 && (
            <Text style={rc.exchangeText}>
              <Text style={rc.exchangeAccent}>They give you: </Text>
              {theyGive.join(', ')}
            </Text>
          )}
          {youGive.length > 0 && (
            <Text style={rc.exchangeText}>
              <Text style={rc.exchangeAccent}>You give them: </Text>
              {youGive.join(', ')}
            </Text>
          )}
        </View>
      )}

      {/* Why sentence */}
      <View style={rc.why}>
        <Text style={rc.whyText}>{why}</Text>
      </View>

      {/* Actions */}
      <View style={rc.actions}>
        <Pressable
          style={rc.declineBtn}
          onPress={onDecline}
          accessibilityLabel={`Decline ${user.name}`}>
          <DeclineIcon />
          <Text style={rc.declineBtnText}>Decline</Text>
        </Pressable>
        <Pressable
          style={rc.acceptBtn}
          onPress={onAccept}
          accessibilityLabel={`Accept ${user.name}`}>
          <AcceptIcon />
          <Text style={rc.acceptBtnText}>Accept Match</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function IncomingScreen() {
  const { requests, connect, decline } = useMatchingState();

  const pendingIds = useMemo(() => [...requests], [requests]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={s.nav}>
        <Pressable onPress={() => router.back()} style={s.navBack}>
          <BackIcon />
        </Pressable>
        <Text style={s.navTitle}>Incoming Requests</Text>
        {pendingIds.length > 0 && (
          <View style={s.navBadge}>
            <Text style={s.navBadgeText}>{pendingIds.length}</Text>
          </View>
        )}
      </View>

      {pendingIds.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>📭</Text>
          <Text style={s.emptyTitle}>No pending requests</Text>
          <Text style={s.emptySub}>When someone requests to swap with you, they'll appear here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.intro}>
            {pendingIds.length} person{pendingIds.length !== 1 ? 's' : ''} want{pendingIds.length === 1 ? 's' : ''} to swap with you.
          </Text>
          {pendingIds.map(uid => (
            <RequestCard
              key={uid}
              userId={uid}
              onAccept={() => connect(uid)}
              onDecline={() => decline(uid)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

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
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FF8C42', borderWidth: 2, borderColor: '#7a3a10',
    alignItems: 'center', justifyContent: 'center',
  },
  navBadgeText: { fontSize: 13, fontWeight: '900', color: '#000' },
  scroll:       { padding: 14, gap: 14 },
  intro:        { fontSize: 13, color: '#394140', marginBottom: 4, fontStyle: 'italic' },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyEmoji:   { fontSize: 48 },
  emptyTitle:   { fontSize: 20, fontWeight: '800', color: '#101414' },
  emptySub:     { fontSize: 14, color: '#394140', textAlign: 'center', lineHeight: 20 },
});

const rc = StyleSheet.create({
  card:         {
    backgroundColor: '#f3f4f1', borderWidth: 2, borderColor: '#2f3333',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  header:       {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#d0d2ce',
  },
  avatar:       {
    width: 44, height: 44, backgroundColor: '#61d8cc',
    borderWidth: 2, borderColor: '#1f4642',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji:  { fontSize: 22 },
  nameRow:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name:         { fontSize: 17, fontWeight: '800', color: '#101414' },
  offers:       { fontSize: 12, color: '#394140', marginTop: 2 },
  badge:        {
    borderWidth: 2, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4,
    alignItems: 'center', minWidth: 52,
  },
  badgeEmoji:   { fontSize: 13 },
  badgePct:     { fontSize: 14, fontWeight: '900' },
  exchange:     {
    backgroundColor: '#e8ebe5', borderTopWidth: 1, borderTopColor: '#d0d2ce',
    paddingHorizontal: 12, paddingVertical: 8, gap: 4,
  },
  exchangeText: { fontSize: 13, color: '#2f3333', lineHeight: 18 },
  exchangeAccent: { fontWeight: '700', color: '#1f4642' },
  why:          {
    paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#d0d2ce',
  },
  whyText:      { fontSize: 12, color: '#394140', lineHeight: 18, fontStyle: 'italic' },
  actions:      {
    flexDirection: 'row', gap: 8,
    padding: 10, borderTopWidth: 1, borderTopColor: '#d0d2ce',
  },
  declineBtn:   {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 2, borderColor: '#EF767A', paddingVertical: 11,
    backgroundColor: '#fff0f0',
  },
  declineBtnText: { fontSize: 14, fontWeight: '700', color: '#EF767A' },
  acceptBtn:    {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#61d8cc', borderWidth: 2, borderColor: '#1f4642', paddingVertical: 11,
  },
  acceptBtnText: { fontSize: 14, fontWeight: '800', color: '#000' },
});
