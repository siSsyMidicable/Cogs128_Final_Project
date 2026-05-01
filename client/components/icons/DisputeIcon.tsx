// DisputeIcon — Split path / branching document with alert node.
// Signals intervention in an active exchange — not generic 'danger'.
// Lives: Trade detail screen ONLY (not global nav)
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { IconProps } from './types';

export function DisputeIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Document body */}
      <Path
        d="M6 2h9l3 3v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Page fold */}
      <Path d="M15 2v3h3" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      {/* Split/branch lines — the 'dispute' divergence */}
      <Path d="M9 10h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 10l-1 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M15 10l1 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Alert node */}
      <Circle cx="12" cy="15" r="1" fill={color} />
    </Svg>
  );
}
