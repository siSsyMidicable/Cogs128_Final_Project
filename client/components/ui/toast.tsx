/**
 * Toast — lightweight feedback banner
 *
 * Three states: loading (spinner), success (✓), error (✗)
 * Auto-dismisses after `duration` ms (default 3000).
 * Uses module-level singleton so any screen can trigger it.
 *
 * Usage:
 *   import { toast } from '@/components/ui/toast';
 *   toast.loading('Sending swap request…');
 *   toast.success('Swap requested! You'll be notified when they respond.');
 *   toast.error('Request failed — please try again.');
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';

// ─── Singleton event bus ──────────────────────────────────────────────────────

type ToastType = 'loading' | 'success' | 'error' | 'info';

type ToastPayload = {
  type: ToastType;
  message: string;
  duration?: number; // ms, 0 = sticky
};

type Listener = (payload: ToastPayload | null) => void;

const _listeners = new Set<Listener>();

function _emit(payload: ToastPayload | null) {
  _listeners.forEach(fn => fn(payload));
}

export const toast = {
  loading: (message: string) => _emit({ type: 'loading', message, duration: 0 }),
  success: (message: string, duration = 3200) => _emit({ type: 'success', message, duration }),
  error:   (message: string, duration = 4000) => _emit({ type: 'error',   message, duration }),
  info:    (message: string, duration = 3000) => _emit({ type: 'info',    message, duration }),
  dismiss: () => _emit(null),
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ToastProvider() {
  const [payload, setPayload] = useState<ToastPayload | null>(null);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-16)).current;
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const listener: Listener = (p) => {
      // Clear any pending auto-dismiss
      if (timerRef.current) clearTimeout(timerRef.current);

      if (!p) {
        // dismiss
        Animated.parallel([
          Animated.timing(fadeAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: -16, duration: 200, useNativeDriver: true }),
        ]).start(() => setPayload(null));
        return;
      }

      setPayload(p);
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();

      // Auto-dismiss
      if (p.duration && p.duration > 0) {
        timerRef.current = setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 0, duration: 220, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -16, duration: 220, useNativeDriver: true }),
          ]).start(() => setPayload(null));
        }, p.duration);
      }
    };

    _listeners.add(listener);
    return () => {
      _listeners.delete(listener);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fadeAnim, slideAnim]);

  if (!payload) return null;

  const colors: Record<ToastType, { bg: string; border: string; text: string }> = {
    loading: { bg: '#1c2424', border: '#4f98a3', text: '#a8c5c2' },
    success: { bg: '#1a3028', border: '#61d8cc', text: '#61d8cc' },
    error:   { bg: '#2a1a1a', border: '#EF767A', text: '#EF767A' },
    info:    { bg: '#1c2424', border: '#FFD166', text: '#FFD166' },
  };

  const icons: Record<ToastType, string> = {
    loading: '⏳',
    success: '✓',
    error:   '✗',
    info:    'ℹ',
  };

  const c = colors[payload.type];

  return (
    <Animated.View
      style={[
        s.container,
        { backgroundColor: c.bg, borderColor: c.border },
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
      pointerEvents="none"
    >
      <Text style={[s.icon, { color: c.text }]}>{icons[payload.type]}</Text>
      <Text style={[s.message, { color: c.text }]} numberOfLines={3}>
        {payload.message}
      </Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 44,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  icon:    { fontSize: 16, fontWeight: '900', minWidth: 18, textAlign: 'center' },
  message: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 19 },
});