// LimitedOfferIcon — Small clock-tab tag.
// Visually SUBORDINATE by design. Your CSV explicitly warns urgency can
// distort barter fairness if overused — so this icon is designed compact and quiet.
// Lives: Listing tags only (never campaign banners, never global nav)
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { IconProps } from './types';

export function LimitedOfferIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Tag body */}
      <Path
        d="M3 7a1 1 0 0 1 1-1h11l4 5-4 5H4a1 1 0 0 1-1-1V7z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Clock face — inside the tag */}
      <Circle cx="9" cy="12" r="2.5" stroke={color} strokeWidth={strokeWidth} />
      {/* Clock hands */}
      <Path d="M9 10.5v1.5l1 1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
