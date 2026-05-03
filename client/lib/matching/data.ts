/**
 * Seed users for SkillSwap matching demo.
 *
 * Pre-seeded state:
 *   completed:  Alex (F=1.0), Maria (F=0.85), Daniel (F=0.50)
 *   connected:  Jasmine, Kevin  \u2190 live active swaps in Ongoing screen
 *   requested:  Lina             \u2190 incoming request waiting for acceptance
 */

import type { MatchUser } from './matching';
import { completeSwap, sendRequest, confirmConnect } from './matching';

export const YOU: MatchUser = {
  id: 'you',
  name: 'You',
  avatar: '\ud83e\uddd1\u200d\ud83d\udcbb',
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
    avatar: '\ud83c\udfa8',
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
    avatar: '\ud83d\udcf7',
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
    avatar: '\ud83d\udcca',
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
    avatar: '\ud83d\udc84',
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
    avatar: '\ud83d\udd27',
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
    avatar: '\ud83e\udd57',
    offers:   ['Meal Prep', 'Nutrition Advice', 'Cooking Classes'],
    requests: ['Linux Admin', 'Photography'],
    portfolio:     0.75,
    rating:        4.3,
    verified:      2,
    consistency:   0.88,
    communication: 0.92,
  },
];

const [alex, maria, daniel, jasmine, kevin, lina] = MOCK_USERS;

// \u2500\u2500\u2500 Completed swaps (history seed) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

completeSwap(
  alex, YOU,
  'Web Dev', 'Graphic Design',
  { deliveredOnTime: true, scopeMatchedAgreement: true,
    portfolioEvidenceAttached: true, wouldSwapAgain: true,
    notes: 'Alex redesigned the landing page \u2014 clean work, delivered in 3 days.' },
  '2026-04-20T14:00:00.000Z',
  5,
  'Alex was fantastic. Fast, clean, and exactly what I asked for.',
);

completeSwap(
  maria, YOU,
  'Linux Admin', 'Photography',
  { deliveredOnTime: true, scopeMatchedAgreement: true,
    portfolioEvidenceAttached: false, wouldSwapAgain: true,
    notes: 'Maria shot 40 edited photos. No portfolio link yet \u2014 she said she would upload later.' },
  '2026-04-15T10:30:00.000Z',
  4,
  'Great photos, super professional. Just waiting on the portfolio link.',
);

completeSwap(
  daniel, YOU,
  'Web Dev', 'Bookkeeping',
  { deliveredOnTime: false, scopeMatchedAgreement: true,
    portfolioEvidenceAttached: false, wouldSwapAgain: true,
    notes: 'Bookkeeping was solid but Daniel ran 5 days late.' },
  '2026-04-10T09:00:00.000Z',
  3,
  'Good work overall, but the late delivery was frustrating.',
);

// \u2500\u2500\u2500 Live active swaps (Ongoing screen seed) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Jasmine and Kevin are already connected \u2014 their swaps are in-progress.

confirmConnect(jasmine.id);
confirmConnect(kevin.id);

// \u2500\u2500\u2500 Incoming request (Incoming screen seed) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Lina sent YOU a request \u2014 waiting in the Incoming screen.

sendRequest(lina.id);

// \u2500\u2500\u2500 Active swap metadata \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Scope + deadline for each live connection so Ongoing screen feels real.

export type ActiveSwapMeta = {
  userId: string;
  youGive: string;
  theyGive: string;
  agreedScope: string;
  deadlineIso: string;
  checkIns: { date: string; note: string; fromMe: boolean }[];
};

export const ACTIVE_SWAPS: ActiveSwapMeta[] = [
  {
    userId: 'jasmine',
    youGive: 'Web Dev',
    theyGive: 'Event Styling',
    agreedScope:
      'Build a 3-page portfolio site (Home, Gallery, Contact). Mobile-first. Deliver by May 10.',
    deadlineIso: '2026-05-10T23:59:00.000Z',
    checkIns: [
      { date: '2026-04-28T09:00:00.000Z', note: 'Wireframes sent for review \u2014 waiting on feedback.', fromMe: true },
      { date: '2026-04-29T11:30:00.000Z', note: 'Love the layout! Can we swap the gallery to a grid?', fromMe: false },
      { date: '2026-04-30T15:00:00.000Z', note: 'Grid done. Pushing final build tomorrow.', fromMe: true },
    ],
  },
  {
    userId: 'kevin',
    youGive: 'Linux Admin',
    theyGive: 'Car Detailing (full exterior + interior)',
    agreedScope:
      'Set up home server with Tailscale remote access + automated backups. Deliver by May 7.',
    deadlineIso: '2026-05-07T23:59:00.000Z',
    checkIns: [
      { date: '2026-04-27T14:00:00.000Z', note: 'SSH keys exchanged. Starting Tailscale config tonight.', fromMe: true },
      { date: '2026-04-28T18:00:00.000Z', note: 'Remote access works! When can I drop off the car?', fromMe: false },
    ],
  },
];
