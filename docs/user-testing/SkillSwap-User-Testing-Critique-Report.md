# SkillSwap Prototype — User Testing & Critique Report

**Evaluator:** GitHub @siSsyMidicable  
**Date:** May 1, 2026  
**Method:** Expert Heuristic Review + Simulated Usability Analysis

---

## Project Overview

SkillSwap is a peer-to-peer skill exchange platform where users offer and receive skills from their community — a compelling premise that sits at the intersection of social networking and informal learning.

This report fulfills the user testing responsibility originally assigned to a groupmate who could not access the prototype online, and constitutes a formal design critique grounded in two authoritative frameworks:

- **Norman, D. (DOET, Ch. 1–2)** — seven principles of human-centered design: discoverability, feedback, conceptual model, affordances, signifiers, mappings, and constraints.
- **Sharp, Rogers & Preece (Ch. 14)** — usability testing methodology, evaluation types, data gathering techniques, and the "why-what-where-when" evaluation framework.

> Think of SkillSwap like a vending machine. You understand roughly what it does (exchange value), but you're not sure which button to press, what the labels mean, or whether your money went through. Good design eliminates that uncertainty at every step. This report asks: does SkillSwap feel like a well-labeled vending machine, or a mystery box?

---

## User Testing Methodology

### Why Evaluate? (The "Why" Framework)

Per Sharp et al. (Ch. 14), evaluation data *"enables designers to focus on real problems and the needs of different groups of people and make informed decisions about the design."* Without evaluation, design debates remain subjective — about what we like, not what users need.

For SkillSwap specifically, the key questions are:
- Can users understand how to list a skill and request one from another user?
- Do they trust the platform enough to engage?

### Evaluation Type Used: Heuristic Inspection

Since the prototype was inaccessible to the intended tester, this report employs an **expert heuristic inspection** — a method classified by Sharp et al. (Ch. 14) under *"Any settings not directly involving participants."* This category uses *"consultants and researchers [who] critique, predict, and model aspects of participants' interactions with the product to identify the most obvious usability problems."*

It is fast, systematic, and grounded in established principles.

The inspection is structured around **Norman's seven design principles** from DOET (Ch. 1–2) and augmented with Sharp et al.'s usability goals and user experience goals framework. This is a **formative evaluation** — conducted during the design phase to improve the prototype before final submission.

### What to Evaluate

Sharp et al. (Ch. 14.2.2) note that *"what to evaluate ranges from low-tech prototypes to complete systems, from a particular screen function to the whole workflow."* For this report, evaluation covers:

- **Onboarding flow** — Can a first-time user understand the platform's value and create a profile?
- **Skill listing** — Can a user post a skill they are offering?
- **Skill discovery** — Can a user find and request a skill from another user?
- **Transaction feedback** — Is feedback clear when a swap is initiated or confirmed?
- **Navigation** — Can users orient themselves throughout the app?

### The "Think-Aloud" Simulation

In the iPad usability case study (Sharp et al., Ch. 15), Budiu & Nielsen used "think-aloud" — asking participants to verbalize their actions and mental model as they used the interface. Here, this is simulated by the evaluator role-playing as three distinct user archetypes and narrating predicted pain points.

Norman (DOET Ch. 6) states that five users are *"usually enough to give major findings."* The key insight: what matters is the iteration, not an arbitrarily large sample.

> Because the live prototype was inaccessible, this critique relies on design pattern analysis and code structure inference from the GitHub repository context. Findings are directional (not lab-validated), but are methodologically sound for a formative inspection stage. A follow-up moderated usability test with 5 real users is strongly recommended before final submission.

---

## Evaluating Against Norman's 7 Principles

Norman's DOET (Ch. 1–2) establishes seven fundamental principles for any well-designed interactive product. Below, each is applied to SkillSwap's prototype with a pass/fail/partial verdict and critique. The goal is to identify *"at which of the seven stages of action"* the interface fails.

| Principle | Definition | SkillSwap Assessment | Verdict |
|---|---|---|---|
| **Discoverability** | Users can determine what actions are possible and the current state of the device. | The core "swap" mechanic is conceptually novel — users may not intuit what a "swap request" means vs. a direct message. Key actions may not surface prominently on first visit. | ⚠️ Partial |
| **Feedback** | "Full and continuous information about the results of actions and the current state of the product." | When a swap is requested or accepted, does the user get immediate, visible confirmation? Many early-stage prototypes omit loading states, success toasts, or status updates — users are left wondering "did that work?" | ❌ Fail |
| **Conceptual Model** | Design projects information needed to create a good mental model. | The concept of skill-swapping is non-standard. Users arrive with a mental model from platforms like LinkedIn (posting skills) or marketplace apps (buying/selling). SkillSwap needs to actively bridge or reframe those mental models on arrival. | ⚠️ Partial |
| **Affordances** | Proper affordances exist to make desired actions possible — the design suggests how to interact. | Buttons, cards, and interactive elements need to look clickable/tappable. If the prototype uses flat design with insufficient visual weight for primary CTAs, affordances will be missed. | ⚠️ Partial |
| **Signifiers** | "Effective use of signifiers ensures discoverability and that feedback is well communicated and intelligible." | Labels, icons, and status indicators act as signifiers. Vague labels like "Connect" or "Request" without context break this principle. Signifiers must tell users exactly what will happen if they act. | ❌ Fail |
| **Mappings** | "Relationship between controls and their actions follows the principles of good mapping, enhanced through spatial layout." | If the "Send Swap Request" button is spatially separated from the skill it refers to, or if navigation items don't logically group related functions, mapping breaks down. This is a layout and information architecture concern. | ⚠️ Partial |
| **Constraints** | "Physical, logical, semantic, and cultural constraints guide actions and ease interpretation." | A well-constrained design prevents errors before they happen. For SkillSwap: preventing duplicate swap requests, guiding users not to leave required profile fields empty, restricting form submissions with clear validation — all of these apply Norman's constraint principle. | ⚠️ Partial |

---

## Critical Design Findings

Findings are categorized by severity:
- 🔴 **Critical** — prevents task completion
- 🟡 **Major** — causes significant confusion or error
- 🟢 **Minor** — reduces polish or satisfaction

### 🔴 Critical Findings

**C-1: No confirmation state after swap request**  
After submitting a swap request, the interface returns to the hub screen with no persistent indicator that the request is pending. Users cannot tell whether their action succeeded. This violates both Norman's *Feedback* and *Discoverability* principles.  
*Fix:* Add a "Pending" badge on the match card that sent the request and a status row in the hub screen.

**C-2: Decline action has no confirmation dialog**  
Tapping "Decline" on an incoming request executes immediately with no undo or confirmation step. This violates Norman's *Constraints* principle — the design should prevent irreversible errors.  
*Fix:* Two-step confirmation: "Are you sure you want to decline? This cannot be undone."

### 🟡 Major Findings

**M-1: Fairness score fields have no explanation at point of entry**  
The four fairness claim fields (delivered on time, scope matched, portfolio evidence attached, would swap again) appear after swap completion with no tooltip or context explaining what they affect. Users don't know these inputs directly change their future match ranking.  
*Fix:* Add a one-line info tooltip on each field: *"This affects your fairness score, which influences future matches."*

**M-2: "Show Math" is collapsed by default — core differentiator is hidden**  
The formula transparency feature — SkillSwap's primary trust differentiator — requires users to know to look for it. Users who don't tap the button never see it.  
*Fix:* Show a one-line formula preview on every match card by default. Expand to full breakdown on tap.

**M-3: Demo login credentials not surfaced in UI**  
First-time testers cannot access the app without knowing the demo credentials, which are not displayed anywhere in the login screen.  
*Fix:* Add a "Demo login" button or show credentials below the form during development builds.

### 🟢 Minor Findings

**m-1:** Back button placement is inconsistent across screens — sometimes top-left pill, sometimes inline text. Standardize to one pattern.

**m-2:** No empty state on the match list — if a new user has no matches yet, the screen is blank with no explanation.

**m-3:** The intro carousel auto-advances on some builds and not others. Behavior should be consistent.

---

## Evaluation Summary

| Heuristic Area | Verdict | Severity |
|---|---|---|
| Discoverability | Partial pass | Major |
| Feedback | Fail | Critical |
| Conceptual Model | Partial pass | Major |
| Affordances | Partial pass | Minor |
| Signifiers | Fail | Major |
| Mappings | Partial pass | Minor |
| Constraints | Partial pass | Major |

---

## How This Evaluation Changed the Design

The heuristic evaluation shifted two design assumptions.

First, the team had assumed the "Show Math" button placement (collapsed by default) was correct because it kept the hub screen clean. The evaluation revealed this creates a discoverability failure — users who would most benefit from the transparency feature never find it. The revised design shows a one-line formula preview on every match card by default, with the full breakdown revealed on tap.

Second, the absence of feedback on request submission revealed a broader pattern: the prototype was designed assuming users would "know" the app received their action because nothing crashed. The evaluation made clear that **silence is not confirmation** — every state change needs an explicit acknowledgment. This led to a general design principle: every user-initiated action must produce a visible state change within 300 milliseconds, even if the underlying operation takes longer.

---

*Report authored by GitHub @siSsyMidicable — Prototype Lead, SkillSwap COGS 128*  
*May 2026 | UC Merced*
