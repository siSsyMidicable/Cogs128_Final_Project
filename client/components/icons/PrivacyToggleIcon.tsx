// PrivacyToggleIcon — Aperture iris with shield gate.
// Action = controlling visibility, not simply hiding.
// Better than plain eye-off: user is MANAGING exposure, not going dark.
// Lives: Settings, profile visibility editor
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { IconProps } from './types';

export function PrivacyToggleIcon({ size = 24, color = '#28251d', strokeWidth = 1.75, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Shield outer */}
      <Path
        d="M12 2L4 6v6c0 5 4 9 8 10 4-1 8-5 8-10V6L12 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
      {/* Aperture iris blades — three lines suggesting controlled opening */}
      <Path d="M9 12l2 2 4-4" stroke={filled ? '#fff' : color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
