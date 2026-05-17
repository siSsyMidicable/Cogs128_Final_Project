# SkillSwap — COGS 128 Final Project
**UC Merced · Cognitive Engineering · Spring 2026**

SkillSwap is a peer-to-peer skill bartering app that matches people by what they can teach each other — no money involved. Built to demonstrate how discrete mathematics, set theory, and graph-theoretic matching can power a real mobile application.

---

## 🌐 Live Demo

| Link | Description |
|---|---|
| [▶ Launch Web App](https://sissymidicable.github.io/Cogs128_Final_Project/) | Full Expo web build — runs in any browser |
| [🕸 Trust Exchange Graph](https://sissymidicable.github.io/Cogs128_Final_Project/trust-exchange-graph.html) | Interactive Cytoscape.js visualization of interview data |

> **No install needed.** Click either link above to view the project immediately.

---

## 📋 Grading Navigation — Rubric Checklist

Everything the instructor needs to grade is linked directly below.

| # | Rubric Section | Where to Find It |
|---|---|---|
| 1 | **Proposal** | [`docs/FINAL_REPORT.md → Section 1`](docs/FINAL_REPORT.md#1-proposal) |
| 2 | **Interviews** | [`docs/FINAL_REPORT.md → Section 2`](docs/FINAL_REPORT.md#2-interviews) · Full transcripts: [`docs/interviews/`](docs/interviews/) |
| 3 | **Personas** | [`docs/FINAL_REPORT.md → Section 3`](docs/FINAL_REPORT.md#3-personas) |
| 4 | **Storyboard / Prototype** | [`docs/FINAL_REPORT.md → Section 4`](docs/FINAL_REPORT.md#4-storyboard--wireframe--paper-prototype) · [Live App](https://sissymidicable.github.io/Cogs128_Final_Project/) |
| 5 | **Evaluation / User Testing** | [`docs/FINAL_REPORT.md → Section 5`](docs/FINAL_REPORT.md#5-evaluation--user-testing) · Full report: [`docs/user-testing/`](docs/user-testing/) |
| 6 | **Project Manager** | [`docs/FINAL_REPORT.md → Section 6`](docs/FINAL_REPORT.md#6-project-manager-report) |

---

## 📁 Repository Structure

```
Cogs128_Final_Project/
│
├── 📄 README.md                        ← You are here — start here
│
├── 📂 docs/                            ← All written deliverables
│   ├── FINAL_REPORT.md                 ← Complete 30-pt rubric report
│   ├── Revised Proposal (PDF)          ← Original submitted proposal
│   ├── Personas                        ← Persona document
│   ├── interviews/
│   │   ├── Interviews-Data-for-SkillSwap.md   ← Full verbatim transcripts (10 participants)
│   │   └── SkillSwap_Data_Interview.md        ← Structured data sheet
│   └── user-testing/
│       └── SkillSwap-User-Testing-Critique-Report.md  ← Heuristic evaluation report
│
├── 📂 assets/                          ← Visual artifacts
│   ├── trust-exchange-graph.html       ← 🌐 Interactive interview data graph (Cytoscape.js)
│   └── skillswap_3d_clean.html         ← Early 3D network exploration
│
├── 📂 scripts/                         ← Math model explorations (Python)
│   ├── skillswap_model_v5.py           ← Annotated with discrete math concepts
│   ├── skillswap_model_v8.py           ← Per-user trust threshold iteration
│   └── skillswap_model_ui_modes.py     ← Named trust mode iteration
│
├── 📂 client/                          ← React Native app (Expo)
│   ├── app/
│   │   ├── index.tsx                   ← Intro carousel
│   │   ├── auth/login/                 ← Login screen
│   │   ├── auth/register/              ← Register screen
│   │   └── transaction/
│   │       ├── index.tsx               ← Match Hub (main screen)
│   │       ├── incoming/               ← Incoming swap requests
│   │       ├── ongoing/                ← Active swaps
│   │       └── outgoing/               ← Completed swap history
│   └── lib/
│       ├── matching/matching.ts        ← Core math engine (T, SF, TC, M)
│       └── matching/data.ts            ← Mock user dataset
│
└── 📂 server/                          ← Backend (in-memory, for demo)
```

---

## 🧮 The Math Model (Quick Reference)

The matching engine is built on four functions. All of these are live and inspectable in the app via the **"Show Math"** button on every match card.

### Trust Score — T(u)
```
T(u) = 0.2·P + 0.3·R̂ + 0.2·V̂ + 0.2·C + 0.1·Q
```

### Skill Fit — SF(u, v)
```
SF(u,v) = ( |O(u) ∩ R(v)| / |R(v)|  +  |O(v) ∩ R(u)| / |R(u)| ) / 2
```

### Trust Compatibility — TC(u, v)
```
TC(u,v) = √( T(u) · T(v) )
```

### Match Score — M(u, v)
```
M(u,v) = 0.34·SF + 0.33·TC + 0.33·F
  where F = 0.35·deliveredOnTime + 0.35·scopeMatchedAgreement
          + 0.15·portfolioEvidenceAttached + 0.15·wouldSwapAgain
```

> Full derivation and variable definitions: [`docs/FINAL_REPORT.md`](docs/FINAL_REPORT.md)

---

## ▶ How to Run Locally

### Option A — No install (Recommended for grading)
Just open the [live web app](https://sissymidicable.github.io/Cogs128_Final_Project/) in any browser.

### Option B — Expo Go (Mobile)
1. Install **Expo Go** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Clone the repo and run:
```bash
git clone https://github.com/siSsyMidicable/Cogs128_Final_Project.git
cd Cogs128_Final_Project/client
npm install
npx expo install expo-router
npx expo start
```
3. Scan the QR code with Expo Go

### Demo Login
```
Email:    si$sy@demo.com
Password: demo
```

---

## 🔄 Git Quick Reference (For Non-Technical Team Members)

```
pull → edit → add → commit → push
```

| Step | Command | What it does |
|---|---|---|
| Get latest | `git pull origin main` | Downloads newest code |
| Stage | `git add .` | Picks files to save |
| Save | `git commit -m "message"` | Snapshots your work |
| Upload | `git push origin main` | Sends to GitHub |

**Common fixes:**
- *"Cannot connect"* → same Wi-Fi, press `r` in terminal
- *"Merge conflict"* → ask the team, nothing is deleted
- *"Command not found: npx"* → install Node.js at [nodejs.org](https://nodejs.org)

---

*Built for COGS 128 — UC Merced · Spring 2026*
*Prototype Lead: GitHub [@siSsyMidicable](https://github.com/siSsyMidicable)*
