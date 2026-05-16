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

Ask whoever is running the dev server (usually Nachtoria) to share the **QR code** or the **exp:// URL** that appears when they run:

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

---

## 🔄 Git Guide — For Non-Technical Team Members

Not used to the terminal? This section explains everything you need to know to sync code with the team. No experience required.

### What Is Git?

Git is the tool that lets everyone on the team share code changes without overwriting each other's work. Think of it like a **shared Google Doc with a full edit history** — except for code.

- **GitHub** = the shared cloud copy (what everyone sees at this URL)
- **Your laptop** = your personal local copy

---

### The 4 Things You'll Do

#### 📥 1. `pull` — Get the latest code from the cloud

Someone on your team pushed new code to GitHub. Pull it down so your laptop has the latest version.

```bash
git pull origin main
```

> Do this **first thing** before you start working each day.

---

#### 🎒 2. `add` — Choose which files to save

You made some edits. Tell Git which files to include in your next save.

```bash
git add .
```

The `.` means "everything I changed." You can also name one specific file:

```bash
git add app/transaction/index.tsx
```

---

#### 📸 3. `commit` — Save a snapshot of your work

This locks in your changes with a short message. It saves to **your laptop only** — the cloud doesn't know yet.

```bash
git commit -m "describe what you changed here"
```

Good examples:
```bash
git commit -m "fix: transaction screen crash"
git commit -m "feat: add accept button to incoming screen"
git commit -m "style: update colors on hub screen"
```

---

#### 📤 4. `push` — Send your work up to the cloud

Your commit is saved locally. Now upload it to GitHub so teammates can see it.

```bash
git push origin main
```

---

### The Full Flow (Every Time You Work)

```
pull → make edits → add → commit → push
```

| Step | Command | What it does |
|------|---------|--------------|
| Get latest | `git pull origin main` | Downloads newest code from GitHub |
| Stage files | `git add .` | Picks which files to save |
| Save snapshot | `git commit -m "message"` | Saves to your laptop with a label |
| Upload | `git push origin main` | Sends to GitHub for the team |

---

### Someone Else Already Pushed — Do I Push Too?

**No.** If a teammate already pushed changes to GitHub, you just need to pull:

```bash
git pull origin main
```

Then reload Expo by pressing **`r`** in the Metro terminal. You only `push` when *you* made changes on your own laptop.

---

### Quick Reload Cheat Sheet

| Situation | What to do |
|-----------|-----------|
| Pulled new code from GitHub | Press `r` in the Metro terminal |
| Changed a file locally | Expo usually reloads automatically |
| Something looks frozen | Press `r` to force reload |
| Really broken | Press `Ctrl+C` to stop, then run `npx expo start` again |

---

### Common Problems

**"Command not found: npx"**
→ Node.js isn't installed. Go to [nodejs.org](https://nodejs.org) and install the LTS version.

**"Cannot connect to Metro"**
→ Make sure your phone and computer are on the same Wi-Fi. Try pressing `r` in the terminal.

**"Merge conflict"**
→ You and a teammate edited the same file at the same time. Ask your team who should keep their version, or reach out for help — don't panic, nothing is deleted.

**App crashes on a screen**
→ Pull the latest code first (`git pull origin main`), then reload (`r`).

---

*Built for COGS 128 — UC Merced*
