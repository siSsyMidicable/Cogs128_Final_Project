// HighContrastIcon — Split black/white tile with emphasized edge.
// Better than generic sun icon — directly signals LEGIBILITY, not brightness.
// Lives: Accessibility settings
import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import type { IconProps } from './types';

export function HighContrastIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer circle */}
      <Path
        d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Right half filled — the high-contrast side */}
      <Path d="M12 3v18a9 9 0 0 0 0-18z" fill={color} />
      {/* Dividing edge — the key signifier for contrast boundary */}
      <Path d="M12 3v18" stroke={color} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
    </Svg>
  );
}
