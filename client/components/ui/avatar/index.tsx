import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export const AppAvatar = ({ uri, size = 48 }: any) => <Image source={uri ? { uri } : undefined as any} style={{ width: size, height: size, borderRadius: size / 2 }} />;

export const AvatarWithName = ({ name, uri, size = 48 }: any) => (
  <View style={styles.row}>
    <AppAvatar uri={uri} size={size} />
    <Text style={styles.name}>{name}</Text>
  </View>
);

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 8 }, name: { marginLeft: 8 } });
