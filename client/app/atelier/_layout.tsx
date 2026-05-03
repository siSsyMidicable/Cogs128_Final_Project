import { Tabs } from 'expo-router';
import { Atelier } from '@/lib/atelier/theme';
import { Text, View, StyleSheet } from 'react-native';

export default function AtelierLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Atelier.accent,
        tabBarInactiveTintColor: Atelier.inkTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: Atelier.paper,
          borderTopColor: Atelier.rule,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={tabStyles.iconWrap}>
              <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>⌂</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: 'People',
          tabBarIcon: ({ focused }) => (
            <View style={tabStyles.iconWrap}>
              <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>◎</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ focused }) => (
            <View style={tabStyles.iconWrap}>
              <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>✉</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18, color: Atelier.inkTertiary },
  iconFocused: { color: Atelier.accent },
});
