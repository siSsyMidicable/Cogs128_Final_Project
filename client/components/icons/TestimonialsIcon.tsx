// TestimonialsIcon — Quotation panel with verified marker.
// Signals narrative evidence without equating it to hard verification.
// Lives: Profile detail sections (compact, not dominant)
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { IconProps } from './types';

export function TestimonialsIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Speech frame */}
      <Path
        d="M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7l-4 3V5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Opening quote */}
      <Path d="M7 8v3c0 .5.5 1 1 1h1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {/* Second quote mark */}
      <Path d="M11 8v3c0 .5.5 1 1 1h1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {/* Verified dot — testimony is marked, not just stated */}
      <Circle cx="17" cy="9" r="1" fill={color} />
    </Svg>
  );
}
