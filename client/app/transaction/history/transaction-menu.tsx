import React from 'react';
import { View, Text } from 'react-native';

export const TransactionMenu = ({ item }: any) => (
  <View style={{ padding: 8 }}>
    <Text>History menu {item?.id || ''}</Text>
  </View>
);
