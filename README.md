# SkillSwap — COGS 128 Final Project

A skill-based bartering app that matches people by what they can teach each other, not by money. Built for a project in Cognitive Engeineering at UC Merced to demonstrate how discrete mathematics, set intersections, weighted trust functions, and graph-theoretic matching, can power a real social application.

---

## What the App Does

SkillSwap removes currency from the equation entirely. Two users are a match if the skills one person offers overlap with what the other person needs, and vice versa. The app computes a **match score M(u, v)** for every pair of users and ranks them so you see your best potential swap partners first.

Every connection is backed by transparent math you can inspect in the app itself. Tap **"Show Math"** on any match card to see the live formula values substituted with real numbers — no black-box algorithm.

When a swap is completed, instead of a star rating that anyone can game, you confirm four verifiable claims (delivered on time, scope matched the agreement, portfolio evidence attached, would swap again). These feed directly into a **fairness score F** that affects future match rankings.

---

## The Math Model

The matching system is built on four functions from discrete mathematics models:

### Trust Score — T(u)
Measures how reliable a user is based on verifiable signals, not reputation alone.

```
T(u) = 0.2·P + 0.3·R̂ + 0.2·V̂ + 0.2·C + 0.1·Q

  P  = portfolio score        ∈ [0, 1]
  R̂  = normalized avg rating  = (R_avg − 1) / 4
  V̂  = normalized verification = V / 2  (V ∈ {0, 1, 2})
  C  = consistency score      ∈ [0, 1]
  Q  = communication score    ∈ [0, 1]
```

### Skill Fit — SF(u, v)
Measures bilateral skill overlap using set intersection. Both directions must work for a high score.

```
SF(u, v) = ( |O(u) ∩ R(v)| / |R(v)|  +  |O(v) ∩ R(u)| / |R(u)| ) / 2

  O(u) = skills user u offers   (a subset of the skill set S)
  R(u) = skills user u requests (a subset of S)
```

### Trust Compatibility — TC(u, v)
Geometric mean of both trust scores — both parties need decent trust for a high score.

```
TC(u, v) = √( T(u) · T(v) )
```

### Match Score — M(u, v)
The final ranking function. Skill fit is weighted slightly higher because the app is skill-first.

```
M(u, v) = 0.34·SF + 0.33·TC + 0.33·F

  F = Fairness
    = 0.35·deliveredOnTime + 0.35·scopeMatchedAgreement
    + 0.15·portfolioEvidenceAttached + 0.15·wouldSwapAgain
```

For new connections F defaults to 1.0. After a swap completes, F is computed from the four proof fields above and stored in the history record.

---

## Screens

| Screen | Route | Purpose |
|---|---|---|
| Intro | `/` | Carousel intro explaining the app concept |
| Login | `/auth/login` | Sign in |
| Register | `/auth/register` | Create account |
| Match Hub | `/transaction` | Ranked match list — Show Math, Request/Accept/Complete |
| Swap History | `/transaction/history` | Transparency ledger of completed swaps |

---

## How to Run It (for anyone with no terminal experience)

You do **not** need to clone this repo or run any commands. Just use the **Expo Go** app.

### Step 1 — Install Expo Go
- **iPhone:** [App Store → Expo Go](https://apps.apple.com/app/expo-go/id982107779)
- **Android:** [Play Store → Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Step 2 — Open the project link

Ask whoever is running the dev server (usually Midicable) to share the **QR code** or the **exp:// URL** that appears when they run:

```bash
cd client
npx expo start
```

The terminal will show a QR code. Scan it:
- **iPhone:** use the default Camera app, it detects it automatically
- **Android:** open Expo Go first, then tap "Scan QR code"

The app will load directly on your phone — no install, no build, no Xcode or Android Studio needed.

### Step 3 — Make sure you're on the same Wi-Fi

Expo Go connects to the dev server over your local network. Both phones need to be on the **same Wi-Fi network** as the computer running `expo start`. If that's not possible, the person running the server can switch to tunnel mode:

```bash
npx expo start --tunnel
```

Tunnel mode routes traffic through Expo's servers so any internet connection works, even across different networks. It's a bit slower but reliable for demos.

---

## How to Run It Yourself (if you have Node installed)

```bash
# 1 — Clone
git clone https://github.com/siSsyMidicable/Cogs128_Final_Project.git
cd Cogs128_Final_Project/client

# 2 — Install dependencies
npm install

# 3 — Fix the expo-router version mismatch (Expo 54 needs ~4.x, not 6.x)
npx expo install expo-router

# 4 — Start
npx expo start
```

Scan the QR code with Expo Go (same as above).

---

## Project Structure

```
client/
├── app/
│   ├── index.tsx                   ← Intro carousel (Screen 0)
│   ├── auth/
│   │   ├── login/index.tsx
│   │   └── register/index.tsx
│   └── transaction/
│       ├── index.tsx               ← Match Hub (main screen after login)
│       └── history/index.tsx       ← Swap history / transparency ledger
├── lib/
│   ├── auth/auth.ts                ← In-memory auth state
│   └── matching/
│       ├── matching.ts             ← Core math engine (T, SF, TC, M, history)
│       └── data.ts                 ← Mock users with realistic skill sets
└── components/
    └── ui/                         ← Shared UI components
```

---

## Known Issues / Version Notes

- `expo-router` in `package.json` lists `6.0.23` but Expo 54 ships with `~4.x`. Run `npx expo install expo-router` after cloning to auto-fix this.
- `react: 19.1.0` with `react-native: 0.81.5` is on the bleeding edge of the New Architecture. If you see random hook errors, try downgrading React to `18.3.x`.
- There is no backend. All state is in-memory (auth, matches, history). Refreshing the app resets everything — this is intentional for the demo.
