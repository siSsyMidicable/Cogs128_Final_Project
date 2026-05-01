// SwapIcon — Primary CTA: two interlocked offset arrows forming reciprocal exchange.
// Not a dollar sign. Not a transfer arrow. This is BARTER — bilateral, equal.
// Lives: Trade CTA button, Match Hub cards
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

export function SwapIcon({ size = 24, color = '#28251d', strokeWidth = 1.75, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Top arrow: left to right */}
      <Path
        d="M3 8h14M14 5l3 3-3 3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom arrow: right to left — the return leg of the barter */}
      <Path
        d="M21 16H7M10 13l-3 3 3 3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
