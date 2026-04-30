/**
 * Seed users for SkillSwap matching demo.
 * Based on interview subjects from the COGS 128 research data.
 *
 * Three users (Alex, Maria, Daniel) have pre-seeded completed swaps so the
 * History screen is never empty on first load — the three proof scenarios show
 * the full fairness spectrum: perfect (F=1.0), late delivery (F=0.50),
 * and strong-but-no-evidence (F=0.85).
 *
 * The remaining three (Jasmine, Kevin, Lina) are available to interact with live.
 */

import type { MatchUser } from './matching';
import { completeSwap } from './matching';

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
  },
];

// ─── Demo history seed ────────────────────────────────────────────────────────
// Pre-populate 3 completed swaps so History shows real data immediately.
// Scenarios are chosen to demonstrate the full fairness spectrum:
//
//   Alex  — perfect swap (F=1.0):  on time, scope matched, evidence, would swap again
//   Maria — great swap (F=0.85):   on time, scope matched, would swap again (no evidence uploaded)
//   Daniel — late delivery (F=0.50): scope matched + would swap again, but late & no evidence

const [alex, maria, daniel] = MOCK_USERS;

completeSwap(
  alex, YOU,
  'Web Dev', 'Graphic Design',
  {
    deliveredOnTime:          true,
    scopeMatchedAgreement:    true,
    portfolioEvidenceAttached: true,
    wouldSwapAgain:           true,
    notes: 'Alex redesigned the landing page — clean work, delivered in 3 days.',
  },
  '2026-04-20T14:00:00.000Z',
);

completeSwap(
  maria, YOU,
  'Linux Admin', 'Photography',
  {
    deliveredOnTime:          true,
    scopeMatchedAgreement:    true,
    portfolioEvidenceAttached: false,
    wouldSwapAgain:           true,
    notes: 'Maria shot 40 edited photos. No portfolio link yet — she said she would upload later.',
  },
  '2026-04-15T10:30:00.000Z',
);

completeSwap(
  daniel, YOU,
  'Web Dev', 'Bookkeeping',
  {
    deliveredOnTime:          false,
    scopeMatchedAgreement:    true,
    portfolioEvidenceAttached: false,
    wouldSwapAgain:           true,
    notes: 'Bookkeeping was solid but Daniel ran 5 days late. Would swap again for the right project.',
  },
  '2026-04-10T09:00:00.000Z',
);
