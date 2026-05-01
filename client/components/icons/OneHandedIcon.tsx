// OneHandedIcon — Thumb-reach arc over compact phone frame.
// Direct mapping to ergonomic reach pattern — exactly what this mode addresses.
// Norman: natural mapping = immediate understanding.
// Lives: Layout preference, bottom-sheet actions
import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import type { IconProps } from './types';

export function OneHandedIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Phone frame — compact, bottom-weighted */}
      <Path
        d="M8 4h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Home bar */}
      <Path d="M10.5 18h3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Thumb reach arc — the ergonomic zone */}
      <Path
        d="M16 14a5 5 0 0 0-8-4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      {/* Thumb tip */}
      <Path
        d="M8 10l-1.5 1 1 1.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
