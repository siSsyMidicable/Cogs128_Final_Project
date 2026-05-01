// ReputationBadgeIcon — Medal with an evidence tick inset.
// Trust should feel EARNED and INSPECTABLE, not gamified like a point system.
// Lives: Profile header, listing card metadata
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { IconProps } from './types';

export function ReputationBadgeIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Medal body */}
      <Circle cx="12" cy="13" r="6" stroke={color} strokeWidth={strokeWidth} />
      {/* Medal ribbon left */}
      <Path d="M9 7L7 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Medal ribbon right */}
      <Path d="M15 7L17 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Ribbon bar */}
      <Path d="M7 2h10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Inset evidence checkmark */}
      <Path
        d="M9.5 13l1.5 1.5 3.5-3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
