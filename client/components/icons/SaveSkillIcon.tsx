// SaveSkillIcon — Bookmark ribbon, not a heart.
// Heart = affection. Bookmark = 'I'll return to compare this later' — lower commitment,
// which your CSV explicitly calls out as the design goal.
// Lives: Listing cards, skill detail screen
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './types';

export function SaveSkillIcon({ size = 24, color = '#28251d', strokeWidth = 1.75, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}
