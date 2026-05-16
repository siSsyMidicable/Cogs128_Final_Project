/**
 * /matching  — Find Skills to Trade
 * Springy card carousel of all potential swap partners.
 * Swipe left/right with a fluid, natural settle animation.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, StatusBar,
  Dimensions, FlatList, Animated, ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MOCK_USERS, YOU } from '@/lib/matching/data';
import { matchScore, getMatchingState, sendRequest } from '@/lib/matching/matching';

const { width: SW } = Dimensions.get('window');
const CARD_W   = Math.min(SW - 64, 300);
const H_PAD    = 12;
const GAP      = 20;
const STEP     = CARD_W + H_PAD * 2 + GAP;
const SIDE_PAD = (SW - CARD_W) / 2 - H_PAD;

const C = {
  bg: '#7DE5E5', bgDeep: '#8FEBE5',
  glass: 'rgba(255,255,255,0.55)', glassBorder: 'rgba(255,255,255,0.45)',
  glowOne: 'rgba(255,255,255,0.22)', glowTwo: 'rgba(255,255,255,0.15)',
  black: '#000', blackSoft: 'rgba(0,0,0,0.55)',
  tealDark: '#2a8780', orange: '#FF8C42', shadow: '#000',
};

// ─── Fluid spring settle ───────────────────────────────────────────────────
// Physics feel: low tension (lazy pull-back) + low friction (gentle overshoot)
// produces an organic deceleration rather than a stiff snap.
function useSettleAnim() {
  const translateX = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(1)).current;
  const spring     = useRef<Animated.CompositeAnimation | null>(null);

  const trigger = useCallback((fromDirection: 'left' | 'right' = 'right') => {
    spring.current?.stop();

    // Kick in from the arrival side — card "drifts in" naturally
    translateX.setValue(fromDirection === 'right' ? 18 : -18);
    scale.setValue(0.97); // subtle shrink at entry

    spring.current = Animated.parallel([
      // Lateral glide — soft tension so it lazily settles, not snaps
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 38,    // low = slow, dreamy pull-back
        friction: 7,    // mid = one gentle overshoot then rest
        velocity: 2,
      }),
      // Subtle scale bloom — pops into full size as it settles
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
        velocity: 1,
      }),
    ]);
    spring.current.start();
  }, [translateX, scale]);

  return { translateX, scale, trigger };
}

// ─── Match card ──────────────────────────────────────────────────────────────
function MatchCard({
  user, isActive, score, status, swipeDir, onRequest,
}: {
  user: typeof MOCK_USERS[0];
  isActive: boolean;
  score: number;
  status: 'none' | 'requested' | 'connected' | 'completed';
  swipeDir: 'left' | 'right';
  onRequest: () => void;
}) {
  const { translateX, scale, trigger } = useSettleAnim();
  const wasActive = useRef(false);

  useEffect(() => {
    if (isActive && !wasActive.current) {
      wasActive.current = true;
      trigger(swipeDir);
    } else if (!isActive) {
      wasActive.current = false;
    }
  }, [isActive, swipeDir, trigger]);

  const pct      = Math.round(score * 100);
  const barColor = pct >= 70 ? C.tealDark : pct >= 50 ? C.orange : '#aaa';

  const btnLabel =
    status === 'connected' ? '🔄 Ongoing'     :
    status === 'completed' ? '✅ Done'         :
    status === 'requested' ? '⏳ Requested'   :
                             '🤝 Request Swap';

  const btnDisabled = status !== 'none';

  return (
    <View style={[mc.wrapper, { width: CARD_W + H_PAD * 2 }]}>
      <Animated.View
        style={[
          mc.animLayer,
          isActive
            ? { transform: [{ translateX }, { scale }] }
            : { opacity: 0.60, transform: [{ scale: 0.95 }] },
        ]}
      >
        <View style={[mc.glow, mc.glowOne]} />
        <View style={[mc.glow, mc.glowTwo]} />
        <View style={mc.card}>
          <View style={mc.headerRow}>
            <Text style={mc.avatar}>{user.avatar}</Text>
            <View style={{ flex: 1 }}>
              <Text style={mc.name}>{user.name}</Text>
              <Text style={mc.sub} numberOfLines={1}>
                Offers: {user.offers.slice(0, 2).join(', ')}
              </Text>
            </View>
            <View style={[mc.pctBadge, { backgroundColor: barColor }]}>
              <Text style={mc.pctText}>{pct}%</Text>
            </View>
          </View>

          <View style={mc.barTrack}>
            <View style={[mc.barFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
          </View>
          <Text style={mc.barLabel}>Match score</Text>

          <Text style={mc.sectionLabel}>Wants to learn</Text>
          <View style={mc.chipRow}>
            {user.requests.map(r => (
              <View key={r} style={mc.chip}>
                <Text style={mc.chipText}>{r}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={btnDisabled ? undefined : onRequest}
            style={({ pressed }) => [
              mc.btn,
              { backgroundColor: btnDisabled ? 'rgba(0,0,0,0.12)' : C.tealDark },
              pressed && !btnDisabled && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={btnLabel}
          >
            <Text style={[mc.btnText, btnDisabled && { color: 'rgba(0,0,0,0.4)' }]}>
              {btnLabel}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const mc = StyleSheet.create({
  wrapper:   { paddingHorizontal: H_PAD, paddingVertical: 20, overflow: 'visible' },
  animLayer: { overflow: 'visible' },
  glow:      { position: 'absolute', left: H_PAD, right: H_PAD, top: 18, bottom: 18, borderRadius: 16 },
  glowOne:   { backgroundColor: 'rgba(255,255,255,0.22)', transform: [{ scale: 1.07 }] },
  glowTwo:   { backgroundColor: 'rgba(255,255,255,0.15)', transform: [{ scale: 1.12 }] },
  card:      {
    borderRadius: 14, padding: 18,
    backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22, shadowRadius: 14, elevation: 10,
  },
  headerRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar:       { fontSize: 36 },
  name:         { fontSize: 18, fontWeight: '800', color: C.black },
  sub:          { fontSize: 12, color: C.blackSoft, marginTop: 2 },
  pctBadge:     { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pctText:      { fontSize: 13, fontWeight: '900', color: '#fff' },
  barTrack:     { height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: 4 },
  barFill:      { height: 6, borderRadius: 3 },
  barLabel:     { fontSize: 11, color: C.blackSoft, marginBottom: 14 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: C.blackSoft, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 18 },
  chip:         { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(0,0,0,0.08)' },
  chipText:     { fontSize: 12, fontWeight: '700', color: C.black },
  btn:          { borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  btnText:      { fontSize: 15, fontWeight: '800', color: '#fff' },
});

// ─── Dots ─────────────────────────────────────────────────────────────────────
function Dots({ count, active }: { count: number; active: number }) {
  return (
    <View style={d.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[d.dot, i === active ? d.on : d.off]} />
      ))}
    </View>
  );
}
const d = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  dot: { borderRadius: 99 },
  on:  { width: 22, height: 8, backgroundColor: '#000' },
  off: { width: 8,  height: 8, backgroundColor: 'rgba(0,0,0,0.22)' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function MatchingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex,   setPrevIndex]   = useState(0);
  const [, forceUpdate] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const state  = getMatchingState();
  const scored = MOCK_USERS.map(u => ({
    user: u,
    score: matchScore(YOU, u).total,
    status: (
      state.completed.has(u.id)   ? 'completed' :
      state.connections.has(u.id) ? 'connected' :
      state.requests.has(u.id)    ? 'requested' : 'none'
    ) as 'none' | 'requested' | 'connected' | 'completed',
  })).sort((a, b) => b.score - a.score);

  const swipeDir = activeIndex >= prevIndex ? 'right' : 'left';

  const onViewable = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      const next = viewableItems[0].index!;
      setActiveIndex(prev => { setPrevIndex(prev); return next; });
    }
  }, []);

  const viewCfg = useRef({ itemVisiblePercentThreshold: 55 }).current;

  const goTo = (idx: number) => {
    const c = Math.max(0, Math.min(scored.length - 1, idx));
    setPrevIndex(activeIndex);
    flatRef.current?.scrollToIndex({ index: c, animated: true });
    setActiveIndex(c);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.bgLayer} />

      <View style={s.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          accessibilityRole="button" accessibilityLabel="Go back"
        >
          <Text style={s.backArrow}>‹</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.title}>Find Skills to Trade</Text>
          <Text style={s.subtitle}>Swipe to browse — tap to request</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={s.carousel}>
        <View style={s.arrowRow}>
          <Pressable
            onPress={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            style={({ pressed }) => [s.arrow, activeIndex === 0 && s.arrowOff, pressed && { opacity: 0.6 }]}
            accessibilityRole="button" accessibilityLabel="Previous"
          >
            <Text style={[s.arrowTxt, activeIndex === 0 && s.arrowTxtOff]}>‹</Text>
          </Pressable>

          <View style={{ flex: 1, overflow: 'visible' }}>
            <FlatList
              ref={flatRef}
              data={scored}
              keyExtractor={item => item.user.id}
              horizontal
              pagingEnabled={false}
              snapToInterval={STEP}
              snapToAlignment="center"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIDE_PAD, paddingVertical: 20, gap: GAP }}
              renderItem={({ item, index }) => (
                <MatchCard
                  user={item.user}
                  isActive={index === activeIndex}
                  score={item.score}
                  status={item.status}
                  swipeDir={swipeDir}
                  onRequest={() => { sendRequest(item.user.id); forceUpdate(n => n + 1); }}
                />
              )}
              onViewableItemsChanged={onViewable}
              viewabilityConfig={viewCfg}
            />
          </View>

          <Pressable
            onPress={() => goTo(activeIndex + 1)}
            disabled={activeIndex === scored.length - 1}
            style={({ pressed }) => [s.arrow, activeIndex === scored.length - 1 && s.arrowOff, pressed && { opacity: 0.6 }]}
            accessibilityRole="button" accessibilityLabel="Next"
          >
            <Text style={[s.arrowTxt, activeIndex === scored.length - 1 && s.arrowTxtOff]}>›</Text>
          </Pressable>
        </View>

        <Dots count={scored.length} active={activeIndex} />
        <Text style={s.tip}>← Swipe to browse · Tap Request to send a swap →</Text>
      </View>

      <View style={s.footer}>
        <Pressable
          onPress={() => router.replace('/transaction')}
          style={({ pressed }) => [s.hubBtn, pressed && { opacity: 0.82 }]}
          accessibilityRole="button" accessibilityLabel="Back to swap hub"
        >
          <Text style={s.hubBtnText}>← Back to Swap Hub</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#8FEBE5' },
  bgLayer:   { ...StyleSheet.absoluteFillObject, backgroundColor: '#7DE5E5' },
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 },
  backBtn:   { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 32, fontWeight: '900', color: '#2a8780', lineHeight: 36 },
  title:     { fontSize: 22, fontWeight: '800', color: '#000' },
  subtitle:  { fontSize: 13, color: 'rgba(0,0,0,0.6)', marginTop: 2 },
  carousel:  { flex: 1, alignItems: 'center', overflow: 'visible' },
  arrowRow:  { flexDirection: 'row', alignItems: 'center', width: '100%', overflow: 'visible', flex: 1 },
  arrow:     { width: 36, height: 52, alignItems: 'center', justifyContent: 'center' },
  arrowOff:  { opacity: 0.22 },
  arrowTxt:  { fontSize: 32, fontWeight: '900', color: '#2a8780', lineHeight: 36 },
  arrowTxtOff: { color: 'rgba(0,0,0,0.3)' },
  tip:       { fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 10, marginBottom: 4, textAlign: 'center' },
  footer:    { paddingHorizontal: 20, paddingBottom: 24 },
  hubBtn:    { borderRadius: 8, paddingVertical: 13, backgroundColor: '#2a8780', alignItems: 'center' },
  hubBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
