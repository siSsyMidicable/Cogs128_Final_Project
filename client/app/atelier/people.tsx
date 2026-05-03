import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useUser } from '@/lib/auth/auth';
import {
  matchScore,
  useMatchingState,
  averageStarRating,
  swapCount,
  type MatchUser,
  type ProofField,
} from '@/lib/matching/matching';
import { YOU, MOCK_USERS } from '@/lib/matching/data';
import { Atelier } from '@/lib/atelier/theme';
import { RecordSwapSheet } from '@/components/atelier/RecordSwapSheet';
import { toast } from '@/components/ui/toast';

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function PersonRow({
  user,
  currentUser,
  connections,
  requests,
  completed,
  onRequest,
  onRecord,
}: {
  user: MatchUser;
  currentUser: MatchUser;
  connections: Set<string>;
  requests: Set<string>;
  completed: Set<string>;
  onRequest: (id: string) => void;
  onRecord: (u: MatchUser) => void;
}) {
  const scores = useMemo(() => matchScore(currentUser, user), [currentUser, user]);
  const rating = averageStarRating(user.id);
  const swaps = swapCount(user.id);
  const requested = requests.has(user.id);
  const connected = connections.has(user.id);
  const done = completed.has(user.id);

  const { label, onPress, variant } = (() => {
    if (done) return { label: 'Completed', onPress: () => {}, variant: 'muted' as const };
    if (connected) return { label: 'Record swap', onPress: () => onRecord(user), variant: 'accent' as const };
    if (requested) return { label: 'Request sent', onPress: () => {}, variant: 'muted' as const };
    return { label: 'Send request', onPress: () => onRequest(user.id), variant: 'accent' as const };
  })();

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{user.avatar}</Text>
        </View>
        <View style={styles.cardMain}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>
            {pct(scores.total)} match · teaches {user.offers.slice(0, 2).join(', ')}
            {user.offers.length > 2 ? '…' : ''}
          </Text>
          {rating !== null && swaps > 0 ? (
            <Text style={styles.trust}>
              {rating.toFixed(1)} ★ · {swaps} swap{swaps === 1 ? '' : 's'}
            </Text>
          ) : (
            <Text style={styles.trust}>New member</Text>
          )}
        </View>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.round(scores.total * 100)}%` }]} />
      </View>
      <Pressable
        style={[
          styles.cta,
          variant === 'muted' && styles.ctaMuted,
        ]}
        onPress={onPress}
        disabled={done || requested}
        accessibilityLabel={label}
      >
        <Text style={[styles.ctaTxt, variant === 'muted' && styles.ctaTxtMuted]}>{label}</Text>
      </Pressable>
    </View>
  );
}

export default function AtelierPeopleScreen() {
  const { user } = useUser();
  const currentUser = user ?? YOU;
  const { connections, requests, completed, request, complete } = useMatchingState();
  const [q, setQ] = useState('');
  const [sheetUser, setSheetUser] = useState<MatchUser | null>(null);

  const sorted = useMemo(() => {
    return [...MOCK_USERS]
      .filter(u => u.id !== currentUser.id)
      .sort((a, b) => matchScore(currentUser, b).total - matchScore(currentUser, a).total);
  }, [currentUser]);

  const data = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return sorted;
    return sorted.filter(
      u =>
        u.name.toLowerCase().includes(t) ||
        u.offers.some(s => s.toLowerCase().includes(t)) ||
        u.requests.some(s => s.toLowerCase().includes(t)),
    );
  }, [sorted, q]);

  const handleRequest = useCallback(
    (id: string) => {
      const target = MOCK_USERS.find(u => u.id === id);
      toast.loading(`Sending…`);
      setTimeout(() => {
        request(id);
        toast.success(`Request sent to ${target?.name ?? 'them'}. Check Inbox for replies.`);
      }, 400);
    },
    [request],
  );

  const handleComplete = useCallback(
    (
      given: string,
      received: string,
      proof: ProofField,
      starRating: number,
      reviewComment: string,
    ) => {
      if (!sheetUser) return;
      toast.loading('Saving…');
      setTimeout(() => {
        complete(sheetUser, currentUser, given, received, proof, starRating, reviewComment);
        setSheetUser(null);
        toast.success('Swap saved. Thanks for the feedback.');
      }, 400);
    },
    [complete, sheetUser, currentUser],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.head}>
        <Text style={styles.h1}>People</Text>
        <Text style={styles.sub}>Strong mapping: search narrows the list below.</Text>
      </View>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          value={q}
          onChangeText={setQ}
          placeholder="Name or skill"
          placeholderTextColor={Atelier.inkTertiary}
          returnKeyType="search"
          accessibilityLabel="Search by name or skill"
        />
      </View>
      <Text style={styles.count}>{data.length} {data.length === 1 ? 'person' : 'people'}</Text>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No one matches that search — try another word.</Text>
        }
        renderItem={({ item }) => (
          <PersonRow
            user={item}
            currentUser={currentUser}
            connections={connections}
            requests={requests}
            completed={completed}
            onRequest={handleRequest}
            onRecord={setSheetUser}
          />
        )}
      />
      <RecordSwapSheet
        visible={!!sheetUser}
        partner={sheetUser}
        currentUser={currentUser}
        onClose={() => setSheetUser(null)}
        onSubmit={handleComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Atelier.canvas },
  head: { paddingHorizontal: Atelier.space.lg, paddingTop: Atelier.space.md },
  h1: { fontSize: 28, fontWeight: '700', color: Atelier.ink, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: Atelier.inkSecondary, marginTop: 6, lineHeight: 20 },
  searchWrap: { paddingHorizontal: Atelier.space.lg, marginTop: Atelier.space.md },
  search: {
    backgroundColor: Atelier.paper,
    borderRadius: Atelier.radiusMd,
    borderWidth: 1,
    borderColor: Atelier.rule,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Atelier.ink,
  },
  count: {
    fontSize: 13,
    color: Atelier.inkTertiary,
    paddingHorizontal: Atelier.space.lg,
    marginTop: Atelier.space.sm,
    marginBottom: Atelier.space.sm,
  },
  list: { paddingHorizontal: Atelier.space.lg, paddingBottom: 32 },
  empty: { textAlign: 'center', color: Atelier.inkSecondary, marginTop: 40, fontSize: 15 },
  card: {
    backgroundColor: Atelier.paper,
    borderRadius: Atelier.radiusLg,
    padding: Atelier.space.md,
    borderWidth: 1,
    borderColor: Atelier.rule,
    ...Atelier.shadow.card,
  },
  cardTop: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Atelier.radiusSm,
    backgroundColor: Atelier.paperMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontSize: 22 },
  cardMain: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: Atelier.ink },
  meta: { fontSize: 13, color: Atelier.inkSecondary, marginTop: 4, lineHeight: 18 },
  trust: { fontSize: 12, color: Atelier.sage, marginTop: 4 },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Atelier.rule,
    marginTop: 12,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: Atelier.accent, borderRadius: 2 },
  cta: {
    marginTop: 12,
    backgroundColor: Atelier.accent,
    paddingVertical: 12,
    borderRadius: Atelier.radiusMd,
    alignItems: 'center',
  },
  ctaMuted: { backgroundColor: Atelier.paperMuted, borderWidth: 1, borderColor: Atelier.rule },
  ctaTxt: { color: Atelier.paper, fontWeight: '700', fontSize: 15 },
  ctaTxtMuted: { color: Atelier.inkTertiary },
});
