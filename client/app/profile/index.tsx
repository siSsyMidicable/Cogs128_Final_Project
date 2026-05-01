import React from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { Text } from "react-native-paper";
import Svg, { Path, Circle } from 'react-native-svg';

import { AppAvatar } from "@/components/ui/avatar";
import { Buttons } from "@/components/ui/button";
import { useConfirmationDialog } from "@/components/ui/dialog";
import { Remarks } from "@/features/remark/components/remarks";
import { MonthlyTransactionsChart } from "@/features/statistic/components/monthly-transactions-chart";
import { TrendingServicesChart } from "@/features/statistic/components/trending-services-chart";
import { useLogout, useUser } from "@/lib/auth/auth";

// ─── Inline icons for Profile screen ─────────────────────────────────────────

function ReputationBadgeIcon({ size = 16, color = '#4f98a3' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={6} stroke={color} strokeWidth={1.75} />
      <Path d="M9 7L7 2" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M15 7L17 2" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M7 2h10" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M9.5 13l1.5 1.5 3.5-3" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HistoryIcon({ size = 16, color = '#394140' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3v18" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Circle cx={8} cy={8} r={2} stroke={color} strokeWidth={1.75} />
      <Path d="M10 8h2" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Circle cx={16} cy={14} r={2} stroke={color} strokeWidth={1.75} />
      <Path d="M12 14h2" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Circle cx={12} cy={3} r={1} fill={color} />
      <Circle cx={12} cy={21} r={1} fill={color} />
    </Svg>
  );
}

function PrivacyToggleIcon({ size = 16, color = '#394140' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 6v6c0 5 4 9 8 10 4-1 8-5 8-10V6L12 2z" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function NotificationsIcon({ size = 16, color = '#394140' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10a6 6 0 0 1 12 0v4l2 2H4l2-2v-4z" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M10 18a2 2 0 0 0 4 0" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M17 6a1 1 0 1 0 2 0 1 1 0 0 0-2 0" fill={color} />
    </Svg>
  );
}

function TransparencyReviewIcon({ size = 16, color = '#394140' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3h10l3 3v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M15 3v3h3" stroke={color} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M8 9h5" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M8 12h7" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M8 15l1 1 2-2" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────

export const AuthProfile = () => {
  const userQuery = useUser();
  const user = userQuery.data;
  const logout = useLogout();

  const handleLogout = () => {
    useConfirmationDialog.getState().setConfirmationDialog({
      type: "warning",
      title: "Confirm logout?",
      confirmButtonFn: () => { logout.mutate(undefined); },
    });
  };

  if (userQuery.isLoading) return null;

  return (
    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

      {/* Avatar + name + reputation badge */}
      <View style={styles.avatar}>
        <AppAvatar uri={user?.avatar?.uri} name={user?.name} size={96} />
        <View style={styles.nameRow}>
          <Text variant="titleMedium">{user?.name}</Text>
          <ReputationBadgeIcon size={16} color="#4f98a3" />
        </View>
      </View>

      {/* Quick-access icon row — settings-level actions */}
      <View style={styles.iconRow}>
        <View style={styles.iconCell}>
          <HistoryIcon size={22} color="#394140" />
          <Text style={styles.iconLabel}>Trade History</Text>
        </View>
        <View style={styles.iconCell}>
          <NotificationsIcon size={22} color="#394140" />
          <Text style={styles.iconLabel}>Notifications</Text>
        </View>
        <View style={styles.iconCell}>
          <PrivacyToggleIcon size={22} color="#394140" />
          <Text style={styles.iconLabel}>Privacy</Text>
        </View>
        <View style={styles.iconCell}>
          <TransparencyReviewIcon size={22} color="#394140" />
          <Text style={styles.iconLabel}>Reviews</Text>
        </View>
      </View>

      <Remarks />

      <View style={styles.container}>
        <MonthlyTransactionsChart />
        <TrendingServicesChart />

        <Buttons
          vertical
          buttons={[
            {
              label: "Logout",
              mode: "contained",
              onPress: handleLogout,
              disabled: logout.isPending,
              loading: logout.isPending,
            },
          ]}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  avatar: {
    paddingVertical: 32,
    gap: 8,
    alignItems: "center",
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginBottom: 8,
  },
  iconCell: {
    alignItems: 'center',
    gap: 5,
  },
  iconLabel: {
    fontSize: 10,
    color: '#607876',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default function ProfileScreen() {
  return <AuthProfile />;
}
