// CommunityIcon — Three nodes in a loose network with a rule sheet centerline.
// Signals norms + community governance, not punishment or rules-as-barrier.
// Lives: Onboarding, reporting flows, help
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { IconProps } from './types';

export function CommunityIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Central node */}
      <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth={strokeWidth} />
      {/* Left person node */}
      <Circle cx="5" cy="8" r="2" stroke={color} strokeWidth={strokeWidth} />
      {/* Right person node */}
      <Circle cx="19" cy="8" r="2" stroke={color} strokeWidth={strokeWidth} />
      {/* Bottom person node */}
      <Circle cx="12" cy="19" r="1.5" stroke={color} strokeWidth={strokeWidth} />
      {/* Network connectors */}
      <Path d="M7 9l3 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M17 9l-3 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 14v3.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Guideline mark on center */}
      <Path d="M10.5 12h3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
