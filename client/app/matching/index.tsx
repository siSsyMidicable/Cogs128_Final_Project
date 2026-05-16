/**
 * /matching  — Find Skills to Trade
 * Edge-to-edge infinite carousel — arrows are absolute overlays, no layout impact.
 * Full register-screen glass-teal aesthetic: pinned title, glow orbs, grid overlay.
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
const CARD_W   = Math.min(SW - 48, 300);
const GAP      = 16;
const STEP     = CARD_W + GAP;
const SIDE_PAD = (SW - CARD_W) / 2;

// ── Fluid spring ──────────────────────────────────────────────────────────────
function useSettle() {
  const tx   = useRef(new Animated.Value(0)).current;
  const sc   = useRef(new Animated.Value(1)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  const fire = useCallback((dir: 'left' | 'right' = 'right') => {
    anim.current?.stop();
    tx.setValue(dir === 'right' ? 18 : -18);
    sc.setValue(0.97);
    anim.current = Animated.parallel([
      Animated.spring(tx, { toValue: 0, useNativeDriver: true, tension: 38, friction: 7, velocity: 2 }),
      Animated.spring(sc, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8, velocity: 1 }),
    ]);
    anim.current.start();
  }, [tx, sc]);

  return { tx, sc, fire };
}

// ── Match card ────────────────────────────────────────────────────────────────
function MatchCard({
  user, isActive, score, status, dir, onRequest,
}: {
  user: typeof MOCK_USERS[0]; isActive: boolean;
  score: number; status: 'none' | 'requested' | 'connected' | 'completed';
  dir: 'left' | 'right'; onRequest: () => void;
}) {
  const { tx, sc, fire } = useSettle();
  const was = useRef(false);
  useEffect(() => {
    if (isActive && !was.current) { was.current = true; fire(dir); }
    else if (!isActive) { was.current = false; }
  }, [isActive, dir, fire]);

  const pct      = Math.round(score * 100);
  const barColor = pct >= 70 ? '#2a8780' : pct >= 50 ? '#FF8C42' : '#aaa';
  const btnLabel =
    status === 'connected' ? '🔄 Ongoing'   :
    status === 'completed' ? '✅ Done'       :
    status === 'requested' ? '⏳ Requested' :
                             '🤝 Request Swap';
  const disabled = status !== 'none';

  return (
    <View style={{ width: CARD_W }}>
      <Animated.View
        style={isActive
          ? { transform: [{ translateX: tx }, { scale: sc }] }
          : { opacity: 0.58, transform: [{ scale: 0.95 }] }}
      >
        <View style={mc.glow1} />
        <View style={mc.glow2} />
        <View style={mc.card}>
          <View style={mc.headerRow}>
            <Text style={mc.avatar}>{user.avatar}</Text>
            <View style={{ flex: 1 }}>
              <Text style={mc.name}>{user.name}</Text>
              <Text style={mc.sub} numberOfLines={1}>Offers: {user.offers.slice(0, 2).join(', ')}</Text>
            </View>
            <View style={[mc.pctBadge, { backgroundColor: barColor }]}>
              <Text style={mc.pctTxt}>{pct}%</Text>
            </View>
          </View>

          <View style={mc.barTrack}>
            <View style={[mc.barFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
          </View>
          <Text style={mc.barLbl}>Match score</Text>

          <Text style={mc.secLbl}>Wants to learn</Text>
          <View style={mc.chips}>
            {user.requests.map(r => (
              <View key={r} style={mc.chip}><Text style={mc.chipTxt}>{r}</Text></View>
            ))}
          </View>

          <Pressable
            onPress={disabled ? undefined : onRequest}
            style={({ pressed }) => [mc.btn, { backgroundColor: disabled ? 'rgba(0,0,0,0.12)' : '#2a8780' }, pressed && !disabled && { opacity: 0.8 }]}
            accessibilityRole="button" accessibilityLabel={btnLabel}
          >
            <Text style={[mc.btnTxt, disabled && { color: 'rgba(0,0,0,0.4)' }]}>{btnLabel}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const mc = StyleSheet.create({
  glow1:    { position: 'absolute', inset: 0, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.22)', transform: [{ scale: 1.07 }] },
  glow2:    { position: 'absolute', inset: 0, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', transform: [{ scale: 1.12 }] },
  card:     { borderRadius: 14, padding: 18, backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 14, elevation: 10 },
  headerRow:{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar:   { fontSize: 36 },
  name:     { fontSize: 18, fontWeight: '800', color: '#000' },
  sub:      { fontSize: 12, color: 'rgba(0,0,0,0.55)', marginTop: 2 },
  pctBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pctTxt:   { fontSize: 13, fontWeight: '900', color: '#fff' },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: 4 },
  barFill:  { height: 6, borderRadius: 3 },
  barLbl:   { fontSize: 11, color: 'rgba(0,0,0,0.55)', marginBottom: 14 },
  secLbl:   { fontSize: 12, fontWeight: '700', color: 'rgba(0,0,0,0.55)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
  chips:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 18 },
  chip:     { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(0,0,0,0.08)' },
  chipTxt:  { fontSize: 12, fontWeight: '700', color: '#000' },
  btn:      { borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  btnTxt:   { fontSize: 15, fontWeight: '800', color: '#fff' },
});

// ── Dots ──────────────────────────────────────────────────────────────────────
function Dots({ n, active }: { n: number; active: number }) {
  return (
    <View style={dt.row}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={[dt.base, i === active ? dt.on : dt.off]} />
      ))}
    </View>
  );
}
const dt = StyleSheet.create({
  row:  { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  base: { borderRadius: 99 },
  on:   { width: 22, height: 8, backgroundColor: '#000' },
  off:  { width: 8,  height: 8, backgroundColor: 'rgba(0,0,0,0.22)' },
});

// ── Infinite carousel ─────────────────────────────────────────────────────────
function MatchCarousel({
  scored, onRequest,
}: {
  scored: { user: typeof MOCK_USERS[0]; score: number; status: 'none' | 'requested' | 'connected' | 'completed' }[];
  onRequest: (id: string) => void;
}) {
  const LOOP = Math.min(3, scored.length);
  const LOOPED = [
    ...scored.slice(-LOOP).map((c, i) => ({ ...c, _key: `pre-${i}` })),
    ...scored.map((c, i) => ({ ...c, _key: `real-${i}` })),
    ...scored.slice(0, LOOP).map((c, i) => ({ ...c, _key: `post-${i}` })),
  ];
  const REAL_OFF = LOOP;
  const REAL_LEN = scored.length;

  const [active, setActive] = useState(REAL_OFF);
  const [prev,   setPrev]   = useState(REAL_OFF);
  const listRef  = useRef<FlatList>(null);
  const jumping  = useRef(false);
  const realIdx  = ((active - REAL_OFF) % REAL_LEN + REAL_LEN) % REAL_LEN;
  const dir      = active >= prev ? 'right' : 'left';

  function maybeLoop(idx: number) {
    let t: number | null = null;
    if (idx < REAL_OFF)               t = idx + REAL_LEN;
    else if (idx >= REAL_OFF + REAL_LEN) t = idx - REAL_LEN;
    if (t !== null && !jumping.current) {
      jumping.current = true;
      listRef.current?.scrollToIndex({ index: t, animated: false });
      setActive(t); setPrev(t);
      setTimeout(() => { jumping.current = false; }, 80);
    }
  }

  const onView = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (jumping.current) return;
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      const n = viewableItems[0].index!;
      setActive(p => { setPrev(p); return n; });
      maybeLoop(n);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [LOOPED.length]);

  const vCfg = useRef({ itemVisiblePercentThreshold: 55 }).current;

  useEffect(() => {
    listRef.current?.scrollToIndex({ index: REAL_OFF, animated: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goTo(delta: number) {
    if (jumping.current) return;
    const n = Math.max(0, Math.min(LOOPED.length - 1, active + delta));
    setPrev(active);
    listRef.current?.scrollToIndex({ index: n, animated: true });
    setActive(n);
    setTimeout(() => maybeLoop(n), 350);
  }

  return (
    <View style={cr.wrap}>
      <FlatList
        ref={listRef}
        data={LOOPED}
        keyExtractor={item => item._key}
        horizontal
        pagingEnabled={false}
        snapToInterval={STEP}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SIDE_PAD }}
        getItemLayout={(_, i) => ({ length: STEP, offset: STEP * i, index: i })}
        renderItem={({ item, index }) => (
          <View style={{ width: STEP, alignItems: 'center', paddingVertical: 16 }}>
            <MatchCard
              user={item.user} isActive={index === active}
              score={item.score} status={item.status}
              dir={dir} onRequest={() => onRequest(item.user.id)}
            />
          </View>
        )}
        onViewableItemsChanged={onView}
        viewabilityConfig={vCfg}
      />

      {/* Arrows: absolutely positioned — zero layout footprint */}
      <Pressable
        onPress={() => goTo(-1)}
        style={[cr.arrow, cr.arrowL]}
        accessibilityRole="button" accessibilityLabel="Previous"
        hitSlop={{ top: 16, bottom: 16, left: 12, right: 12 }}
      >
        <Text style={cr.arrowTxt}>‹</Text>
      </Pressable>
      <Pressable
        onPress={() => goTo(1)}
        style={[cr.arrow, cr.arrowR]}
        accessibilityRole="button" accessibilityLabel="Next"
        hitSlop={{ top: 16, bottom: 16, left: 12, right: 12 }}
      >
        <Text style={cr.arrowTxt}>›</Text>
      </Pressable>

      <Dots n={REAL_LEN} active={realIdx} />
    </View>
  );
}

const cr = StyleSheet.create({
  wrap:    { width: '100%', alignItems: 'center' },
  arrow:   { position: 'absolute', top: '50%', marginTop: -28, zIndex: 10, width: 40, height: 56, alignItems: 'center', justifyContent: 'center' },
  arrowL:  { left: 2 },
  arrowR:  { right: 2 },
  arrowTxt: { fontSize: 32, fontWeight: '900', color: '#2a8780', lineHeight: 38 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MatchingScreen() {
  const [tick, setTick] = useState(0);
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

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      {/* Full-bleed teal background */}
      <View style={s.bgLayer} />
      <View style={s.grid} />
      {/* Glow orbs — same as register/login */}
      <View style={[s.glow, s.glowOut]} />
      <View style={[s.glow, s.glowIn]} />

      {/* Pinned header — logo stays locked */}
      <View style={s.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          accessibilityRole="button" accessibilityLabel="Go back"
        >
          <Text style={s.backArrow}>‹</Text>
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.title}>Find Skills to Trade</Text>
          <Text style={s.subtitle}>Swipe to browse · tap to request</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Edge-to-edge carousel */}
      <View style={{ flex: 1 }}>
        <MatchCarousel
          scored={scored}
          onRequest={(id) => { sendRequest(id); setTick(n => n + 1); }}
        />
        <Text style={s.tip}>← Swipe to browse · Tap Request to swap →</Text>
      </View>

      <View style={s.footer}>
        <Pressable
          onPress={() => router.replace('/transaction')}
          style={({ pressed }) => [s.footerBtn, pressed && { opacity: 0.82 }]}
          accessibilityRole="button" accessibilityLabel="Back to swap hub"
        >
          <Text style={s.footerBtnTxt}>← Back to Swap Hub</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#8FEBE5' },
  bgLayer:      { ...StyleSheet.absoluteFillObject, backgroundColor: '#7DE5E5' },
  grid:         { ...StyleSheet.absoluteFillObject, opacity: 0.10, borderColor: 'rgba(0,0,0,0.2)', borderWidth: 0.5 },
  glow:         { position: 'absolute', borderRadius: 100, top: 40, alignSelf: 'center' },
  glowOut:      { width: 240, height: 90, backgroundColor: 'rgba(0,0,0,0.07)', transform: [{ scale: 1.4 }] },
  glowIn:       { width: 220, height: 80, backgroundColor: 'rgba(0,0,0,0.05)', transform: [{ scale: 1.2 }] },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 12, paddingBottom: 4 },
  backBtn:      { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backArrow:    { fontSize: 32, fontWeight: '900', color: '#2a8780', lineHeight: 36 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title:        { fontSize: 22, fontWeight: '800', color: '#000' },
  subtitle:     { fontSize: 13, color: 'rgba(0,0,0,0.6)', marginTop: 2 },
  tip:          { fontSize: 12, color: 'rgba(0,0,0,0.45)', textAlign: 'center', marginTop: 4, marginBottom: 8 },
  footer:       { paddingHorizontal: 20, paddingBottom: 24 },
  footerBtn:    { borderRadius: 8, paddingVertical: 13, backgroundColor: '#2a8780', alignItems: 'center' },
  footerBtnTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
