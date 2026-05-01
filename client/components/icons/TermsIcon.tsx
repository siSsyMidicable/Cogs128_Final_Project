// TermsIcon — Structured agreement sheet with two aligned, equal lines.
// Makes expectations explicit BEFORE commitment — Norman: constraints clarify action.
// Lives: Proposal confirmation step
import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import type { IconProps } from './types';

export function TermsIcon({ size = 24, color = '#28251d', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Document body */}
      <Path
        d="M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Two equal agreement lines — symmetry = fairness */}
      <Path d="M8 9h8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M8 13h8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Signature line — commitment */}
      <Path d="M8 17h5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Pen nib mark */}
      <Path d="M14 16.5l1.5 1-0.5 0.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
