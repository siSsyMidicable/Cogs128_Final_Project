/**
 * /transaction/ongoing
 * Active swaps — Jasmine and Kevin are already connected.
 * Each card has an interactive check-in panel: view log + send a new message.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Pressable, StatusBar, TextInput, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { MOCK_USERS, ACTIVE_SWAPS, type ActiveSwapMeta } from '@/lib/matching/data';
import { getMatchingState } from '@/lib/matching/matching';

const C = {
  bg: '#7DE5E5', bgDeep: '#8FEBE5',
  glass: 'rgba(255,255,255,0.55)', glassBorder: 'rgba(255,255,255,0.45)',
  glowOne: 'rgba(255,255,255,0.22)', glowTwo: 'rgba(255,255,255,0.15)',
  black: '#000', blackMid: 'rgba(0,0,0,0.78)', blackSoft: 'rgba(0,0,0,0.55)',
  teal: '#61d8cc', tealDark: '#2a8780',
  orange: '#FF8C42', shadow: '#000',
};

function Island({ children }: { children: React.ReactNode }) {
  return (
    <View style={isl.outer}>
      <View style={isl.glowOne} />
      <View style={isl.glowTwo} />
      <View style={isl.inner}>{children}</View>
    </View>
  );
}
const isl = StyleSheet.create({
  outer:   { paddingVertical: 14, overflow: 'visible' },
  glowOne: { position: 'absolute', left: 0, right: 0, top: 14, bottom: 14, borderRadius: 14, backgroundColor: C.glowOne, transform: [{ scale: 1.07 }] },
  glowTwo: { position: 'absolute', left: 0, right: 0, top: 14, bottom: 14, borderRadius: 14, backgroundColor: C.glowTwo, transform: [{ scale: 1.12 }] },
  inner:   { borderRadius: 12, padding: 16, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder, shadowColor: C.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 14, elevation: 8 },
});

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 19l-7-7 7-7" stroke={C.black} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function daysLeft(isoDate: string) {
  const ms = new Date(isoDate).getTime() - Date.now();
  const d  = Math.ceil(ms / 86_400_000);
  if (d < 0)   return { label: `${Math.abs(d)}d overdue`, color: '#EF767A' };
  if (d === 0) return { label: 'Due today!',              color: C.orange };
  return         { label: `${d}d left`,                   color: d <= 3 ? C.orange : C.teal };
}

// ─── Per-card in-memory check-in log ─────────────────────────────────────────────────
// Seeded from ACTIVE_SWAPS. New messages appended by user input.
type CheckIn = { date: string; note: string; fromMe: boolean };

function CheckInPanel({
  userId, meta,
}: {
  userId: string;
  meta: ActiveSwapMeta;
}) {
  const [log, setLog]   = useState<CheckIn[]>(meta.checkIns);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const scrollRef       = React.useRef<ScrollView>(null);

  function send() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLog(prev => [
      ...prev,
      { date: new Date().toISOString(), note: trimmed, fromMe: true },
    ]);
    setText('');
    // Scroll to bottom after state updates
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }

  const lastNote = log[log.length - 1];

  return (
    <View style={ci.wrapper}>
      {/* Toggle button */}
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={({ pressed }) => [ci.toggle, pressed && { opacity: 0.75 }]}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Hide check-ins' : 'Show check-ins'}
      >
        <Text style={ci.toggleText}>
          {open ? '▲ Hide check-ins' : `▼ ${log.length} check-in${log.length !== 1 ? 's' : ''}`}
        </Text>
        {!open && lastNote && (
          <Text style={ci.lastPreview} numberOfLines={1}>
            “{lastNote.note}”
          </Text>
        )}
      </Pressable>

      {open && (
        <View style={ci.panel}>
          {/* Message log */}
          <ScrollView
            ref={scrollRef}
            style={ci.log}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {log.map((ci_item, i) => (
              <View
                key={i}
                style={[
                  ci.bubble,
                  ci_item.fromMe ? ci.bubbleMe : ci.bubbleThem,
                ]}
              >
                <Text style={ci.bubbleDate}>
                  {ci_item.fromMe ? 'You' : meta.theyGive.split(' ')[0]}
                  {' · '}
                  {new Date(ci_item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {new Date(ci_item.date).getTime() > Date.now() - 86_400_000 * 1
                    ? ' · ' + new Date(ci_item.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                    : ''}
                </Text>
                <Text style={ci.bubbleText}>{ci_item.note}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Input row */}
          <View style={ci.inputRow}>
            <TextInput
              style={ci.input}
              value={text}
              onChangeText={setText}
              placeholder="Send a check-in message…"
              placeholderTextColor="rgba(0,0,0,0.35)"
              multiline
              returnKeyType="send"
              onSubmitEditing={send}
              blurOnSubmit
              accessibilityLabel="Check-in message input"
            />
            <Pressable
              onPress={send}
              style={({ pressed }) => [
                ci.sendBtn,
                !text.trim() && ci.sendBtnOff,
                pressed && text.trim() && { opacity: 0.75 },
              ]}
              disabled={!text.trim()}
              accessibilityRole="button"
              accessibilityLabel="Send"
            >
              <Text style={[ci.sendTxt, !text.trim() && ci.sendTxtOff]}>↑</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const ci = StyleSheet.create({
  wrapper:      { marginTop: 4 },
  toggle:       {
    alignSelf: 'flex-start', borderRadius: 8,
    paddingVertical: 7, paddingHorizontal: 12,
    backgroundColor: 'rgba(97,216,204,0.2)',
    borderWidth: 1, borderColor: C.teal,
    gap: 2,
  },
  toggleText:   { fontSize: 12, fontWeight: '700', color: C.tealDark },
  lastPreview:  { fontSize: 11, color: C.blackSoft, maxWidth: 220, fontStyle: 'italic' },
  panel:        {
    marginTop: 10, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1, borderColor: C.glassBorder,
    overflow: 'hidden',
  },
  log:          { maxHeight: 220, paddingHorizontal: 10, paddingTop: 10 },
  bubble:       { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, maxWidth: '88%' },
  bubbleMe:     { backgroundColor: 'rgba(42,135,128,0.15)', alignSelf: 'flex-end' },
  bubbleThem:   { backgroundColor: 'rgba(0,0,0,0.06)',     alignSelf: 'flex-start' },
  bubbleDate:   { fontSize: 10, color: C.blackSoft, marginBottom: 3, fontWeight: '600' },
  bubbleText:   { fontSize: 13, color: C.blackMid, lineHeight: 18 },
  inputRow:     {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 10, paddingVertical: 8,
    borderTopWidth: 1, borderColor: C.glassBorder, gap: 8,
  },
  input:        {
    flex: 1, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1, borderColor: C.glassBorder,
    paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 13, color: C.black,
    maxHeight: 80, minHeight: 36,
  },
  sendBtn:      {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.tealDark,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnOff:   { backgroundColor: 'rgba(0,0,0,0.1)' },
  sendTxt:      { fontSize: 18, color: '#fff', fontWeight: '900', lineHeight: 22 },
  sendTxtOff:   { color: 'rgba(0,0,0,0.3)' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function OngoingScreen() {
  const { connections } = getMatchingState();
  const active = MOCK_USERS
    .filter(u => connections.has(u.id))
    .map(u => ({
      user: u,
      meta: ACTIVE_SWAPS.find(m => m.userId === u.id),
    }));

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.bgLayer} />

      <View style={s.nav}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [s.backPill, pressed && { opacity: 0.75 }]} accessibilityLabel="Go back" accessibilityRole="button">
          <BackIcon />
          <Text style={s.backText}>Back</Text>
        </Pressable>
        <Text style={s.navTitle}>Ongoing</Text>
        <View style={{ width: 72 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {active.length === 0 ? (
            <Island>
              <View style={s.emptyState}>
                <Text style={s.emptyEmoji}>🔄</Text>
                <Text style={s.emptyTitle}>No active swaps</Text>
                <Text style={s.emptySub}>Accept an incoming request to start a swap.</Text>
              </View>
            </Island>
          ) : active.map(({ user, meta }) => {
            const dl = meta ? daysLeft(meta.deadlineIso) : null;
            return (
              <Island key={user.id}>
                {/* Header */}
                <View style={s.cardHeader}>
                  <View style={s.avatar}>
                    <Text style={s.avatarEmoji}>{user.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.userName}>{user.name}</Text>
                    {meta && <Text style={s.swapLine}>{meta.youGive} ⇄ {meta.theyGive}</Text>}
                  </View>
                  {dl && (
                    <View style={[s.deadlineBadge, { backgroundColor: dl.color + '22', borderColor: dl.color }]}>
                      <Text style={[s.deadlineText, { color: dl.color }]}>{dl.label}</Text>
                    </View>
                  )}
                </View>

                {/* Scope */}
                {meta && (
                  <View style={s.scopeBox}>
                    <Text style={s.scopeLabel}>AGREED SCOPE</Text>
                    <Text style={s.scopeText}>{meta.agreedScope}</Text>
                  </View>
                )}

                {/* Interactive check-in panel */}
                {meta && <CheckInPanel userId={user.id} meta={meta} />}
              </Island>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.bgDeep },
  bgLayer:       { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg },
  nav:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, zIndex: 2 },
  backPill:      { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: C.glass, borderWidth: 1, borderColor: C.glassBorder, shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 4 },
  backText:      { fontSize: 13, fontWeight: '700', color: C.black },
  navTitle:      { fontSize: 18, fontWeight: '800', color: C.black },
  scroll:        { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },
  emptyState:    { alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyEmoji:    { fontSize: 40 },
  emptyTitle:    { fontSize: 17, fontWeight: '800', color: C.black },
  emptySub:      { fontSize: 13, color: C.blackSoft, textAlign: 'center' },
  cardHeader:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar:        { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1.5, borderColor: C.glassBorder, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji:   { fontSize: 24 },
  userName:      { fontSize: 17, fontWeight: '800', color: C.black },
  swapLine:      { fontSize: 13, color: C.blackSoft, marginTop: 2 },
  deadlineBadge: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1 },
  deadlineText:  { fontSize: 12, fontWeight: '800' },
  scopeBox:      { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 10, marginBottom: 12 },
  scopeLabel:    { fontSize: 9, fontWeight: '800', color: C.blackSoft, letterSpacing: 1.2, marginBottom: 4 },
  scopeText:     { fontSize: 13, color: C.blackMid, lineHeight: 19 },
});
