// DarkModeIcon — Half-disc eclipse. Clean, minimal, immediate recognition.
// No trendy celestial flourish, no gradient moon. Just half light, half dark.
// Lives: App-wide settings, system sync toggle
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

export function DarkModeIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Eclipse: circle with filled left half */}
      <Path
        d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Left half filled — dark side */}
      <Path
        d="M12 3a9 9 0 0 0 0 18V3z"
        fill={color}
      />
    </Svg>
  );
}
