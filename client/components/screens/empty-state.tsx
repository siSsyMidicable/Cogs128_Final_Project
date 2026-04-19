import React from 'react';
import { View, Text } from 'react-native';

export default function EmptyStateScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Empty state</Text>
    </View>
  );
}
