import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";

function IntroCard({
  title,
  description,
  tiltStyle,
}: {
  title: string;
  description: string;
  tiltStyle: StyleProp<ViewStyle>;
}) {
  return (
    <View style={styles.cardPerspective}>
      <View style={[styles.cardGlow, styles.cardGlowOne]} />
      <View style={[styles.cardGlow, styles.cardGlowTwo]} />
      <View style={[styles.infoCard, tiltStyle]}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function IntroScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <View style={styles.gradientBackground} />
        <View style={styles.gridOverlay} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={[styles.heroGlow, styles.heroGlowOuter]} />
            <View style={[styles.heroGlow, styles.heroGlowInner]} />
            <Text style={styles.title}>Skill Barter</Text>
            <Text style={styles.subtitle}>Trade your skills, grow together</Text>
          </View>

          <View style={styles.cardsContainer}>
            <IntroCard
              title="What's Inside"
              description="Connect with others to exchange skills and knowledge"
              tiltStyle={styles.cardTiltA}
            />
            <IntroCard
              title="Trust & Transparency"
              description="Built on honest matching algorithms"
              tiltStyle={styles.cardTiltB}
            />
            <IntroCard
              title="Discrete Mathematics"
              description="Ensures fair and verified skill matches"
              tiltStyle={styles.cardTiltC}
            />
          </View>

          <Pressable
            onPress={() => router.replace("/auth/login")}
            style={({ pressed }) => [styles.skipButtonContainer, pressed && styles.skipButtonPressed]}
          >
            <View style={[styles.skipGlow, styles.skipGlowA]} />
            <View style={[styles.skipGlow, styles.skipGlowB]} />
            <View style={[styles.skipGlow, styles.skipGlowC]} />
            <View style={styles.skipButton}>
              <Text style={styles.skipLabel}>Skip Intro</Text>
              <Text style={styles.skipArrow}>›</Text>
            </View>
          </Pressable>
        </ScrollView>
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
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 28,
  },
  hero: {
    width: "100%",
    alignItems: "center",
    marginBottom: 28,
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
  cardsContainer: {
    width: "100%",
    maxWidth: 340,
    gap: 16,
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
  cardTiltA: {
    transform: [{ rotate: "-1deg" }],
  },
  cardTiltB: {
    transform: [{ rotate: "1deg" }],
  },
  cardTiltC: {
    transform: [{ rotate: "-0.8deg" }],
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
  skipButtonContainer: {
    marginTop: 28,
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
