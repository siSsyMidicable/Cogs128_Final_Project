// FairnessMeterIcon — Balance beam with offset weights.
// NOT a classic justice scale (too legal). This is a precision instrument — dynamic balance.
// Lives: Trade proposal composer, negotiation thread
import React from 'react';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import type { IconProps } from './types';

export function FairnessMeterIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Fulcrum */}
      <Path d="M12 5v14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Beam */}
      <Path d="M5 9h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Left weight — slightly lower, heavier side */}
      <Circle cx="5" cy="13" r="2.5" stroke={color} strokeWidth={strokeWidth} />
      {/* Left weight drop line */}
      <Path d="M5 11v-2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Right weight — lighter, sits higher */}
      <Circle cx="19" cy="11" r="1.75" stroke={color} strokeWidth={strokeWidth} />
      {/* Right weight drop line */}
      <Path d="M19 9.25v-0.25" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Base */}
      <Path d="M9 19h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
