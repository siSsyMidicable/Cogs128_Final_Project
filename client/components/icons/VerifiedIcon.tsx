// VerifiedIcon — Verification checkmark in a diamond/square enclosure.
// Feels administrative and evidentiary — NOT social-media prestige.
// Lives: Username row, profile card, review metadata
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

export function VerifiedIcon({ size = 24, color = '#28251d', strokeWidth = 1.75, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Diamond enclosure — rotated square signals 'official stamp' */}
      <Path
        d="M12 2L22 12 12 22 2 12 12 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
      {/* Checkmark */}
      <Path
        d="M8.5 12l2.5 2.5 4.5-4.5"
        stroke={filled ? '#fff' : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
