# SkillSwap — COGS 128 Final Project Report
**UC Merced · Cognitive Engineering · Spring 2026**

**Group Members:** Eduardo Leyva · James Burlinson · Yongva Sean Yang · Shabach Karathi · Nachturia Rhetorica

---

> **Instructor Navigation — Rubric Sections**
>
> | # | Section | Points | Jump to |
> |---|---|---|---|
> | 1 | Proposal | 5 pts | [→ Section 1](#1-proposal) |
> | 2 | Interviews | 5 pts | [→ Section 2](#2-interviews) |
> | 3 | Personas | 5 pts | [→ Section 3](#3-personas) |
> | 4 | Storyboard / Wireframe / Paper Prototype | 5 pts | [→ Section 4](#4-storyboard--wireframe--paper-prototype) |
> | 5 | Evaluation / User Testing | 5 pts | [→ Section 5](#5-evaluation--user-testing) |
> | 6 | Project Manager | 5 pts | [→ Section 6](#6-project-manager-report) |
> | | **Total** | **30 pts** | |

---

## 1. Proposal

> *Full proposal document:* [`docs/Revised Proposal – Skill Swap _ Bartering App-2.pdf`](Revised%20Proposal%20%E2%80%93%20Skill%20Swap%20_%20Bartering%20App-2.pdf)

### Problem Space

Most people have skills others need, yet the only recognized exchange mechanism in modern society is money. This creates a hard barrier: someone who can design logos cannot help a neighbor fix their Wi-Fi even though both have exactly what the other needs, simply because neither has cash to spare. Informal skill trading happens constantly at the individual level (tutoring for editing, photography for makeup, carpentry for legal advice), but it stays informal because there is no trusted infrastructure for finding, vetting, and completing a trade with a stranger. The problem is not that people lack complementary skills — it is that there is no legible, trustworthy way to discover and execute a fair exchange.

### Target Users

SkillSwap targets three overlapping user groups. The first is **college students and early-career professionals** (ages 18–30) who have strong domain skills but limited income and high unmet needs in adjacent areas (graphic design, coding help, resume writing). The second is **freelancers and creative professionals** (ages 22–35) who already informally barter their work and need a more structured channel to find partners. The third is **community-rooted adults** (ages 35+) who are accustomed to neighborhood barter but lack a digital tool that replicates the trust and accountability of face-to-face exchange. All three groups share a single core behavior: they already trade skills informally. The app's job is to make that behavior safer, more discoverable, and fairer.

### Proposed Interaction Solution

SkillSwap is a mobile-first peer-to-peer skill exchange platform. Users create a profile listing skills they offer and skills they need. A discrete-math matching engine computes a **Match Score M(u,v)** for every pair using three components: Skill Fit (set-intersection overlap of offers and requests), Trust Compatibility (geometric mean of both trust scores), and Fairness (computed from verifiable proof fields after swap completion). The hub screen ranks potential partners by match score and shows a **"Show Math"** button on every card that reveals the live formula substituted with real numbers, making the algorithm fully transparent. When two users agree to swap, they proceed through request → accept → complete, at which point both parties confirm four verifiable claims (delivered on time, scope matched, portfolio evidence attached, would swap again) that feed directly into future match rankings. There are no star ratings that can be gamed; trust is earned through demonstrated behavior.

### Proposed Interviews

To validate the core assumptions about trust and fairness in skill exchange, we planned semi-structured interviews with 8–10 participants covering a range of ages, occupations, and prior experience with informal trading. Interview questions focused on: (1) prior experience with informal skill exchange, (2) what signals make a stranger trustworthy, (3) what makes a trade feel fair or unfair, and (4) reactions to the concept of an app-mediated exchange. Interview data would be used to build personas and calibrate the weights in the trust and fairness scoring functions.

### Current Designs in the Space

Existing platforms in this space include **TaskRabbit** (paid labor marketplace, no barter), **Simbi** (barter credits, discontinued), **TimeBanks USA** (hour-for-hour time currency, community-based), and **Craigslist barter section** (unstructured, no trust infrastructure). LinkedIn Skills endorsements surface skill data but have no exchange mechanism. None of these combine algorithmic skill matching, transparent formula display, and proof-based fairness scoring. SkillSwap's differentiator is that every match is backed by visible, inspectable math — not a black-box recommendation engine.

---

## 2. Interviews

> *Full verbatim transcripts:* [`docs/interviews/Interviews-Data-for-SkillSwap.pdf`](interviews/Interviews-Data-for-SkillSwap.pdf)
> *Structured data sheet:* [`docs/interviews/SkillSwap_Data_Interview.pdf`](interviews/SkillSwap_Data_Interview.pdf)

### Existing Questionnaires Consulted

The interview guide was developed using two established frameworks as its basis:

1. **Technology Acceptance Model (TAM) — Davis, F.D. (1989).** *"Perceived usefulness, perceived ease of use, and user acceptance of information technology."* MIS Quarterly, 13(3), 319–340. TAM's perceived usefulness and perceived ease-of-use constructs informed questions about whether participants could envision themselves using a digital platform for skill exchange and what barriers they anticipated.

2. **Trust in Online Environments — McKnight, D.H. & Chervany, N.L. (2001).** *"What trust means in e-commerce customer relationships."* International Journal of Electronic Commerce, 6(2), 35–59. This framework's dimensions of benevolence, competence, and integrity mapped directly onto the interview questions about what makes a stranger trustworthy in a skill-exchange context.

Both sources were used to ensure the interview covered the dimensions most likely to predict actual platform adoption, not just surface-level opinions.

### Participants

10 participants were interviewed (online threshold: 8–10 people ✓).

| # | Name | Age | Occupation |
|---|---|---|---|
| 1 | Alex | 21 | College Student |
| 2 | Maria | 28 | Freelance Graphic Designer |
| 3 | Daniel | 35 | IT Support Specialist |
| 4 | Jasmine | 19 | First-Year Student |
| 5 | Kevin | 42 | Small Business Owner |
| 6 | Lina | 24 | Photographer |
| 7 | Marcus | 31 | Gym Trainer |
| 8 | Emily | 22 | College Student |
| 9 | Robert | 58 | Retired Electrician |
| 10 | Linda | 61 | Part-Time Librarian |

### Summary of Takeaways (~200 words)

All ten participants had prior experience with informal skill exchange, confirming that the core behavior already exists without a dedicated platform. The most consistent finding was that **trust operates through signals, not gut feeling**: participants wanted concrete evidence (portfolio, past reviews, verification of identity) rather than just a profile photo and a name. A second consistent finding was that **fairness is not symmetry** — participants across all ages rejected the idea that a fair trade requires exactly equal monetary value. What mattered was mutual effort and agreement: if both parties clearly understood the terms and both walked away satisfied, the trade was fair regardless of market-rate equivalence. A third finding was a **locality preference**: older participants (Robert, Linda) strongly preferred trading with people nearby or within a verifiable community, while younger participants were more comfortable with digital strangers provided trust signals were strong. Finally, participants universally described **communication as a trust proxy**: slow or vague responses were interpreted as low reliability before any exchange even began. These findings validated the core design hypothesis that a skill-exchange platform must surface verifiable signals, not just profile data.

### How Interviews Guided Personas

Each interview was assigned to one group member who was responsible for translating the participant's specific trust signals, fairness logic, and skill profile into a persona. The trust aspects and fairness aspects columns in the structured data sheet (see link above) were extracted directly from interview transcripts and used as the raw material for each persona's quote, background summary, and behavioral description. Participants whose responses showed the clearest, most distinct behavioral patterns were selected as persona archetypes: Lina (creative trades, situational fairness), Kevin (formal agreements, reputation-driven), Robert (community trust, locality), Maria (time-parity fairness, portfolio-first), and Emily (system-guided fairness, ratings-dependent).

---

## 3. Personas

> *Full persona document:* [`docs/Personas`](Personas)

Five personas were developed, one per group member. Each is based directly on interview data.

---

### Persona 1 — Maria
**Contributor:** Nachturia Rhetorica

| Attribute | Detail |
|---|---|
| **Age** | 28 |
| **Gender** | Female |
| **Occupation** | Freelance Graphic Designer |
| **Status** | Freelance |
| **Skills Possessed** | Logo design, social media content, branding |
| **Skills Desired** | Photography, web development, branding advice |

> *"If I'm putting in 4 hours of work, I expect something that feels like 4 hours back. It doesn't have to be exact, but it should feel balanced."*

**Background:** Maria is a 28-year-old freelance graphic designer who leaned heavily on informal skill trading early in her career when paying clients were scarce. She exchanged logos and social media designs for photography, website help, and branding advice — trades that helped her build her business from the ground up. She requires legitimacy: a visible portfolio is non-negotiable, and slow or vague communication is an immediate red flag. Her fairness metric is time-based — she measures trades in hours of effort and expects rough parity.

**Interviewers who contributed:** Nachturia Rhetorica (primary), Yongva Sean Yang

---

### Persona 2 — Lina
**Contributor:** James Burlinson

| Attribute | Detail |
|---|---|
| **Age** | 24 |
| **Gender** | Female |
| **Occupation** | Freelance Photographer |
| **Status** | Freelance |
| **Skills Possessed** | Photography, photo editing, visual storytelling |
| **Skills Desired** | Makeup artistry, styling, social media promotion |

> *"It's not always equal, but it has to feel worth it."*

**Background:** Lina is a 24-year-old freelance photographer for whom informal skill trading is already routine. She regularly exchanges photoshoots for makeup, styling, and promotion — trades that are standard in creative industries. She is open to an app-based platform but holds a high bar: seriousness is read through the quality of someone's work, their communication, and their professionalism. Her sense of fairness is situational — exposure can be enough sometimes, while other situations call for something more tangible.

**Interviewers who contributed:** James Burlinson (primary), Yongva Sean Yang

---

### Persona 3 — Daniel
**Contributor:** Shabach Karathi

| Attribute | Detail |
|---|---|
| **Age** | 35 |
| **Gender** | Male |
| **Occupation** | IT Support Specialist |
| **Status** | Full-time employed |
| **Skills Possessed** | Computer repair, Wi-Fi troubleshooting, home repairs |
| **Skills Desired** | Homework help, tutoring, shared study notes |

> *"I'd want some form of verification. Like knowing they're a real person. Maybe linking a school or workplace email — something that shows accountability."*

**Background:** Daniel is a 35-year-old IT support specialist who regularly trades technical skills for practical help. He approaches digital platforms with a verification-first mindset: anonymous profiles are a non-starter. He wants identity accountability built into the system before he commits to any exchange, and he sets expectations explicitly upfront to avoid disagreements.

**Interviewers who contributed:** Shabach Karathi (primary), Nachturia Rhetorica

---

### Persona 4 — Kevin
**Contributor:** Yongva Sean Yang

| Attribute | Detail |
|---|---|
| **Age** | 42 |
| **Gender** | Male |
| **Occupation** | Small Business Owner |
| **Status** | Business owner |
| **Skills Possessed** | Bookkeeping, consulting, basic marketing |
| **Skills Desired** | Advanced marketing strategy, website design |

> *"Reputation is key. If I can see that someone has successfully completed multiple exchanges, that builds confidence. Clear agreements. Both sides need to define what they're offering and what they expect. Without that, misunderstandings happen."*

**Background:** Kevin is a 42-year-old small business owner who relied heavily on informal skill trading when starting out. He is open to a platform only if it clearly shows track records and reputations, and if it supports explicit, written-style agreements about who is doing what.

**Interviewers who contributed:** Yongva Sean Yang (primary), Eduardo Leyva

---

### Persona 5 — Robert
**Contributor:** Eduardo Leyva

| Attribute | Detail |
|---|---|
| **Age** | 58 |
| **Gender** | Male |
| **Occupation** | Retired Electrician |
| **Status** | Retiree |
| **Skills Possessed** | Electrical troubleshooting, circuit reading, NEC knowledge, hand tools |
| **Skills Desired** | Home repairs, local services |

> *"If it's through an app, I think it should be clear upfront… what each person is doing and how much effort it takes. If both people agree, then it's fair."*

**Background:** Robert is a retired electrician with deep roots in community-based skill exchange. He has spent decades in informal barter systems built on mutual trust and personal relationships. While open to a digital platform, he prioritizes verification, local proximity, and transparent agreements. He represents a trust-first archetype: the concept is familiar, but digital anonymity is the barrier.

**Interviewers who contributed:** Eduardo Leyva (primary), Nachturia Rhetorica

---

## 4. Storyboard / Wireframe / Paper Prototype

> *Live prototype:* [https://sissymidicable.github.io/Cogs128_Final_Project/](https://sissymidicable.github.io/Cogs128_Final_Project/)
> *Trust Exchange Graph:* [trust-exchange-graph.html](https://sissymidicable.github.io/Cogs128_Final_Project/trust-exchange-graph.html)

The prototype is a fully functional React Native / Expo web application. The following analysis follows **Sharp, Rogers & Preece, Chapter 12, Tables 12.1 and 12.2**.

### Appearance and Data

The interface uses a dark-mode palette (#0d1120 background, #38bdf8 accent) that signals a technical, trustworthy product aligned with the fintech and social-app conventions participants already recognize. All data displayed to the user is real and computed: match scores, trust score breakdowns, and fairness values are all derived from the actual matching engine in `client/lib/matching/matching.ts`. There are no placeholder values or hardcoded strings in the production screens. The **"Show Math"** panel surfaces the live formula with real substituted numbers, reinforcing the data-forward design language.

### Functionality and Interactivity

The prototype supports the full swap lifecycle end-to-end:
1. **Register / Login** — account creation with credential validation
2. **Match Hub** — ranked list of potential partners, sortable, with match score badges
3. **Show Math** — expandable formula panel on each match card
4. **Send Request** — initiates a swap proposal
5. **Incoming Requests** — accept or decline incoming proposals
6. **Complete Swap** — four-field proof form + optional star rating + review comment
7. **Swap History** — ledger of all completed exchanges with fairness breakdowns

All state transitions are handled in `client/lib/matching/matching.ts` and persist within the session.

### Spatial Structure and Materials

The app follows a tab-based navigation structure with three primary spaces: **Hub** (discover and request), **Incoming** (manage received requests), and **History** (transparency ledger). This maps directly to the three stages of a swap: find → agree → review. The spatial separation prevents cognitive overload by ensuring users only see actions relevant to the current stage. Card-based layout with consistent vertical rhythm ensures scanability on both mobile and web viewports.

### Resolution and Scope

The prototype operates at **mid-to-high fidelity**: it uses production-quality visual design, real computed data, and functional navigation, but relies on in-memory state (no persistent database) and a mock user dataset. This resolution is appropriate for the formative evaluation stage — sufficient to test all primary user flows without requiring backend infrastructure.

### Intangibles — The "It" Factor

The defining intangible of SkillSwap is **algorithmic transparency as a trust signal**. Every other matching platform (dating apps, job boards, skill marketplaces) uses a black-box recommendation engine. SkillSwap inverts this: the formula is the feature. Tapping "Show Math" does not reveal a marketing abstraction — it reveals the actual weighted sum with real numbers. This transforms the match from something that happens *to* the user into something they can *reason about*, which directly addresses the core trust barrier identified in all ten interviews.

---

## 5. Evaluation / User Testing

> *Full evaluation report:* [`docs/user-testing/SkillSwap-User-Testing-Critique-Report.pdf`](user-testing/SkillSwap-User-Testing-Critique-Report.pdf)

### Comparison with Existing Technologies

SkillSwap was evaluated against **TimeBanks USA** as the primary comparison technology.

| Dimension | TimeBanks USA | SkillSwap |
|---|---|---|
| Matching method | Manual search + coordinator | Algorithmic M(u,v) = 0.34·SF + 0.33·TC + 0.33·F |
| Trust mechanism | Community vouching | Weighted trust score T(u) with verifiable inputs |
| Fairness model | 1 hour = 1 credit (fixed) | Proof-based fairness F from 4 verifiable claims |
| Formula transparency | None | Full formula on every match card |
| Onboarding friction | High (coordinator approval) | Low (self-serve) |
| Dispute mechanism | Coordinator mediation | In-app proof fields + history ledger |

### Evaluation Method (Chapter 14)

This evaluation used a **Heuristic Inspection**, classified by Sharp et al. (Ch. 14) under *"Any settings not directly involving participants."* This method was selected because the live prototype was inaccessible to the intended external tester, making a moderated usability test impractical. Heuristic inspection is appropriate for this stage: it is fast, systematic, grounded in established principles, and well-suited for identifying the most critical usability failures before a live user test.

The inspection framework is **Norman's seven design principles** (DOET, Ch. 1–2): Discoverability, Feedback, Conceptual Model, Affordances, Signifiers, Mappings, and Constraints.

### Adherence to Evaluation Criteria (Chapter 9 Methods)

Following Sharp et al. Ch. 9 (data gathering techniques), the evaluation used:
- **Think-aloud simulation**: the evaluator role-played three user archetypes (new user, experienced trader, skeptic) and narrated predicted pain points at each screen transition
- **Interaction logging**: all prototype screens were traced sequentially with attention to missing feedback states, ambiguous labels, and unmapped controls
- **Expert review**: findings were cross-checked against Norman's seven principles and Sharp et al.'s usability and UX goals framework

### Results (~300 words)

**Why evaluate?** Per Sharp et al. (Ch. 14), evaluation enables designers to focus on real problems rather than preferences. For SkillSwap, the key evaluation questions were: (1) can a first-time user understand how to list a skill and request one from another user, and (2) does the platform inspire enough trust to prompt engagement?

**What was evaluated?** The full five-screen flow: onboarding, skill listing, skill discovery, swap request, and swap history.

**Critical findings (prevent task completion):**
- **C-1: No confirmation state after swap request.** After submitting a request, the interface returns to the hub with no persistent pending indicator. Users cannot determine whether their action succeeded. Violates Norman's *Feedback* principle.
- **C-2: Decline has no confirmation dialog.** Tapping Decline executes immediately with no undo. One mis-tap permanently removes an incoming request. Violates Norman's *Constraints* principle.

**Major findings (significant confusion or error):**
- **M-1: Fairness fields have no in-context explanation.** The four proof fields appear after swap completion with no tooltip explaining that they affect future match rankings.
- **M-2: "Show Math" is collapsed by default.** SkillSwap's primary trust differentiator is hidden unless the user knows to tap it.
- **M-3: Demo credentials not visible.** First-time testers cannot enter the app without prior knowledge of the demo login.

**Minor findings:** Inconsistent back button placement across screens; no empty state on the match list for new users.

### How Evaluation Changed the Design (~200 words)

The heuristic evaluation shifted two design decisions that the team had previously treated as settled.

The first was the placement of the **"Show Math"** feature. The team had defaulted to collapsing it to keep the hub screen clean. The evaluation surfaced this as a **discoverability failure** — a user who doesn't know the feature exists never benefits from it. The revised design shows a one-line formula preview on every match card by default, with the full breakdown expanding on tap.

The second shift was a **broader design principle about feedback.** The prototype was built with the implicit assumption that users would infer success from the absence of errors. The evaluation made explicit that silence is not confirmation: every user-initiated action must produce a visible state change. This led to adding pending badges, success toasts, and explicit status rows throughout the transaction flow.

Both changes illustrate the core value of formative evaluation: they corrected assumptions the design team had made without realizing they were assumptions at all.

---

## 6. Project Manager Report

**Project Manager:** Nachturia Rhetorica

### Project Timeline

| Week | Milestone | Status |
|---|---|---|
| Week 1 (Mar 31) | Proposal submitted, problem space defined | ✅ Complete |
| Week 2 (Apr 7) | Interview guide drafted, participants recruited | ✅ Complete |
| Week 3 (Apr 14) | All 10 interviews conducted | ✅ Complete |
| Week 4 (Apr 17) | Personas finalized (5 personas, 1 per member) | ✅ Complete |
| Week 5 (Apr 24) | Prototype v1 built (Expo, matching engine) | ✅ Complete |
| Week 6 (May 1) | User testing / heuristic evaluation completed | ✅ Complete |
| Week 7 (May 8) | Prototype v2 — feedback improvements implemented | ✅ Complete |
| Week 8 (May 15) | GitHub repo organized, Pages deployed | ✅ Complete |
| Week 9 (May 17) | Final report submitted | ✅ Complete |

### Project Budget (Estimated Development Cost)

| Category | Estimate |
|---|---|
| Frontend engineer (React Native, 6 months) | $54,000 |
| Backend engineer (Node.js + PostgreSQL, 6 months) | $54,000 |
| UX/UI designer (part-time, 6 months) | $24,000 |
| Cloud infrastructure (AWS/GCP, 6 months) | $3,600 |
| Authentication service (Auth0 or Clerk) | $1,200 |
| Push notifications (Expo / Firebase) | $600 |
| Domain + SSL + monitoring | $500 |
| User testing rounds (3 × $500 participant compensation) | $1,500 |
| **Total estimated MVP cost** | **~$139,400** |

The largest cost driver is engineering labor. The math engine and matching logic already exist in this prototype and would transfer directly to production, reducing backend engineering scope by approximately 30%.

### Hurdles to Clear for Success

1. **Cold-start problem.** A skill-exchange platform is worthless without a critical mass of users on both sides of every skill category. The first 500 users must be seeded deliberately — likely through university partnerships where the user base is dense and skills are highly varied.

2. **Trust bootstrapping.** New users have no reviews, no history, and no trust score. The platform needs a grace-period mechanism (verified student/employee email as a trust proxy) to let new users appear credible before completing any swaps.

3. **Dispute resolution.** When a swap goes badly (scope creep, no-show, quality dispute), the current prototype has no resolution mechanism. A production version needs a mediation flow before it can handle real users.

4. **Legal and liability.** Skill exchanges involving regulated services (legal advice, medical guidance, financial planning) create liability exposure. The platform needs clear terms of service excluding regulated professional services.

5. **Retention.** Once a user finds a regular swap partner, they have no incentive to remain on the platform. The product needs features that drive ongoing discovery (new skill categories, community events, seasonal needs).

### Progress Report

All five rubric deliverables were completed on schedule. The prototype is fully functional and deployed to GitHub Pages. The matching engine, interview data, personas, and evaluation report are all in the repository and linked from the README.

The primary deviation from the original plan was in the user testing section: the group member assigned to conduct user testing was unable to access the prototype and did not communicate this until the deadline was near. The prototype lead (Nachturia Rhetorica) completed the evaluation independently using heuristic inspection, which is a valid and methodologically sound alternative per Sharp et al. Ch. 14.

### What We Would Do Better

The single most impactful change would be **establishing communication norms in week one, not week eight.** The project encountered significant coordination failures not because group members lacked capability, but because there was no agreed-upon communication channel, no shared deadline tracker, and no escalation path when a member went silent.

From a management perspective, the lesson is that **process is not overhead, it is the product.** A weekly 15-minute sync, a shared task board, and a simple rule ("if you're blocked, say so within 24 hours") would have prevented most of the late-stage scramble. The technical work was the easy part. The group dynamics were the actual project management problem, and that is not a technical problem, it is a communication design problem.

---

*Submitted Srping, 2026 · COGS 128 · UC Merced*
*Prototype Lead & Project Manager: Nachturia Rhetorica (GitHub: [@siSsyMidicable](https://github.com/siSsyMidicable))*
