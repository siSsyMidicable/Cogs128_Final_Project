// NotificationsIcon — Bell with stacked signal bars.
// Your CSV frames this as an INFORMATION CENTER, not random pings.
// The signal bars suggest priority hierarchy — not all alerts are equal.
// Lives: Top-level inbox/center
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

export function NotificationsIcon({ size = 24, color = '#28251d', strokeWidth = 1.75, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bell body */}
      <Path
        d="M6 10a6 6 0 0 1 12 0v4l2 2H4l2-2v-4z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
      {/* Clapper */}
      <Path
        d="M10 18a2 2 0 0 0 4 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Priority signal dot — top right */}
      <Path
        d="M17 6a1 1 0 1 0 2 0 1 1 0 0 0-2 0"
        fill={color}
      />
    </Svg>
  );
}
