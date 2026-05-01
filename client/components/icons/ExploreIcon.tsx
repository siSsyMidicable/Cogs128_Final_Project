// ExploreIcon — Compass cross with a filter notch.
// Discovery + refinement — not just directional navigation.
// Lives: Explore/Browse tab
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { IconProps } from './types';

export function ExploreIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Compass circle */}
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      {/* Compass needle — N/S */}
      <Path
        d="M12 5l-2 5h4L12 5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill={color}
      />
      <Path
        d="M12 19l2-5H10l2 5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Center dot */}
      <Circle cx="12" cy="12" r="1" fill={color} />
    </Svg>
  );
}
