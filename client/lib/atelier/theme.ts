/**
 * Atelier — design tokens for the SkillSwap “workshop” exploration.
 * Grounded in visibility of state (Norman) and scannable hierarchy (IxD).
 */
export const Atelier = {
  // Warm paper & ink — high legibility, low glare
  canvas: '#EDE8DF',
  paper: '#FFFCF7',
  paperMuted: '#F5F0E8',
  ink: '#1C1917',
  inkSecondary: '#57534E',
  inkTertiary: '#78716C',
  rule: '#D6D0C4',
  accent: '#B45309', // amber — action, warmth
  accentSoft: '#FEF3C7',
  success: '#3F6212',
  danger: '#B91C1C',
  sage: '#57665C',
  radiusLg: 20,
  radiusMd: 14,
  radiusSm: 10,
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  shadow: {
    card: {
      shadowColor: '#1C1917',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
  },
} as const;

export type AtelierTheme = typeof Atelier;
