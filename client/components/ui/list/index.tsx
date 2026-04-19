import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export const AppList = ({ data = [], renderItem, keyExtractor }: any) => {
  if (!renderItem) {
    return (
      <View style={styles.empty}>
        <Text>No items</Text>
      </View>
    );
  }
  return (
    <FlatList data={data} renderItem={renderItem} keyExtractor={keyExtractor || ((item, i) => String(i))} />
  );
};

const styles = StyleSheet.create({
  empty: { padding: 16, alignItems: 'center' },
});
