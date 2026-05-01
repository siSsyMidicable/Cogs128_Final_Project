// TransparencyReviewIcon — Evidence sheet + speech line.
// This replaces naïve star rating. Structured proof over gamifiable scores.
// Based on your history/trust implementation: delivered on time, scope matched,
// portfolio evidence, would swap again. Trust = verifiable, not just felt.
// Lives: Post-trade completion flow, history cards
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

export function TransparencyReviewIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Evidence document */}
      <Path
        d="M5 3h10l3 3v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Page fold */}
      <Path d="M15 3v3h3" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      {/* Evidence lines — structured proof fields */}
      <Path d="M8 9h5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M8 12h7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Checkmark on evidence — verified proof */}
      <Path
        d="M8 15l1 1 2-2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Speech tail — the review/testimony component */}
      <Path
        d="M17 13l2 2v3h-3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
