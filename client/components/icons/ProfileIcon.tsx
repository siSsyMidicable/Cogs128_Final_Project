// ProfileIcon — Frontal user frame plus two modular evidence panels.
// Identity + contributed skills/history — not just a blank person silhouette.
// Lives: Profile Hub tab, match cards
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { IconProps } from './types';

export function ProfileIcon({ size = 24, color = '#28251d', strokeWidth = 1.75, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Head */}
      <Circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth={strokeWidth} fill={filled ? color : 'none'} />
      {/* Shoulders */}
      <Path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      {/* Skill panel lines — the 'hub' quality */}
      <Path d="M14 8h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity="0.4" />
      <Path d="M14 10.5h3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}
