/**
 * SkillSwap — Match Hub
 * Replaces the old transaction system.
 *
 * Shows users ranked by M(you, v) = 0.34·SF + 0.33·TC + 0.33·F
 * Each card has an expandable "Show Math" panel with live formula values.
 * Stats bar tracks: Connections Made | Requests Sent | Pending
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { useUser } from '@/lib/auth/auth';
import {
  matchScore,
  useMatchingState,
  type MatchUser,
  type MatchScoreBreakdown,
} from '@/lib/matching/matching';
import { YOU, MOCK_USERS } from '@/lib/matching/data';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ value, color }: { value: number; color: string }) {
  const pct = `${Math.min(100, Math.round(value * 100))}%` as any;
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: pct, backgroundColor: color }]} />
    </View>
  );
}

function Chip({ label, variant }: { label: string; variant: 'offer' | 'request' | 'match' }) {
  const bg = variant === 'offer' ? '#1f4642' : variant === 'request' ? '#FF8C42' : '#61d8cc';
  const fg = variant === 'offer' ? '#61d8cc' : '#000';
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
    </View>
  );
}

function MathPanel({
  scores,
  user,
}: {
  scores: MatchScoreBreakdown;
  user: MatchUser;
}) {
  return (
    <View style={styles.mathPanel}>
      <Text style={styles.mathTitle}>M(you, {user.name}) breakdown</Text>

      <Text style={styles.mathFormula}>
        M = 0.34 × SF + 0.33 × TC + 0.33 × F
      </Text>

      <View style={styles.mathDivider} />

      <Text style={styles.mathLine}>
        SF  = SkillFit(you, {user.name}){' '}
        <Text style={styles.mathVal}>= {scores.sf.toFixed(3)}</Text>
      </Text>
      <Text style={styles.mathSub}>
        (|O(you)∩R({user.name})| / |R({user.name})| + |O({user.name})∩R(you)| / |R(you)|) / 2
      </Text>

      <Text style={styles.mathLine}>
        TC  = √(T(you) × T({user.name})){' '}
        <Text style={styles.mathVal}>= {scores.tc.toFixed(3)}</Text>
      </Text>
      <Text style={styles.mathSub}>
        = √({scores.tu.toFixed(3)} × {scores.tv.toFixed(3)})
      </Text>

      <Text style={styles.mathLine}>
        F   = Fairness (new match){' '}
        <Text style={styles.mathVal}>= {scores.fair.toFixed(3)}</Text>
      </Text>

      <View style={styles.mathDivider} />

      <Text style={styles.mathTotal}>
        M = {(0.34 * scores.sf).toFixed(3)} + {(0.33 * scores.tc).toFixed(3)} +{' '}
        {(0.33 * scores.fair).toFixed(3)} ={' '}
        <Text style={styles.mathTotalValue}>{scores.total.toFixed(3)}</Text>
      </Text>

      <View style={styles.mathDivider} />

      <Text style={styles.mathNote}>
        T(u) = 0.2P + 0.3R̂ + 0.2V̂ + 0.2C + 0.1Q
      </Text>
      <Text style={styles.mathLine}>
        T(you) = {scores.tu.toFixed(3)} | T({user.name}) = {scores.tv.toFixed(3)}
      </Text>
    </View>
  );
}

function MatchCard({
  user,
  currentUser,
  connections,
  requests,
  request,
  connect,
}: {
  user: MatchUser;
  currentUser: MatchUser;
  connections: Set<string>;
  requests: Set<string>;
  request: (id: string) => void;
  connect: (id: string) => void;
}) {
  const [showMath, setShowMath] = useState(false);
  const scores = useMemo(() => matchScore(currentUser, user), [user, currentUser]);

  const isConnected = connections.has(user.id);
  const isRequested = requests.has(user.id);

  // Highlighted skill overlaps
  const youCoverTheirNeeds = currentUser.offers.filter(s => user.requests.includes(s));
  const theyCoverYourNeeds = user.offers.filter(s => currentUser.requests.includes(s));

  const badgeColor =
    scores.total >= 0.7 ? '#61d8cc'
    : scores.total >= 0.45 ? '#FFD166'
    : '#EF767A';

  function toggleMath() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowMath(v => !v);
  }

  return (
    <View style={styles.card}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarEmoji}>{user.avatar}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.cardName}>{user.name}</Text>
          <Text style={styles.cardOffersLine} numberOfLines={1}>
            Offers: {user.offers.join(', ')}
          </Text>
        </View>
        <View style={[styles.scoreBadge, { borderColor: badgeColor }]}>
          <Text style={[styles.scoreBadgeText, { color: badgeColor }]}>
            {Math.round(scores.total * 100)}%
          </Text>
        </View>
      </View>

      {/* Skill match highlights */}
      {theyCoverYourNeeds.length > 0 && (
        <View style={styles.highlightRow}>
          <Text style={styles.highlightLabel}>✓ They cover your need: </Text>
          <View style={styles.chipRow}>
            {theyCoverYourNeeds.map(s => <Chip key={s} label={s} variant="match" />)}
          </View>
        </View>
      )}
      {youCoverTheirNeeds.length > 0 && (
        <View style={styles.highlightRow}>
          <Text style={styles.highlightLabel}>✓ You cover their need: </Text>
          <View style={styles.chipRow}>
            {youCoverTheirNeeds.map(s => <Chip key={s} label={s} variant="offer" />)}
          </View>
        </View>
      )}
      {theyCoverYourNeeds.length === 0 && youCoverTheirNeeds.length === 0 && (
        <Text style={styles.noOverlap}>— No direct skill overlap</Text>
      )}

      {/* Score bars */}
      <View style={styles.barsSection}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>SkillFit</Text>
          <ScoreBar value={scores.sf} color="#61d8cc" />
          <Text style={styles.barValue}>{scores.sf.toFixed(2)}</Text>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Trust   </Text>
          <ScoreBar value={scores.tc} color="#4f98a3" />
          <Text style={styles.barValue}>{scores.tc.toFixed(2)}</Text>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Match   </Text>
          <ScoreBar value={scores.total} color={badgeColor} />
          <Text style={styles.barValue}>{scores.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Math toggle */}
      <Pressable onPress={toggleMath} style={styles.mathToggle}>
        <Text style={styles.mathToggleText}>
          {showMath ? '▲ Hide Math' : '▼ Show Math  M(you, ' + user.name + ')'}
        </Text>
      </Pressable>

      {showMath && <MathPanel scores={scores} user={user} />}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        {isConnected ? (
          <View style={[styles.actionBtn, styles.connectedBtn]}>
            <Text style={styles.actionBtnText}>✓ Connected</Text>
          </View>
        ) : isRequested ? (
          <Pressable
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => connect(user.id)}
          >
            <Text style={styles.actionBtnText}>Accept Match ✓</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.actionBtn, styles.requestBtn]}
            onPress={() => request(user.id)}
          >
            <Text style={styles.actionBtnText}>Request Match ›</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────────

export default function MatchHub() {
  const { data: authUser } = useUser();
  const { connections, requests, request, connect } = useMatchingState();

  // Sort by M(you, v) descending
  const sortedUsers = useMemo(
    () =>
      [...MOCK_USERS]
        .map(u => ({ user: u, score: matchScore(YOU, u).total }))
        .sort((a, b) => b.score - a.score)
        .map(({ user }) => user),
    []
  );

  const pending = MOCK_USERS.length - connections.size - requests.size;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>SKILLSWAP</Text>
          <Text style={styles.headerTitle}>Skill Matches</Text>
          {authUser && (
            <Text style={styles.headerSub}>Signed in as {authUser.name}</Text>
          )}
        </View>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#61d8cc' }]}>{connections.size}</Text>
            <Text style={styles.statLabel}>Connected</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#FF8C42' }]}>{requests.size}</Text>
            <Text style={styles.statLabel}>Requested</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#FFD166' }]}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Your skills */}
      <View style={styles.yourProfile}>
        <Text style={styles.yourProfileTitle}>Your Skills</Text>
        <View style={styles.chipRow}>
          <Text style={styles.chipGroupLabel}>Offers  </Text>
          {YOU.offers.map(s => <Chip key={s} label={s} variant="offer" />)}
        </View>
        <View style={[styles.chipRow, { marginTop: 6 }]}>
          <Text style={styles.chipGroupLabel}>Wants   </Text>
          {YOU.requests.map(s => <Chip key={s} label={s} variant="request" />)}
        </View>
      </View>

      {/* Match list */}
      <FlatList
        data={sortedUsers}
        keyExtractor={u => u.id}
        renderItem={({ item }) => (
          <MatchCard
            user={item}
            currentUser={YOU}
            connections={connections}
            requests={requests}
            request={request}
            connect={connect}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#d6d8d3',
  },

  // Header
  header: {
    backgroundColor: '#ececea',
    borderBottomWidth: 2,
    borderBottomColor: '#2f3333',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#434948',
    letterSpacing: 1.4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#101414',
  },
  headerSub: {
    fontSize: 12,
    color: '#394140',
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBox: {
    alignItems: 'center',
    minWidth: 52,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    color: '#434948',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#2f3333',
    marginHorizontal: 6,
  },

  // Your profile
  yourProfile: {
    backgroundColor: '#f3f4f1',
    borderBottomWidth: 2,
    borderBottomColor: '#2f3333',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  yourProfileTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#434948',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  chipGroupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2f3333',
    width: 44,
  },
  chip: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // List
  list: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 14,
  },

  // Card
  card: {
    backgroundColor: '#f3f4f1',
    borderWidth: 2,
    borderColor: '#2f3333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d2ce',
  },
  avatarBox: {
    width: 44,
    height: 44,
    backgroundColor: '#61d8cc',
    borderWidth: 2,
    borderColor: '#1f4642',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#101414',
  },
  cardOffersLine: {
    fontSize: 12,
    color: '#394140',
    marginTop: 1,
  },
  scoreBadge: {
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  scoreBadgeText: {
    fontSize: 16,
    fontWeight: '900',
  },

  // Highlights
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 4,
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2a8780',
  },
  noOverlap: {
    fontSize: 12,
    color: '#888',
    paddingHorizontal: 12,
    paddingTop: 8,
    fontStyle: 'italic',
  },

  // Bars
  barsSection: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2f3333',
    width: 56,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#d0d2ce',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2f3333',
    width: 32,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Math toggle
  mathToggle: {
    borderTopWidth: 1,
    borderTopColor: '#d0d2ce',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e8ebe5',
  },
  mathToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f4642',
    letterSpacing: 0.3,
  },

  // Math panel
  mathPanel: {
    backgroundColor: '#1c2424',
    borderTopWidth: 1,
    borderTopColor: '#2f3333',
    padding: 12,
    gap: 3,
  },
  mathTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#61d8cc',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  mathFormula: {
    fontSize: 13,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  mathDivider: {
    height: 1,
    backgroundColor: '#2f4a47',
    marginVertical: 4,
  },
  mathLine: {
    fontSize: 12,
    color: '#a8c5c2',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  mathVal: {
    color: '#61d8cc',
    fontWeight: '800',
  },
  mathSub: {
    fontSize: 10,
    color: '#607876',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginLeft: 8,
    marginBottom: 2,
  },
  mathTotal: {
    fontSize: 12,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  mathTotalValue: {
    color: '#61d8cc',
    fontWeight: '900',
  },
  mathNote: {
    fontSize: 11,
    color: '#607876',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },

  // Actions
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: '#d0d2ce',
    padding: 10,
  },
  actionBtn: {
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 2,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },
  requestBtn: {
    backgroundColor: '#61d8cc',
    borderColor: '#1f4642',
  },
  acceptBtn: {
    backgroundColor: '#FF8C42',
    borderColor: '#7a3a10',
  },
  connectedBtn: {
    backgroundColor: '#d0f0ec',
    borderColor: '#2a8780',
  },
});
