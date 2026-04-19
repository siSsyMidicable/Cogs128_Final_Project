import React from 'react';
import { View, Text } from 'react-native';

export const TransactionMenu = ({ item }: any) => (
  <View style={{ padding: 8 }}>
    <Text>Outgoing menu {item?.id || ''}</Text>
  </View>
);
