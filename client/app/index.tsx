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

const CARDS = [
  {
    id: "1",
    title: "What's Inside",
    description: "Connect with others to exchange skills and knowledge",
    tilt: "-1deg",
  },
  {
    id: "2",
    title: "Trust & Transparency",
    description: "Built on honest matching algorithms",
    tilt: "1deg",
  },
  {
    id: "3",
    title: "Discrete Mathematics",
    description: "Ensures fair and verified skill matches",
    tilt: "-0.8deg",
  },
];

function IntroCard({
  title,
  description,
  tilt,
}: {
  title: string;
  description: string;
  tilt: string;
}) {
  return (
    <View style={[styles.cardWrapper, { width: CARD_WIDTH }]}>
      <View style={styles.cardPerspective}>
        <View style={[styles.cardGlow, styles.cardGlowOne]} />
        <View style={[styles.cardGlow, styles.cardGlowTwo]} />
        <View style={[styles.infoCard, { transform: [{ rotate: tilt }] }]}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>
    </View>
  );
}

function DotIndicators({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
        />
      ))}
    </View>
  );
}

export default function IntroScreen() {
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

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

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
          <View style={styles.carouselSection}>
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
                <IntroCard
                  title={item.title}
                  description={item.description}
                  tilt={item.tilt}
                />
              )}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
            />

            <DotIndicators count={CARDS.length} activeIndex={activeIndex} />
          </View>

          {/* Skip Button */}
          <Pressable
            onPress={() => router.replace("/auth/login")}
            style={({ pressed }) => [
              styles.skipButtonContainer,
              pressed && styles.skipButtonPressed,
            ]}
          >
            <View style={[styles.skipGlow, styles.skipGlowA]} />
            <View style={[styles.skipGlow, styles.skipGlowB]} />
            <View style={[styles.skipGlow, styles.skipGlowC]} />
            <View style={styles.skipButton}>
              <Text style={styles.skipLabel}>Skip Intro</Text>
              <Text style={styles.skipArrow}>›</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
    marginBottom: 32,
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
    marginBottom: 28,
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
    marginTop: 16,
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

  // Skip button
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
