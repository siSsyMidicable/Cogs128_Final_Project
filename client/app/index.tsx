import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
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
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 56, 340);
const CARD_SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

// ─── Carousel now shows the 3 How-It-Works steps ─────────────────────────────
const CARDS = [
  {
    id: "1",
    step: "1",
    title: "List a Skill",
    description: "Share what you can teach — coding, cooking, design, anything. Your skill is your currency.",
    tilt: "-1deg",
    color: "#01696F",
  },
  {
    id: "2",
    step: "2",
    title: "Browse Skills",
    description: "Find someone who offers what you need. Filter by category, check their trust score, and see your match percentage.",
    tilt: "1deg",
    color: "#01696F",
  },
  {
    id: "3",
    step: "3",
    title: "Request a Swap",
    description: "Send a swap request, connect, and exchange skills. After you're done, rate each other to build community trust.",
    tilt: "-0.8deg",
    color: "#437A22",
  },
];

// ─── How It Works header (above carousel) ────────────────────────────────────
function HowItWorksHeader() {
  return (
    <View style={howStyles.container}>
      <Text style={howStyles.heading}>How SkillSwap Works</Text>
      <Text style={howStyles.tagline}>Offer first, then browse, then act.</Text>
    </View>
  );
}

// ─── Memory chips (below Get Started button) ─────────────────────────────────
function MemoryChips() {
  return (
    <View style={howStyles.memoryRow}>
      {["Offer", "Browse", "Request"].map((word, i) => (
        <React.Fragment key={word}>
          <View style={howStyles.chip}>
            <Text style={howStyles.chipText}>{word}</Text>
          </View>
          {i < 2 && <Text style={howStyles.chipArrow}>→</Text>}
        </React.Fragment>
      ))}
    </View>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({
  step,
  title,
  description,
  tilt,
  color,
}: {
  step: string;
  title: string;
  description: string;
  tilt: string;
  color: string;
}) {
  return (
    <View style={[styles.cardWrapper, { width: CARD_WIDTH }]}>
      <View style={styles.cardPerspective}>
        <View style={[styles.cardGlow, styles.cardGlowOne]} />
        <View style={[styles.cardGlow, styles.cardGlowTwo]} />
        <View style={[styles.infoCard, { transform: [{ rotate: tilt }] }]}>
          {/* Step badge */}
          <View style={[stepCardStyles.badge, { backgroundColor: color }]}>
            <Text style={stepCardStyles.badgeNum}>{step}</Text>
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Dot indicators ───────────────────────────────────────────────────────────
function DotIndicators({
  count,
  activeIndex,
}: {
  count: number;
  activeIndex: number;
}) {
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

// ─── Carousel with prev / next arrow buttons ──────────────────────────────────
function StepCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
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
      {/* Arrow row wraps the FlatList */}
      <View style={arrowStyles.row}>
        {/* Prev arrow */}
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
          <Text style={[arrowStyles.arrowText, activeIndex === 0 && arrowStyles.arrowTextDisabled]}>‹</Text>
        </Pressable>

        {/* FlatList */}
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={CARDS}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled={false}
            snapToInterval={CARD_WIDTH + 16}
            snapToAlignment="center"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: CARD_SIDE_PADDING,
              gap: 16,
            }}
            renderItem={({ item }) => (
              <StepCard
                step={item.step}
                title={item.title}
                description={item.description}
                tilt={item.tilt}
                color={item.color}
              />
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        </View>

        {/* Next arrow */}
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
          <Text style={[arrowStyles.arrowText, activeIndex === CARDS.length - 1 && arrowStyles.arrowTextDisabled]}>›</Text>
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

          {/* ① How It Works header — ABOVE carousel */}
          <HowItWorksHeader />

          {/* ② Carousel — now shows the 3 steps with prev/next arrows */}
          <StepCarousel />

          {/* ③ CTA Button */}
          <Pressable
            onPress={() => router.replace("/auth/login")}
            style={({ pressed }) => [
              styles.skipButtonContainer,
              pressed && styles.skipButtonPressed,
            ]}
            accessibilityLabel="Get started — go to sign in"
          >
            <View style={[styles.skipGlow, styles.skipGlowA]} />
            <View style={[styles.skipGlow, styles.skipGlowB]} />
            <View style={[styles.skipGlow, styles.skipGlowC]} />
            <View style={styles.skipButton}>
              <Text style={styles.skipLabel}>Get Started</Text>
              <Text style={styles.skipArrow}>›</Text>
            </View>
          </Pressable>

          {/* ④ Memory chips — BELOW Get Started */}
          <MemoryChips />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── How It Works header + memory chip styles ─────────────────────────────────
const howStyles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 12,
    color: "rgba(0,0,0,0.55)",
  },
  // Memory chips
  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 14,
  },
  chip: {
    backgroundColor: "rgba(1,105,111,0.12)",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(1,105,111,0.25)",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#01696F",
  },
  chipArrow: {
    fontSize: 12,
    color: "#01696F",
    fontWeight: "700",
  },
});

// ─── Step card badge styles ───────────────────────────────────────────────────
const stepCardStyles = StyleSheet.create({
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeNum: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
});

// ─── Arrow button styles ──────────────────────────────────────────────────────
const arrowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  arrowBtn: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowBtnDisabled: {
    opacity: 0.25,
  },
  arrowBtnPressed: {
    opacity: 0.6,
  },
  arrowText: {
    fontSize: 30,
    fontWeight: "900",
    color: "#01696F",
    lineHeight: 34,
  },
  arrowTextDisabled: {
    color: "rgba(0,0,0,0.3)",
  },
});

// ─── Main Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#8FEBE5",
  },
  screen: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#7DE5E5",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
    backgroundColor: "transparent",
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 0.5,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },
  hero: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 28,
  },
  heroGlow: {
    position: "absolute",
    borderRadius: 100,
  },
  heroGlowOuter: {
    width: 240,
    height: 90,
    backgroundColor: "rgba(0,0,0,0.07)",
    transform: [{ scale: 1.4 }],
  },
  heroGlowInner: {
    width: 220,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.05)",
    transform: [{ scale: 1.2 }],
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(0,0,0,0.8)",
    textAlign: "center",
  },

  // Carousel
  carouselSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  cardWrapper: {
    // width set dynamically
  },
  cardPerspective: {
    position: "relative",
  },
  cardGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 2,
    bottom: -2,
    borderRadius: 16,
  },
  cardGlowOne: {
    backgroundColor: "rgba(255,255,255,0.22)",
    transform: [{ scale: 1.07 }],
  },
  cardGlowTwo: {
    backgroundColor: "rgba(255,255,255,0.15)",
    transform: [{ scale: 1.12 }],
  },
  infoCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "rgba(0,0,0,0.78)",
    lineHeight: 20,
  },

  // Dots
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    borderRadius: 99,
  },
  dotActive: {
    width: 22,
    height: 8,
    backgroundColor: "#000",
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  // Get Started button
  skipButtonContainer: {
    width: "100%",
    maxWidth: 240,
    position: "relative",
  },
  skipButtonPressed: {
    opacity: 0.88,
  },
  skipGlow: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 4,
    bottom: -2,
    borderRadius: 10,
  },
  skipGlowA: {
    backgroundColor: "rgba(255,107,26,0.45)",
  },
  skipGlowB: {
    backgroundColor: "rgba(255,140,66,0.45)",
    transform: [{ scale: 1.03 }],
  },
  skipGlowC: {
    backgroundColor: "rgba(255,163,102,0.35)",
    transform: [{ scale: 1.06 }],
  },
  skipButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: "#FF8C42",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  skipLabel: {
    fontSize: 18,
    color: "#000",
    fontWeight: "800",
  },
  skipArrow: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "900",
    color: "#000",
  },
});
