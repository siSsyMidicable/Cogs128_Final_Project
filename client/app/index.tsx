import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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

const CARDS = [
  {
    id: "1",
    step: "1",
    title: "List a Skill",
    description:
      "Share what you can teach — coding, cooking, design, anything. Your skill is your currency.",
    tilt: "-1deg",
    color: "#01696F",
  },
  {
    id: "2",
    step: "2",
    title: "Browse Skills",
    description:
      "Find someone who offers what you need. Filter by category, check their trust score, and see your match percentage.",
    tilt: "1deg",
    color: "#01696F",
  },
  {
    id: "3",
    step: "3",
    title: "Request a Swap",
    description:
      "Send a swap request, connect, and exchange skills. After you're done, rate each other to build community trust.",
    tilt: "-0.8deg",
    color: "#437A22",
  },
];

// ─── Spring settle animation ──────────────────────────────────────────────────
// Swipe in any direction → card swings left→right→left→settle like a pendulum.
function useSettleAnim() {
  const anim = useRef(new Animated.Value(0)).current;

  const trigger = useCallback(() => {
    anim.setValue(0);
    Animated.sequence([
      Animated.spring(anim, { toValue: -7, useNativeDriver: true, speed: 42, bounciness: 18 }),
      Animated.spring(anim, { toValue:  5, useNativeDriver: true, speed: 40, bounciness: 14 }),
      Animated.spring(anim, { toValue: -3, useNativeDriver: true, speed: 38, bounciness: 10 }),
      Animated.spring(anim, { toValue:  0, useNativeDriver: true, speed: 30, bounciness:  6 }),
    ]).start();
  }, [anim]);

  return { anim, trigger };
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({
  step, title, description, tilt, color, isActive,
}: {
  step: string; title: string; description: string;
  tilt: string; color: string; isActive: boolean;
}) {
  const { anim, trigger } = useSettleAnim();
  const wasActive = useRef(false);

  if (isActive && !wasActive.current) {
    wasActive.current = true;
    trigger();
  } else if (!isActive) {
    wasActive.current = false;
  }

  return (
    <View style={[styles.cardWrapper, { width: CARD_WIDTH + H_PAD * 2 }]}>
      <Animated.View
        style={[
          styles.cardPerspective,
          isActive
            ? { transform: [{ translateX: anim }] }
            : undefined,
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
          <View
            style={[
              stepCardStyles.badge,
              { backgroundColor: isActive ? color : "rgba(0,0,0,0.12)" },
            ]}
          >
            <Text
              style={[
                stepCardStyles.badgeNum,
                { color: isActive ? "#fff" : "rgba(0,0,0,0.35)" },
              ]}
            >
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

// ─── Dot indicators ───────────────────────────────────────────────────────────
function DotIndicators({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === activeIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────
function StepCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index!);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(CARDS.length - 1, index));
    flatListRef.current?.scrollToIndex({ index: clamped, animated: true });
    setActiveIndex(clamped);
  };

  return (
    <View style={styles.carouselSection}>
      <View style={styles.arrowRow}>
        {/* Left arrow */}
        <Pressable
          onPress={() => goTo(activeIndex - 1)}
          style={({ pressed }) => [
            arrowStyles.arrowBtn,
            activeIndex === 0 && arrowStyles.arrowBtnDisabled,
            pressed && arrowStyles.arrowBtnPressed,
          ]}
          disabled={activeIndex === 0}
          accessibilityLabel="Previous step"
          accessibilityRole="button"
        >
          <Text
            style={[
              arrowStyles.arrowText,
              activeIndex === 0 && arrowStyles.arrowTextDisabled,
            ]}
          >
            ‹
          </Text>
        </Pressable>

        <View style={styles.carouselScrollView}>
          <FlatList
            ref={flatListRef}
            data={CARDS}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled={false}
            snapToInterval={CARD_STEP + H_PAD * 2}
            snapToAlignment="center"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: SIDE_PADDING,
              paddingVertical: 18,
              gap: 0,
            }}
            renderItem={({ item, index }) => (
              <StepCard
                step={item.step}
                title={item.title}
                description={item.description}
                tilt={item.tilt}
                color={item.color}
                isActive={index === activeIndex}
              />
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        </View>

        {/* Right arrow */}
        <Pressable
          onPress={() => goTo(activeIndex + 1)}
          style={({ pressed }) => [
            arrowStyles.arrowBtn,
            activeIndex === CARDS.length - 1 && arrowStyles.arrowBtnDisabled,
            pressed && arrowStyles.arrowBtnPressed,
          ]}
          disabled={activeIndex === CARDS.length - 1}
          accessibilityLabel="Next step"
          accessibilityRole="button"
        >
          <Text
            style={[
              arrowStyles.arrowText,
              activeIndex === CARDS.length - 1 && arrowStyles.arrowTextDisabled,
            ]}
          >
            ›
          </Text>
        </Pressable>
      </View>

      <DotIndicators count={CARDS.length} activeIndex={activeIndex} />
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
          {/* Hero */}
          <View style={styles.hero}>
            <View style={[styles.heroGlow, styles.heroGlowOuter]} />
            <View style={[styles.heroGlow, styles.heroGlowInner]} />
            <Text style={styles.title}>Skill Swap</Text>
            <Text style={styles.subtitle}>Trade your skills, grow together</Text>
          </View>

          {/* Carousel */}
          <StepCarousel />

          {/* CTA */}
          <Pressable
            onPress={() => router.replace("/auth/login")}
            style={({ pressed }) => [
              styles.skipButtonContainer,
              pressed && styles.skipButtonPressed,
            ]}
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

// ─── Step card badge styles ───────────────────────────────────────────────────
const stepCardStyles = StyleSheet.create({
  badge: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 4, elevation: 3,
  },
  badgeNum: { fontSize: 14, fontWeight: "800" },
});

// ─── Arrow button styles ──────────────────────────────────────────────────────
const arrowStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", width: "100%" },
  arrowBtn:          { width: 36, height: 44, alignItems: "center", justifyContent: "center" },
  arrowBtnDisabled:  { opacity: 0.25 },
  arrowBtnPressed:   { opacity: 0.6 },
  arrowText:         { fontSize: 30, fontWeight: "900", color: "#01696F", lineHeight: 34 },
  arrowTextDisabled: { color: "rgba(0,0,0,0.3)" },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: "#8FEBE5" },
  screen:      { flex: 1, position: "relative", overflow: "hidden" },
  gradientBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: "#7DE5E5" },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject, opacity: 0.12,
    backgroundColor: "transparent", borderColor: "rgba(0,0,0,0.2)", borderWidth: 0.5,
  },
  content:     { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 28 },

  // ─ Hero ─
  hero:         { width: "100%", alignItems: "center", marginBottom: 20, paddingHorizontal: 28 },
  heroGlow:     { position: "absolute", borderRadius: 100 },
  heroGlowOuter: { width: 240, height: 90, backgroundColor: "rgba(0,0,0,0.07)", transform: [{ scale: 1.4 }] },
  heroGlowInner: { width: 220, height: 80, backgroundColor: "rgba(0,0,0,0.05)", transform: [{ scale: 1.2 }] },
  title:        { fontSize: 40, fontWeight: "800", color: "#000", marginBottom: 10 },
  subtitle:     { fontSize: 18, color: "rgba(0,0,0,0.8)", textAlign: "center" },

  // ─ Carousel ─
  carouselSection:    { width: "100%", alignItems: "center", marginBottom: 24, overflow: "visible" },
  arrowRow:           { flexDirection: "row", alignItems: "center", width: "100%", overflow: "visible" },
  carouselScrollView: { flex: 1, overflow: "visible" },

  // ─ Card ─
  cardWrapper:     { paddingVertical: 18, paddingHorizontal: H_PAD, overflow: "visible" },
  cardPerspective: { position: "relative", marginVertical: 2, overflow: "visible" },
  cardGlow:        {
    position: "absolute", left: 0, right: 0, top: 2, bottom: -2,
    borderRadius: 16, backgroundColor: "rgba(255,255,255,0.22)", transform: [{ scale: 1.07 }],
  },
  cardGlowTwo: {
    position: "absolute", left: 0, right: 0, top: 2, bottom: -2,
    borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", transform: [{ scale: 1.12 }],
  },
  infoCard:    {
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20, shadowRadius: 12, elevation: 6,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.45)",
  },
  infoCardDim: { opacity: 0.65, transform: [{ scale: 0.97 }] },
  cardTitle:   { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 8 },
  cardDescription: { fontSize: 14, color: "rgba(0,0,0,0.78)", lineHeight: 20 },

  // ─ Dots ─
  dotsRow:     { flexDirection: "row", gap: 8, marginTop: 12, alignItems: "center", justifyContent: "center" },
  dot:         { borderRadius: 99 },
  dotActive:   { width: 22, height: 8, backgroundColor: "#000" },
  dotInactive: { width: 8,  height: 8, backgroundColor: "rgba(0,0,0,0.25)" },

  // ─ CTA ─
  skipButtonContainer: { width: "100%", maxWidth: 260, position: "relative" },
  skipButtonPressed:   { opacity: 0.88 },
  skipGlow:            { position: "absolute", left: 8, right: 8, top: 4, bottom: -2, borderRadius: 10 },
  skipGlowA:           { backgroundColor: "rgba(255,107,26,0.45)" },
  skipGlowB:           { backgroundColor: "rgba(255,140,66,0.45)", transform: [{ scale: 1.03 }] },
  skipGlowC:           { backgroundColor: "rgba(255,163,102,0.35)", transform: [{ scale: 1.06 }] },
  skipButton:          {
    borderRadius: 8, paddingVertical: 14, paddingHorizontal: 22,
    backgroundColor: "#FF8C42",
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 8,
  },
  skipLabel: { fontSize: 18, color: "#000", fontWeight: "800" },
  skipArrow: { fontSize: 24, lineHeight: 24, fontWeight: "900", color: "#000" },
});
