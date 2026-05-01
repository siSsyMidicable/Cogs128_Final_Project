// NegotiateIcon — Chat & Negotiate.
// Two speech frames intersecting with a proposal arrow — dialogue + structured exchange.
// NOT generic chat bubbles. The arrow inside signals intent to propose.
// Lives: Dedicated negotiation screen, match card actions
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

export function NegotiateIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Left speech frame */}
      <Path
        d="M3 6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7l-4 3V6z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Right speech frame — overlapping, offset upward */}
      <Path
        d="M14 9h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2l-3 2.5V10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Proposal arrow inside left frame */}
      <Path
        d="M6 9h5M9 7.5l1.5 1.5L9 10.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
