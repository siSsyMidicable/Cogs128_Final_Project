/**
 * TunnelQR.tsx
 *
 * Shows a live QR code for the current Expo tunnel URL.
 * Polls GitHub raw content every 30 seconds so the QR updates
 * automatically after you run scripts/update-tunnel.sh.
 *
 * Install dep once (react-native-svg is already in the project):
 *   npx expo install react-native-qrcode-svg
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const RAW_URL =
  'https://raw.githubusercontent.com/siSsyMidicable/Cogs128_Final_Project/main/tunnel-url.json';

const POLL_MS = 30_000; // 30 seconds

interface TunnelData {
  url: string;
  updated: string;
}

function formatUpdated(iso: string): string {
  if (iso === 'never') return 'never updated';
  try {
    const d = new Date(iso);
    return (
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      '  ' +
      d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    );
  } catch {
    return iso;
  }
}

export function TunnelQR() {
  const [data, setData]       = useState<TunnelData | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchURL = useCallback(async () => {
    try {
      // cache-bust so GitHub CDN always returns the latest commit
      const res = await fetch(`${RAW_URL}?_=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: TunnelData = await res.json();
      setData(json);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // initial fetch + polling interval
  useEffect(() => {
    fetchURL();
    const id = setInterval(fetchURL, POLL_MS);
    return () => clearInterval(id);
  }, [fetchURL]);

  const isPlaceholder = data?.url === 'https://placeholder.example.com';

  return (
    <View style={s.card}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Live Tunnel QR</Text>
        <Pressable onPress={fetchURL} style={s.refreshBtn}
          accessibilityLabel="Refresh QR code">
          <Text style={s.refreshText}>↺ Refresh</Text>
        </Pressable>
      </View>

      {/* Body */}
      {loading ? (
        <ActivityIndicator color="#61d8cc" style={{ marginVertical: 32 }} />
      ) : error ? (
        <View style={s.centerBox}>
          <Text style={s.errorText}>Could not fetch URL</Text>
          <Text style={s.mutedText}>{error}</Text>
        </View>
      ) : isPlaceholder ? (
        <View style={s.centerBox}>
          <Text style={s.mutedText}>No tunnel set yet.</Text>
          <Text style={s.mutedText}>
            Run scripts/update-tunnel.sh to populate this QR.
          </Text>
        </View>
      ) : (
        <View style={s.qrWrap}>
          <QRCode
            value={data!.url}
            size={180}
            color="#101414"
            backgroundColor="#f3f4f1"
            quietZone={10}
          />
        </View>
      )}

      {/* Footer — URL + timestamp */}
      {data && !isPlaceholder && (
        <>
          <Text style={s.urlText} numberOfLines={2}>{data.url}</Text>
          <Text style={s.updatedText}>
            Updated {formatUpdated(data.updated)} · auto-refreshes every 30 s
          </Text>
        </>
      )}

    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f3f4f1',
    borderWidth: 2,
    borderColor: '#2f3333',
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: '#101414',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  refreshBtn: {
    backgroundColor: '#2f3333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#61d8cc',
  },
  qrWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  centerBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF767A',
  },
  mutedText: {
    fontSize: 12,
    color: '#607876',
    textAlign: 'center',
    lineHeight: 18,
  },
  urlText: {
    fontSize: 11,
    color: '#394140',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'monospace',
  },
  updatedText: {
    fontSize: 10,
    color: '#9ab5b2',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
});
