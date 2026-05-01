// HomeIcon — Structured grid with one highlighted recommendation cell.
// Personalized dashboard — not just a house silhouette.
// Lives: Bottom tab bar, Home Feed screen
import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import type { IconProps } from './types';

export function HomeIcon({ size = 24, color = '#28251d', strokeWidth = 1.75, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Roof */}
      <Path
        d="M3 11L12 3l9 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* House body */}
      <Path
        d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
      {/* Personalized highlight cell — one recommended card */}
      <Rect
        x="9"
        y="14"
        width="6"
        height="6"
        rx="0.5"
        stroke={color}
        strokeWidth={strokeWidth}
        fill={filled ? '#fff' : 'none'}
        opacity={filled ? 0.3 : 1}
      />
    </Svg>
  );
}
