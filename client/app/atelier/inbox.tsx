import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useMatchingState, matchScore, whyThisMatch } from '@/lib/matching/matching';
import { MOCK_USERS, YOU } from '@/lib/matching/data';
import { Atelier } from '@/lib/atelier/theme';
import { toast } from '@/components/ui/toast';

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export default function AtelierInboxScreen() {
  const { requests, connect, decline } = useMatchingState();
  const pending = useMemo(() => [...requests], [requests]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.head}>
        <Text style={styles.h1}>Inbox</Text>
        <Text style={styles.sub}>Only two actions per request — less overload, clearer choice.</Text>
      </View>

      {pending.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>All quiet</Text>
          <Text style={styles.emptySub}>When someone asks to swap, their note lands here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.count}>{pending.length} pending</Text>
          {pending.map(id => {
            const user = MOCK_USERS.find(u => u.id === id);
            if (!user) return null;
            const scores = matchScore(YOU, user);
            const why = whyThisMatch(YOU, user, scores);
            return (
              <View key={id} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.avatar}>{user.avatar}</Text>
                  <View style={styles.main}>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.meta}>{pct(scores.total)} match</Text>
                    <Text style={styles.why} numberOfLines={3}>
                      {why}
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    style={styles.decline}
                    onPress={() => {
                      decline(id);
                      toast.info(`Declined ${user.name}.`);
                    }}
                  >
                    <Text style={styles.declineTxt}>Decline</Text>
                  </Pressable>
                  <Pressable
                    style={styles.accept}
                    onPress={() => {
                      toast.loading('Connecting…');
                      setTimeout(() => {
                        connect(id);
                        toast.success(`${user.name} is now an active swap.`);
                      }, 350);
                    }}
                  >
                    <Text style={styles.acceptTxt}>Accept</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Atelier.canvas },
  head: { paddingHorizontal: Atelier.space.lg, paddingTop: Atelier.space.md },
  h1: { fontSize: 28, fontWeight: '700', color: Atelier.ink, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: Atelier.inkSecondary, marginTop: 6, lineHeight: 20 },
  scroll: { padding: Atelier.space.lg, paddingBottom: 40 },
  count: { fontSize: 13, color: Atelier.inkTertiary, marginBottom: 12 },
  card: {
    backgroundColor: Atelier.paper,
    borderRadius: Atelier.radiusLg,
    padding: Atelier.space.md,
    borderWidth: 1,
    borderColor: Atelier.rule,
    marginBottom: 14,
    ...Atelier.shadow.card,
  },
  row: { flexDirection: 'row', gap: 12 },
  avatar: { fontSize: 32 },
  main: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: Atelier.ink },
  meta: { fontSize: 13, color: Atelier.inkSecondary, marginTop: 4 },
  why: { fontSize: 13, color: Atelier.inkSecondary, marginTop: 8, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  decline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Atelier.radiusMd,
    borderWidth: 1,
    borderColor: Atelier.danger,
    alignItems: 'center',
    backgroundColor: Atelier.paper,
  },
  declineTxt: { fontWeight: '700', color: Atelier.danger, fontSize: 15 },
  accept: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: Atelier.radiusMd,
    backgroundColor: Atelier.accent,
    alignItems: 'center',
  },
  acceptTxt: { fontWeight: '700', color: Atelier.paper, fontSize: 15 },
  emptyBox: { flex: 1, justifyContent: 'center', padding: Atelier.space.xl },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Atelier.ink, textAlign: 'center' },
  emptySub: {
    fontSize: 15,
    color: Atelier.inkSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
