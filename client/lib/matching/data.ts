/**
 * Seed users for SkillSwap matching demo.
 * Based on interview subjects from the COGS 128 research data.
 *
 * Each user has:
 *   O(u) = offers   (skills they can provide)
 *   R(u) = requests (skills they want to receive)
 *   + trust score components: portfolio, rating, verified, consistency, communication
 */

import type { MatchUser } from './matching';

/**
 * YOU — the currently logged-in user's profile.
 * In a real app this would come from the auth/profile API.
 * Skills chosen to create meaningful overlaps with seed users below.
 */
export const YOU: MatchUser = {
  id: 'you',
  name: 'You',
  avatar: '🧑‍💻',
  offers:   ['Web Dev', 'Linux Admin'],
  requests: ['Graphic Design', 'Photography'],
  portfolio:     0.80,
  rating:        4.0,
  verified:      2,
  consistency:   0.85,
  communication: 0.90,
};

/**
 * Seed pool — 6 users drawn from PDF interview subjects.
 * Skills are normalized strings so intersection math works correctly.
 */
export const MOCK_USERS: MatchUser[] = [
  {
    id: 'alex',
    name: 'Alex',
    avatar: '🎨',
    offers:   ['Graphic Design', 'Logo Creation', 'Illustration'],
    requests: ['Web Dev', 'Resume Help'],
    portfolio:     0.70,
    rating:        4.2,
    verified:      2,
    consistency:   0.80,
    communication: 0.90,
    // SF(you, Alex): you offer Web Dev → Alex needs Web Dev  ✓ (1/2 of their needs)
    //                Alex offers Graphic Design → you need it  ✓ (1/2 of your needs)
    // High SkillFit expected
  },
  {
    id: 'maria',
    name: 'Maria',
    avatar: '📷',
    offers:   ['Photography', 'Social Media', 'Video Editing'],
    requests: ['Linux Admin', 'Computer Repair'],
    portfolio:     0.90,
    rating:        4.8,
    verified:      2,
    consistency:   0.95,
    communication: 0.85,
    // SF: Maria offers Photography (you need it) + you offer Linux Admin (Maria needs it)
    // Very high SkillFit AND high Trust → top match
  },
  {
    id: 'daniel',
    name: 'Daniel',
    avatar: '📊',
    offers:   ['Bookkeeping', 'Tax Help', 'Spreadsheets'],
    requests: ['Web Dev', 'Graphic Design'],
    portfolio:     0.60,
    rating:        3.9,
    verified:      1,
    consistency:   0.70,
    communication: 0.75,
    // SF: you offer Web Dev (Daniel needs it) but Daniel offers nothing you need
    // Medium SkillFit (one-sided), lower trust score
  },
  {
    id: 'jasmine',
    name: 'Jasmine',
    avatar: '💄',
    offers:   ['Makeup', 'Styling', 'Event Coordination'],
    requests: ['Photography', 'Web Dev'],
    portfolio:     0.85,
    rating:        4.5,
    verified:      1,
    consistency:   0.90,
    communication: 0.95,
    // SF: you offer Web Dev (Jasmine needs it) but Jasmine offers nothing you need
    // Good trust but weaker fit (no overlap on your requests)
  },
  {
    id: 'kevin',
    name: 'Kevin',
    avatar: '🔧',
    offers:   ['Car Detailing', 'Mechanic', 'Welding'],
    requests: ['Bookkeeping', 'Tax Help'],
    portfolio:     0.55,
    rating:        3.7,
    verified:      1,
    consistency:   0.65,
    communication: 0.70,
    // SF: no overlap with your offers or requests
    // Low SkillFit AND lower trust → bottom of ranking
  },
  {
    id: 'lina',
    name: 'Lina',
    avatar: '🥗',
    offers:   ['Meal Prep', 'Nutrition Advice', 'Cooking Classes'],
    requests: ['Linux Admin', 'Photography'],
    portfolio:     0.75,
    rating:        4.3,
    verified:      2,
    consistency:   0.88,
    communication: 0.92,
    // SF: you offer Linux Admin (Lina needs it) but Lina offers nothing you need
    // Good trust, partial fit (one-sided)
  },
];
