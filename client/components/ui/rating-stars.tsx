import React from 'react';
import { Text } from 'react-native';

export const RatingStars = ({ rating = 0 }: any) => <Text>{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</Text>;
