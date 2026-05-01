# SkillSwap Icon System

Custom SVG icon set for the SkillSwap barter app. Every icon is a React Native component using `react-native-svg`.

## Design Philosophy

- **24px base grid** — all icons designed and tested at 24×24dp
- **1.75px stroke** — consistent optical weight across the family
- **Stroke-based by default** — fills only appear in `filled={true}` (active/selected state)
- **No decorative metaphors** — every shape maps directly to its function (Norman signifier principle)
- **No money, wallet, or checkout metaphors** — this is barter, not payment

## Usage

```tsx
import { SwapIcon, HistoryIcon, FairnessMeterIcon } from '@/components/icons';

// Default (stroke only)
<SwapIcon size={24} color="#28251d" />

// Active state (filled)
<SaveSkillIcon size={24} color="#01696f" filled={true} />

// Custom size
<VerifiedIcon size={16} color="#01696f" />
```

## Icon Map

| Icon | Component | Where it lives |
|---|---|---|
| Barter History | `HistoryIcon` | Profile 'Trades' tab, History screen |
| Fairness Meter | `FairnessMeterIcon` | Trade proposal composer, negotiation thread |
| Save Skill | `SaveSkillIcon` | Listing cards, skill detail screen |
| Chat & Negotiate | `NegotiateIcon` | Negotiation screen, match card actions |
| Reputation Badges | `ReputationBadgeIcon` | Profile header, listing card metadata |
| Verification | `VerifiedIcon` | Username row, profile, reviews |
| Dispute Resolution | `DisputeIcon` | Trade detail screen only |
| Privacy Toggle | `PrivacyToggleIcon` | Settings, profile visibility editor |
| Terms of Trade | `TermsIcon` | Proposal confirmation step |
| Notifications | `NotificationsIcon` | Top-level inbox/center |
| Dark Mode | `DarkModeIcon` | App-wide settings |
| High Contrast | `HighContrastIcon` | Accessibility settings |
| One-Handed Mode | `OneHandedIcon` | Layout preference, bottom sheets |
| Transparency Review | `TransparencyReviewIcon` | Post-trade flow, history cards |
| Testimonials | `TestimonialsIcon` | Profile detail sections |
| Community Guidelines | `CommunityIcon` | Onboarding, reporting, help |
| Home Feed | `HomeIcon` | Bottom tab bar |
| Explore | `ExploreIcon` | Browse/Explore tab |
| Profile Hub | `ProfileIcon` | Profile tab, match cards |
| Limited-Time Offer | `LimitedOfferIcon` | Listing tags only (never nav) |
| Skill Swap CTA | `SwapIcon` | Trade CTA button, Match Hub cards |

## Not Implemented (per spec)

- `PremiumMembershipIcon` — Deferred. Monetization before trust maturity weakens the product.
- `PromotedListingsIcon` — Deferred. Paid ranking conflicts with fairness in early barter marketplace.
- `VoiceCommandIcon` — Later. Not core to barter success in v1.
