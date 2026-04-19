import React from 'react';
import { View, Text } from 'react-native';

export const TextWithIcon = ({ text, icon }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    {icon}
    <Text style={{ marginLeft: 8 }}>{text}</Text>
  </View>
);
