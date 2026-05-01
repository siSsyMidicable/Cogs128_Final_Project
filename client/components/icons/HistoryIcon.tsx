// HistoryIcon — Barter history / trades ledger.
// A vertical timeline with two offset exchange nodes — shows time + bilateral record.
// Lives: Profile 'Trades' tab, History screen
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { IconProps } from './types';

export function HistoryIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Vertical spine */}
      <Path d="M12 3v18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* First exchange node — left */}
      <Circle cx="8" cy="8" r="2" stroke={color} strokeWidth={strokeWidth} />
      {/* Connector to spine */}
      <Path d="M10 8h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Second exchange node — right */}
      <Circle cx="16" cy="14" r="2" stroke={color} strokeWidth={strokeWidth} />
      {/* Connector to spine */}
      <Path d="M12 14h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Time cap — top dot */}
      <Circle cx="12" cy="3" r="1" fill={color} />
      {/* Time cap — bottom dot */}
      <Circle cx="12" cy="21" r="1" fill={color} />
    </Svg>
  );
}
