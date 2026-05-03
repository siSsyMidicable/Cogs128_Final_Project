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

import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, SafeAreaView, StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { useMatchingState, matchScore, whyThisMatch } from '@/lib/matching/matching';
import { MOCK_USERS, YOU } from '@/lib/matching/data';
import { toast } from '@/components/ui/toast';

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

  const [detailOpen, setDetailOpen] = useState(false);
  const scores  = useMemo(() => matchScore(YOU, user), [user]);
  const v       = verdict(scores.total);
  const why     = useMemo(() => whyThisMatch(YOU, user, scores), [user, scores]);

  const theyGive = user.offers.filter(s => YOU.requests.includes(s));
  const youGive  = YOU.offers.filter(s => user.requests.includes(s));

  return (
    <View style={rc.card}>
      <View style={rc.header}>
        <View style={rc.avatar}><Text style={rc.avatarEmoji}>{user.avatar}</Text></View>
        <View style={rc.headerMain}>
          <View style={rc.nameRow}>
            <Text style={rc.name}>{user.name}</Text>
            {user.verified > 0 && <VerifiedIcon color="#4f98a3" />}
          </View>
          <Text style={rc.matchLine}>{pct(scores.total)} · {v.label}</Text>
          <Text style={rc.offers} numberOfLines={1}>{user.offers.join(', ')}</Text>
        </View>
      </View>

      {(theyGive.length > 0 || youGive.length > 0) && (
        <View style={rc.exchange}>
          {theyGive.length > 0 && (
            <Text style={rc.exchangeText} numberOfLines={2}>
              <Text style={rc.exchangeAccent}>They offer </Text>
              {theyGive.join(', ')}
            </Text>
          )}
          {youGive.length > 0 && (
            <Text style={rc.exchangeText} numberOfLines={2}>
              <Text style={rc.exchangeAccent}>You offer </Text>
              {youGive.join(', ')}
            </Text>
          )}
        </View>
      )}

      <Pressable
        style={rc.detailToggle}
        onPress={() => setDetailOpen(o => !o)}
        accessibilityRole="button"
        accessibilityLabel={detailOpen ? 'Hide why this match' : 'Why this match'}
      >
        <Text style={rc.detailToggleText}>{detailOpen ? 'Hide details' : 'Why this match'}</Text>
      </Pressable>
      {detailOpen && (
        <View style={rc.why}>
          <Text style={rc.whyText}>{why}</Text>
        </View>
      )}

      <View style={rc.actions}>
        <Pressable
          style={rc.declineBtn}
          onPress={() => {
            onDecline();
            toast.info(`Swap request from ${user.name} declined.`);
          }}
          accessibilityLabel={`Decline swap request from ${user.name}`}>
          <DeclineIcon />
          <Text style={rc.declineBtnText}>Decline</Text>
        </Pressable>
        <Pressable
          style={rc.acceptBtn}
          onPress={() => {
            toast.loading('Accepting swap…');
            setTimeout(() => {
              onAccept();
              toast.success(`Swap accepted! ${user.name} is now in your Active Swaps.`);
            }, 500);
          }}
          accessibilityLabel={`Accept swap request from ${user.name}`}>
          <AcceptIcon />
          <Text style={rc.acceptBtnText}>Accept</Text>
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
        <Text style={s.navTitle}>Requests</Text>
        {pendingIds.length > 0 && (
          <View style={s.navBadge}>
            <Text style={s.navBadgeText}>{pendingIds.length}</Text>
          </View>
        )}
      </View>

      {pendingIds.length === 0 ? (
        // Rec 5: designed empty state with primary action
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>📭</Text>
          <Text style={s.emptyTitle}>No requests yet</Text>
          <Text style={s.emptySub}>
            When someone invites you to swap, it shows up here.
          </Text>
          <Pressable style={s.emptyBtn} onPress={() => router.push('/transaction')}>
            <Text style={s.emptyBtnText}>Browse matches</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.intro}>
            {pendingIds.length} waiting for you
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
  navTitle:     { flex: 1, fontSize: 18, fontWeight: '700', color: '#101414' },
  navBadge:     {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FF8C42', borderWidth: 2, borderColor: '#7a3a10',
    alignItems: 'center', justifyContent: 'center',
  },
  navBadgeText: { fontSize: 13, fontWeight: '900', color: '#000' },
  scroll:       { padding: 14, gap: 14 },
  intro:        { fontSize: 14, color: '#4a524e', marginBottom: 8, fontWeight: '500' },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyEmoji:   { fontSize: 48 },
  emptyTitle:   { fontSize: 20, fontWeight: '800', color: '#101414' },
  emptySub:     { fontSize: 14, color: '#394140', textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  emptyBtn:     {
    marginTop: 12, backgroundColor: '#61d8cc',
    borderWidth: 2, borderColor: '#1f4642',
    paddingVertical: 12, paddingHorizontal: 24,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#000' },
});

const rc = StyleSheet.create({
  card:         {
    backgroundColor: '#f3f4f1', borderWidth: 2, borderColor: '#2f3333',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10, shadowRadius: 6, elevation: 3,
  },
  header:       {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 14, borderBottomWidth: 1, borderBottomColor: '#d0d2ce',
  },
  headerMain:   { flex: 1, marginLeft: 12, gap: 4 },
  avatar:       {
    width: 44, height: 44, backgroundColor: '#61d8cc',
    borderWidth: 1, borderColor: '#1f4642',
    alignItems: 'center', justifyContent: 'center', borderRadius: 8,
  },
  avatarEmoji:  { fontSize: 22 },
  nameRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name:         { fontSize: 17, fontWeight: '700', color: '#101414' },
  matchLine:    { fontSize: 12, color: '#5a635f', fontWeight: '500' },
  offers:       { fontSize: 12, color: '#394140' },
  exchange:     {
    backgroundColor: '#e8ebe5',
    paddingHorizontal: 14, paddingVertical: 10, gap: 6,
  },
  exchangeText: { fontSize: 13, color: '#2f3333', lineHeight: 20 },
  exchangeAccent: { fontWeight: '600', color: '#1f4642' },
  detailToggle: { paddingVertical: 10, paddingHorizontal: 14 },
  detailToggleText: { fontSize: 13, fontWeight: '600', color: '#1f4642' },
  why:          {
    paddingHorizontal: 14, paddingBottom: 12, paddingTop: 0,
    marginHorizontal: 12, marginBottom: 8,
    backgroundColor: '#e8ebe5', borderRadius: 8,
  },
  whyText:      { fontSize: 13, color: '#394140', lineHeight: 20 },
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
