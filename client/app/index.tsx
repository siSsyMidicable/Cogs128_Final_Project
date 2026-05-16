/**
 * Intro / Skill Swap landing screen
 * – Infinite looping carousel (cards wrap around seamlessly)
 * – Natural spring settle: tension 38, friction 7 — lazy drift, one soft overshoot
 * – Floating glass-island theme matching all other screens
 */
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH   = Math.min(SCREEN_WIDTH - 80, 300);
const H_PAD        = 10;
const CARD_GAP     = 20;
const CARD_STEP    = CARD_WIDTH + CARD_GAP;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2 - H_PAD;

const BASE_CARDS = [
  {
    id: "1", step: "1", title: "List a Skill",
    description: "Share what you can teach — coding, cooking, design, anything. Your skill is your currency.",
    tilt: "-1deg", color: "#01696F",
  },
  {
    id: "2", step: "2", title: "Browse Skills",
    description: "Find someone who offers what you need. Filter by category, check their trust score, and see your match percentage.",
    tilt: "1deg", color: "#01696F",
  },
  {
    id: "3", step: "3", title: "Request a Swap",
    description: "Send a swap request, connect, and exchange skills. After you're done, rate each other to build community trust.",
    tilt: "-0.8deg", color: "#437A22",
  },
];

// Infinite-loop data: clone cards before + after real list
const LOOP_COUNT = 3; // clones per side
const LOOPED_CARDS = [
  ...BASE_CARDS.slice(-LOOP_COUNT).map((c, i) => ({ ...c, id: `pre-${i}` })),
  ...BASE_CARDS,
  ...BASE_CARDS.slice(0, LOOP_COUNT).map((c, i) => ({ ...c, id: `post-${i}` })),
];
const REAL_OFFSET = LOOP_COUNT; // index where real cards start in LOOPED_CARDS
const REAL_LEN    = BASE_CARDS.length;

// ─── Fluid spring: lazy drift, one soft overshoot — not rigid ────────────────
function useSettleAnim() {
  const anim   = useRef(new Animated.Value(0)).current;
  const spring = useRef<Animated.CompositeAnimation | null>(null);
  const scale  = useRef(new Animated.Value(1)).current;

  const trigger = useCallback((fromDir: 'left' | 'right' = 'right') => {
    spring.current?.stop();
    anim.setValue(fromDir === 'right' ? 14 : -14);
    scale.setValue(0.97);
    spring.current = Animated.parallel([
      Animated.spring(anim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 38,   // low tension = card drifts lazily to rest
        friction: 7,   // slight underdamp = one organic overshoot, then settles
        velocity: 0,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 42,
        friction: 8,
      }),
    ]);
    spring.current.start();
  }, [anim, scale]);

  return { anim, scale, trigger };
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({
  step, title, description, tilt, color, isActive, swipeDir,
}: {
  step: string; title: string; description: string;
  tilt: string; color: string; isActive: boolean;
  swipeDir: 'left' | 'right';
}) {
  const { anim, scale, trigger } = useSettleAnim();
  const wasActive = useRef(false);

  useEffect(() => {
    if (isActive && !wasActive.current) {
      wasActive.current = true;
      trigger(swipeDir);
    } else if (!isActive) {
      wasActive.current = false;
    }
  }, [isActive, swipeDir, trigger]);

  return (
    <View style={[styles.cardWrapper, { width: CARD_WIDTH + H_PAD * 2 }]}>
      <Animated.View
        style={[
          styles.cardPerspective,
          isActive ? { transform: [{ translateX: anim }, { scale }] } : undefined,
        ]}
      >
        <View style={styles.cardGlow} />
        <View style={styles.cardGlowTwo} />
        <View
          style={[
            styles.infoCard,
            { transform: [{ rotate: tilt }] },
            !isActive && styles.infoCardDim,
          ]}
        >
          <View style={[stepCardStyles.badge, { backgroundColor: isActive ? color : "rgba(0,0,0,0.12)" }]}>
            <Text style={[stepCardStyles.badgeNum, { color: isActive ? "#fff" : "rgba(0,0,0,0.35)" }]}>
              {step}
            </Text>
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Dot indicators (based on real card count only) ───────────────────────────
function DotIndicators({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

// ─── Infinite carousel ───────────────────────────────────────────────────────
function StepCarousel() {
  const [activeLooped, setActiveLooped] = useState(REAL_OFFSET);
  const [prevLooped,   setPrevLooped]   = useState(REAL_OFFSET);
  const flatListRef = useRef<FlatList>(null);
  const isJumping   = useRef(false);

  // Real card index (0-based, for dots)
  const realIndex = ((activeLooped - REAL_OFFSET) % REAL_LEN + REAL_LEN) % REAL_LEN;

  // Jump to real position after looping past a clone
  function maybeLoop(rawIndex: number) {
    let target: number | null = null;
    if (rawIndex < REAL_OFFSET)                      target = rawIndex + REAL_LEN;
    else if (rawIndex >= REAL_OFFSET + REAL_LEN)     target = rawIndex - REAL_LEN;
    if (target !== null && !isJumping.current) {
      isJumping.current = true;
      flatListRef.current?.scrollToIndex({ index: target, animated: false });
      setActiveLooped(target);
      setPrevLooped(target);
      setTimeout(() => { isJumping.current = false; }, 80);
    }
  }

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (isJumping.current) return;
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const next = viewableItems[0].index!;
        setActiveLooped(prev => { setPrevLooped(prev); return next; });
        maybeLoop(next);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const swipeDir = activeLooped >= prevLooped ? 'right' : 'left';

  // Start at real first card (skip pre-clones)
  useEffect(() => {
    flatListRef.current?.scrollToIndex({ index: REAL_OFFSET, animated: false });
  }, []);

  function goTo(delta: number) {
    if (isJumping.current) return;
    const next = activeLooped + delta;
    const clamped = Math.max(0, Math.min(LOOPED_CARDS.length - 1, next));
    setPrevLooped(activeLooped);
    flatListRef.current?.scrollToIndex({ index: clamped, animated: true });
    setActiveLooped(clamped);
    setTimeout(() => maybeLoop(clamped), 350);
  }

  return (
    <View style={styles.carouselSection}>
      <View style={styles.arrowRow}>
        <Pressable
          onPress={() => goTo(-1)}
          style={({ pressed }) => [arrowStyles.arrowBtn, pressed && arrowStyles.arrowBtnPressed]}
          accessibilityLabel="Previous" accessibilityRole="button"
        >
          <Text style={arrowStyles.arrowText}>‹</Text>
        </Pressable>

        <View style={styles.carouselScrollView}>
          <FlatList
            ref={flatListRef}
            data={LOOPED_CARDS}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled={false}
            snapToInterval={CARD_STEP + H_PAD * 2}
            snapToAlignment="center"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SIDE_PADDING, paddingVertical: 18, gap: 0 }}
            getItemLayout={(_, index) => ({
              length: CARD_STEP + H_PAD * 2,
              offset: (CARD_STEP + H_PAD * 2) * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <StepCard
                step={item.step} title={item.title}
                description={item.description} tilt={item.tilt}
                color={item.color} isActive={index === activeLooped}
                swipeDir={swipeDir}
              />
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        </View>

        <Pressable
          onPress={() => goTo(1)}
          style={({ pressed }) => [arrowStyles.arrowBtn, pressed && arrowStyles.arrowBtnPressed]}
          accessibilityLabel="Next" accessibilityRole="button"
        >
          <Text style={arrowStyles.arrowText}>›</Text>
        </Pressable>
      </View>
      <DotIndicators count={REAL_LEN} activeIndex={realIndex} />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function IntroScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <View style={styles.gradientBackground} />
        <View style={styles.gridOverlay} />
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={[styles.heroGlow, styles.heroGlowOuter]} />
            <View style={[styles.heroGlow, styles.heroGlowInner]} />
            <Text style={styles.title}>Skill Swap</Text>
            <Text style={styles.subtitle}>Trade your skills, grow together</Text>
          </View>
          <StepCarousel />
          <Pressable
            onPress={() => router.replace("/auth/login")}
            style={({ pressed }) => [styles.skipButtonContainer, pressed && styles.skipButtonPressed]}
            accessibilityLabel="Skip introduction — go to sign in"
          >
            <View style={[styles.skipGlow, styles.skipGlowA]} />
            <View style={[styles.skipGlow, styles.skipGlowB]} />
            <View style={[styles.skipGlow, styles.skipGlowC]} />
            <View style={styles.skipButton}>
              <Text style={styles.skipLabel}>Skip Introduction</Text>
              <Text style={styles.skipArrow}>›</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const stepCardStyles = StyleSheet.create({
  badge:    { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4, elevation: 3 },
  badgeNum: { fontSize: 14, fontWeight: "800" },
});

const arrowStyles = StyleSheet.create({
  arrowBtn:         { width: 36, height: 44, alignItems: "center", justifyContent: "center" },
  arrowBtnPressed:  { opacity: 0.6 },
  arrowText:        { fontSize: 30, fontWeight: "900", color: "#01696F", lineHeight: 34 },
});

const styles = StyleSheet.create({
  safeArea:           { flex: 1, backgroundColor: "#8FEBE5" },
  screen:             { flex: 1, position: "relative", overflow: "hidden" },
  gradientBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: "#7DE5E5" },
  gridOverlay:        { ...StyleSheet.absoluteFillObject, opacity: 0.12, backgroundColor: "transparent", borderColor: "rgba(0,0,0,0.2)", borderWidth: 0.5 },
  content:            { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 28 },
  hero:               { width: "100%", alignItems: "center", marginBottom: 20, paddingHorizontal: 28 },
  heroGlow:           { position: "absolute", borderRadius: 100 },
  heroGlowOuter:      { width: 240, height: 90, backgroundColor: "rgba(0,0,0,0.07)", transform: [{ scale: 1.4 }] },
  heroGlowInner:      { width: 220, height: 80, backgroundColor: "rgba(0,0,0,0.05)", transform: [{ scale: 1.2 }] },
  title:              { fontSize: 40, fontWeight: "800", color: "#000", marginBottom: 10 },
  subtitle:           { fontSize: 18, color: "rgba(0,0,0,0.8)", textAlign: "center" },
  carouselSection:    { width: "100%", alignItems: "center", marginBottom: 24, overflow: "visible" },
  arrowRow:           { flexDirection: "row", alignItems: "center", width: "100%", overflow: "visible" },
  carouselScrollView: { flex: 1, overflow: "visible" },
  cardWrapper:        { paddingVertical: 18, paddingHorizontal: H_PAD, overflow: "visible" },
  cardPerspective:    { position: "relative", marginVertical: 2, overflow: "visible" },
  cardGlow:           { position: "absolute", left: 0, right: 0, top: 2, bottom: -2, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.22)", transform: [{ scale: 1.07 }] },
  cardGlowTwo:        { position: "absolute", left: 0, right: 0, top: 2, bottom: -2, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", transform: [{ scale: 1.12 }] },
  infoCard:           { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.20, shadowRadius: 12, elevation: 6, backgroundColor: "rgba(255,255,255,0.55)", borderWidth: 1, borderColor: "rgba(255,255,255,0.45)" },
  infoCardDim:        { opacity: 0.65, transform: [{ scale: 0.97 }] },
  cardTitle:          { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 8 },
  cardDescription:    { fontSize: 14, color: "rgba(0,0,0,0.78)", lineHeight: 20 },
  dotsRow:            { flexDirection: "row", gap: 8, marginTop: 12, alignItems: "center", justifyContent: "center" },
  dot:                { borderRadius: 99 },
  dotActive:          { width: 22, height: 8, backgroundColor: "#000" },
  dotInactive:        { width: 8, height: 8, backgroundColor: "rgba(0,0,0,0.25)" },
  skipButtonContainer: { width: "100%", maxWidth: 260, position: "relative" },
  skipButtonPressed:  { opacity: 0.88 },
  skipGlow:           { position: "absolute", left: 8, right: 8, top: 4, bottom: -2, borderRadius: 10 },
  skipGlowA:          { backgroundColor: "rgba(255,107,26,0.45)" },
  skipGlowB:          { backgroundColor: "rgba(255,140,66,0.45)", transform: [{ scale: 1.03 }] },
  skipGlowC:          { backgroundColor: "rgba(255,163,102,0.35)", transform: [{ scale: 1.06 }] },
  skipButton:         { borderRadius: 8, paddingVertical: 14, paddingHorizontal: 22, backgroundColor: "#FF8C42", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  skipLabel:          { fontSize: 18, color: "#000", fontWeight: "800" },
  skipArrow:          { fontSize: 24, lineHeight: 24, fontWeight: "900", color: "#000" },
});
