/**
 * Intro / Skill Swap landing screen
 * – Infinite looping carousel, edge-to-edge (arrows are absolute overlays)
 * – Natural spring settle: tension 38, friction 7
 * – Floating glass-island theme — logo pinned at top, glass card floats below
 */
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';

const { width: SW } = Dimensions.get('window');
const CARD_W   = Math.min(SW - 48, 320);
const GAP      = 16;
const STEP     = CARD_W + GAP;
const SIDE_PAD = (SW - CARD_W) / 2;

const BASE_CARDS = [
  {
    id: '1', step: '1', title: 'List a Skill',
    description: 'Share what you can teach — coding, cooking, design, anything. Your skill is your currency.',
    tilt: '-1deg', color: '#01696F',
  },
  {
    id: '2', step: '2', title: 'Browse Skills',
    description: 'Find someone who offers what you need. Filter by category, check their trust score, and see your match percentage.',
    tilt: '1deg', color: '#01696F',
  },
  {
    id: '3', step: '3', title: 'Request a Swap',
    description: "Send a swap request, connect, and exchange skills. After you're done, rate each other to build community trust.",
    tilt: '-0.8deg', color: '#437A22',
  },
];

const LOOP = 3;
const LOOPED = [
  ...BASE_CARDS.slice(-LOOP).map((c, i) => ({ ...c, id: `pre-${i}` })),
  ...BASE_CARDS,
  ...BASE_CARDS.slice(0, LOOP).map((c, i) => ({ ...c, id: `post-${i}` })),
];
const REAL_OFF = LOOP;
const REAL_LEN = BASE_CARDS.length;

function useSettle() {
  const tx    = useRef(new Animated.Value(0)).current;
  const sc    = useRef(new Animated.Value(1)).current;
  const anim  = useRef<Animated.CompositeAnimation | null>(null);

  const fire = useCallback((dir: 'left' | 'right' = 'right') => {
    anim.current?.stop();
    tx.setValue(dir === 'right' ? 14 : -14);
    sc.setValue(0.97);
    anim.current = Animated.parallel([
      Animated.spring(tx, { toValue: 0, useNativeDriver: true, tension: 38, friction: 7, velocity: 0 }),
      Animated.spring(sc, { toValue: 1, useNativeDriver: true, tension: 42, friction: 8 }),
    ]);
    anim.current.start();
  }, [tx, sc]);

  return { tx, sc, fire };
}

function StepCard({ step, title, description, tilt, color, isActive, dir }: {
  step: string; title: string; description: string;
  tilt: string; color: string; isActive: boolean; dir: 'left' | 'right';
}) {
  const { tx, sc, fire } = useSettle();
  const was = useRef(false);
  useEffect(() => {
    if (isActive && !was.current) { was.current = true; fire(dir); }
    else if (!isActive) { was.current = false; }
  }, [isActive, dir, fire]);

  return (
    <View style={{ width: CARD_W }}>
      <Animated.View style={isActive ? { transform: [{ translateX: tx }, { scale: sc }] } : undefined}>
        <View style={card.glow1} />
        <View style={card.glow2} />
        <View style={[card.inner, { transform: [{ rotate: tilt }] }, !isActive && card.dim]}>
          <View style={[card.badge, { backgroundColor: isActive ? color : 'rgba(0,0,0,0.12)' }]}>
            <Text style={[card.badgeNum, { color: isActive ? '#fff' : 'rgba(0,0,0,0.35)' }]}>{step}</Text>
          </View>
          <Text style={card.title}>{title}</Text>
          <Text style={card.desc}>{description}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const card = StyleSheet.create({
  glow1:    { position: 'absolute', inset: 0, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.22)', transform: [{ scale: 1.07 }] },
  glow2:    { position: 'absolute', inset: 0, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', transform: [{ scale: 1.12 }] },
  inner:    { borderRadius: 12, padding: 20, backgroundColor: 'rgba(255,255,255,0.58)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.48)', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  dim:      { opacity: 0.60, transform: [{ scale: 0.96 }] },
  badge:    { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4, elevation: 3 },
  badgeNum: { fontSize: 14, fontWeight: '800' },
  title:    { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 8 },
  desc:     { fontSize: 14, color: 'rgba(0,0,0,0.75)', lineHeight: 20 },
});

function Dots({ n, active }: { n: number; active: number }) {
  return (
    <View style={dot.row}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={[dot.base, i === active ? dot.on : dot.off]} />
      ))}
    </View>
  );
}
const dot = StyleSheet.create({
  row:  { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  base: { borderRadius: 99 },
  on:   { width: 22, height: 8, backgroundColor: '#000' },
  off:  { width: 8,  height: 8, backgroundColor: 'rgba(0,0,0,0.25)' },
});

function Carousel() {
  const [active, setActive] = useState(REAL_OFF);
  const [prev,   setPrev]   = useState(REAL_OFF);
  const listRef   = useRef<FlatList>(null);
  const jumping   = useRef(false);
  const realIndex = ((active - REAL_OFF) % REAL_LEN + REAL_LEN) % REAL_LEN;

  function maybeLoop(idx: number) {
    let t: number | null = null;
    if (idx < REAL_OFF)              t = idx + REAL_LEN;
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
  }, []);

  const vCfg = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const dir  = active >= prev ? 'right' : 'left';

  useEffect(() => {
    listRef.current?.scrollToIndex({ index: REAL_OFF, animated: false });
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
    <View style={crs.wrap}>
      {/* Full-width FlatList — no arrows stealing space */}
      <FlatList
        ref={listRef}
        data={LOOPED}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled={false}
        snapToInterval={STEP}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SIDE_PAD }}
        getItemLayout={(_, i) => ({ length: STEP, offset: STEP * i, index: i })}
        renderItem={({ item, index }) => (
          <View style={{ width: STEP, alignItems: 'center', paddingVertical: 18 }}>
            <StepCard
              step={item.step} title={item.title} description={item.description}
              tilt={item.tilt} color={item.color}
              isActive={index === active} dir={dir}
            />
          </View>
        )}
        onViewableItemsChanged={onView}
        viewabilityConfig={vCfg}
      />

      {/* Arrows: absolutely positioned on top — no layout impact */}
      <Pressable
        onPress={() => goTo(-1)}
        style={[crs.arrow, crs.arrowLeft]}
        accessibilityLabel="Previous" accessibilityRole="button"
        hitSlop={{ top: 16, bottom: 16, left: 12, right: 12 }}
      >
        <Text style={crs.arrowTxt}>‹</Text>
      </Pressable>
      <Pressable
        onPress={() => goTo(1)}
        style={[crs.arrow, crs.arrowRight]}
        accessibilityLabel="Next" accessibilityRole="button"
        hitSlop={{ top: 16, bottom: 16, left: 12, right: 12 }}
      >
        <Text style={crs.arrowTxt}>›</Text>
      </Pressable>

      <Dots n={REAL_LEN} active={realIndex} />
    </View>
  );
}

const crs = StyleSheet.create({
  wrap:       { width: '100%', alignItems: 'center' },
  arrow:      { position: 'absolute', top: '50%', marginTop: -28, zIndex: 10, width: 36, height: 56, alignItems: 'center', justifyContent: 'center' },
  arrowLeft:  { left: 4 },
  arrowRight: { right: 4 },
  arrowTxt:   { fontSize: 32, fontWeight: '900', color: '#01696F', lineHeight: 38 },
});

export default function IntroScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.screen}>
        <View style={s.bg} />
        <View style={s.grid} />

        {/* Pinned logo/hero — never scrolls */}
        <View style={s.hero}>
          <View style={[s.glow, s.glowOut]} />
          <View style={[s.glow, s.glowIn]} />
          <Text style={s.title}>Skill Swap</Text>
          <Text style={s.subtitle}>Trade your skills, grow together</Text>
        </View>

        <Carousel />

        {/* CTA */}
        <Pressable
          onPress={() => router.replace('/auth/login')}
          style={({ pressed }) => [s.ctaWrap, pressed && { opacity: 0.88 }]}
          accessibilityLabel="Skip introduction — go to sign in"
        >
          <View style={s.ctaGlow1} />
          <View style={s.ctaGlow2} />
          <View style={s.ctaGlow3} />
          <View style={s.cta}>
            <Text style={s.ctaLabel}>Skip Introduction</Text>
            <Text style={s.ctaArrow}>›</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: '#8FEBE5' },
  screen:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24, overflow: 'hidden' },
  bg:       { ...StyleSheet.absoluteFillObject, backgroundColor: '#7DE5E5' },
  grid:     { ...StyleSheet.absoluteFillObject, opacity: 0.10, borderColor: 'rgba(0,0,0,0.2)', borderWidth: 0.5 },
  hero:     { width: '100%', alignItems: 'center', marginBottom: 16, paddingHorizontal: 24 },
  glow:     { position: 'absolute', borderRadius: 100 },
  glowOut:  { width: 240, height: 90, backgroundColor: 'rgba(0,0,0,0.07)', transform: [{ scale: 1.4 }] },
  glowIn:   { width: 220, height: 80, backgroundColor: 'rgba(0,0,0,0.05)', transform: [{ scale: 1.2 }] },
  title:    { fontSize: 40, fontWeight: '800', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 17, color: 'rgba(0,0,0,0.78)', textAlign: 'center' },
  ctaWrap:  { width: '100%', maxWidth: 260, marginTop: 20, position: 'relative' },
  ctaGlow1: { position: 'absolute', left: 8, right: 8, top: 4, bottom: -2, borderRadius: 10, backgroundColor: 'rgba(255,107,26,0.45)' },
  ctaGlow2: { position: 'absolute', left: 8, right: 8, top: 4, bottom: -2, borderRadius: 10, backgroundColor: 'rgba(255,140,66,0.40)', transform: [{ scale: 1.03 }] },
  ctaGlow3: { position: 'absolute', left: 8, right: 8, top: 4, bottom: -2, borderRadius: 10, backgroundColor: 'rgba(255,163,102,0.32)', transform: [{ scale: 1.06 }] },
  cta:      { borderRadius: 8, paddingVertical: 14, paddingHorizontal: 22, backgroundColor: '#FF8C42', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  ctaLabel: { fontSize: 18, color: '#000', fontWeight: '800' },
  ctaArrow: { fontSize: 24, lineHeight: 24, fontWeight: '900', color: '#000' },
});
